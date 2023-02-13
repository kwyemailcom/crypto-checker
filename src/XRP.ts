import * as xrpl from 'xrpl'
import WebSocket from 'ws';
// @ts-ignore
import Big from 'big-js';
import * as WalletCollection from './maria/Wallet';
import * as WalletHistoryCollection from './maria/WalletHistory';
import * as WalletAddressesCollection from './maria/WalletAddresses';
import * as WalletMissingCollection from './maria/WalletMissing';
import * as MoneysCollection from './maria/Moneys';
import {WalletHistoryCode} from "./@types/Code";
import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";
import {TransactionStream} from "xrpl";


/*``````````````````````````````````````````````````````````````````````
xrp 주소: rD9ATMaY3q9poRJSHDX2E8wYUPxiYywYoP
private: ED4EB77089C3DC097412CCBC724B68E0775CFEC5E83F42E3EE6EBF97C676D88B69
public: EDF226801E0250CEF1C5DBAA46FC1D20EEAA7EC37A93FDFBEF7757C92380029BC6
 */

const XRP_SERVER = 'wss://xrplcluster.com/';
const XRP_ACCOUNT = ["rD9ATMaY3q9poRJSHDX2E8wYUPxiYywYoP"];
// 내지갑 주소
//const XRP_COMPANY_ACCOUNT = "rf9K5w1NRGtva1wuEt2uQEhnRXp88L6sEC";
// 화사 지갑 주소
const XRP_COMPANY_ACCOUNT = "rsfBgUgNGhg9tmxqgJXttxbkAHX87QGVo8";

// 테스트
//const XRP_SERVER = 'wss://s.altnet.rippletest.net:51233';
//const XRP_ACCOUNT = ["rD9ATMaY3q9poRJSHDX2E8wYUPxiYywYoP"];
//const XRP_COMPANY_ACCOUNT = "rpzxBDDJ1Y7TMdkijr7tx2fgRceCtZ9Vmw";

const XRP_SEED = 'sEdV5oAKg3NL8bzzaPepD6H8nfy6xj9';


let client:xrpl.Client | null;
let disconnectedCount = 0;

const wallet = xrpl.Wallet.fromSeed(XRP_SEED);

const run = async ()=>{
    try {
        setTimeout(()=>{
            checkClient();
        }, 60*1000);
        await initXRPClient();
    }
    catch (err:any){
        console.log(err.message);
    }
}

const checkClient = async () => {
    if(!client || !client.isConnected()){
        if(disconnectedCount > 3){
            await initXRPClient();
        }
        else{
            disconnectedCount++;
        }
    }
    else{
        disconnectedCount = 0;
    };
    // 핑을 한번 날린다.
    const ping: any = await client!.request({
        "id": Math.round(new Date().getTime()/1000),
        "command": "ping"
    });
    console.log('ping 결과: '+ping['status']);
    setTimeout(()=>{
        checkClient();
    }, 60*1000)
}

const initXRPClient = async () => {
    try {
        client?.disconnect();
        client = null;
        client = new xrpl.Client(XRP_SERVER);
        client.on('disconnected', async () => {
            console.log('xrpl disconnected: ' + new Date());
            await initXRPClient();
        });
        client.on('connected', async () => {
            console.log('xrpl server connected: ' + new Date());
            // 구독을 신청한다.
            await client!.request({
                id: 'accounts_subscribe',
                command: "subscribe",
                accounts: XRP_ACCOUNT
            });
        });
        client.on('transaction', async (tx) => {
            await onTransaction(tx);
        });
        await client.connect();
    }
    catch (error){
        console.log('xrp initial error');
    }
}

const onTransaction = async (tx:TransactionStream) => {
    try {
        console.log(tx.transaction.TransactionType + " transaction sent by " +
            tx.transaction.Account +
            "\n  Result: " + tx.meta?.TransactionResult +
            " in ledger " + tx.ledger_index +
            "\n  Validated? " + tx.validated);
        //@ts-ignore
        const destination = tx.transaction?.Destination;
        if (XRP_ACCOUNT.indexOf(destination) < 0) {
            console.log('받은 주소가 틀려 나갑니다');
            return;
        }
        else{
            console.log('받은 주소를 확인 했습니다');
        }
        console.log(`받은 주소: ${destination}`);
        const result = tx.meta?.TransactionResult;
        console.log(`결과: ${result}`);
        const transaction_type = tx.transaction.TransactionType; // 이 값은 Payment 여야 한다.
        console.log(`트랜잭션 형태: ${transaction_type}`);
        const tx_hash = tx.transaction.hash;
        if (transaction_type === "Payment") {
            if (typeof tx.meta?.delivered_amount === "string") {
                const amount_in_drops = new Big(tx.meta.delivered_amount);
                // 받은 돈의 액수
                const xrp_amount = amount_in_drops.div(1e6);
                console.log("Received " + xrp_amount.toString() + " XRP.");
                // destination detail 을 구해야 한다.
                const detail_response: any = await client!.request({
                    "command": "tx",
                    "transaction": tx_hash,
                    "binary": false
                });
                //
                const destination_tag = (detail_response?.result.DestinationTag) ? detail_response.result.DestinationTag : '';
                // 본 지갑으로 돈을 이전한다.
                let send_state = false;
                let send_count = 0;
                if(Number(xrp_amount.toPrecision(4)) < 1){
                    console.log('max 액수가 1보다 작아 진행을 하지 않습니다');
                    return;
                }
                while (!send_state && send_count < 4) {
                    try {
                        send_count++;
                        const prepared: any = await client!.autofill({
                            "TransactionType": "Payment",
                            "Account": wallet.address,
                            "Amount": xrpl.xrpToDrops(xrp_amount - 0.1),
                            "Destination": XRP_COMPANY_ACCOUNT
                        });
                        const max_ledger = prepared.LastLedgerSequence;
                        console.log('max ledger: '+ max_ledger);
                        const fee = xrpl.dropsToXrp(prepared.Fee);
                        console.log(`Transaction cost: ${fee}`);
                        const signed = wallet.sign(prepared);
                        console.log("Identifying hash:", signed.hash);
                        // 사인한 것을 제출한다.
                        const send_tx = await client!.submitAndWait(signed.tx_blob);
                        const send_hash = send_tx.result.hash;
                        // 보낸 결과를 확인한다.
                        const detail_send: any = await client!.request({
                            "command": "tx",
                            "transaction": send_hash,
                            "binary": false
                        });
                        if (detail_send.result.validated) {
                            console.log('회사 주소로 입금을 했습니다');
                            send_state = true;
                        } else {
                            console.log('send failed');

                        }
                    }
                    catch (error){
                        console.log('전송 에러: ' + error);
                    }
                }
                if(!send_state){
                    console.log('sending error!!!!!');
                }
                if (!destination_tag) {
                    console.log('태그 값이 없습니다');
                    await WalletMissingCollection.WalletMissing.create({
                        currency: 'XRP',
                        tx: tx_hash,
                        created_at: new Date()
                    });
                } else {
                    // DB에 기록한다.
                    await WalletCollection.increament('XRP', 'XRP', xrp_amount, tx_hash!, destination, destination_tag);
                }
                return
            } else {
                console.log("Received non-XRP currency.");
                return
            }
        } else {
            console.log(`코인 송급이 아닙니다: ${transaction_type}`);
            return;
        }
    }
    catch (error:any){
        console.log(error)
    }
};




export default run;


