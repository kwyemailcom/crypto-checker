//@ts-ignore
import TronWeb  from 'tronweb';
import {Op} from "sequelize";
import * as WalletAddressesCollection from "./maria/WalletAddresses";
import {Schema} from "mongoose";
import * as WalletCollection from "./maria/Wallet";

//const HttpProvider = TronWeb .provider.HttpProvider;


// USDT TRC-20 Contract Addresses
//Shasta TestNet: TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs
//Nile TestNet: TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
//Main Net: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t


// const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
// const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
// const eventServer = new HttpProvider('https://api.shasta.trongrid.io/');
// const contractAddress = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
const fullNode = 'https://api.trongrid.io';
const solidityNode ='https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io/';
// USDT 의 contract 주소
const contractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

//https://www.trongrid.io 에서 발급받는다.
//const apiKey = 'd8d0c19d-a931-496f-a766-2ef486544804';
//const apiKey = '644395ae-4b43-4947-b74c-3e08a89088e6';
const apiKey = '384513da-234b-4d68-b833-86174128d11f';  // kwy@email.com
// 이게 뭐에 대한 private key인지 생각이 안나네...
//const privateKey = "08089C24EC3BAEB34254DDF5297CF8FBB8E031496FF67B4EFACA738FF9EBD455";
// privite_key가 들어가 있음으로 이것의 트랜잭션만 가능하다.
let tronWeb:any = null;

const TRON_WITHDRAWAL_ADDRESS = 'TRufXnJPRjoYX2E4iB217bQeojutGUpwQT';
const TRON_WITHDRAWAL_PRIVATE_KEY = '70A4E8EC30D2D933160DE51DBEB98F41592265D286A6B8EE1CC74E9BC93EE765';

const COMPANY_TRON_ADDRESS = 'TVArW1U3m6KqR4gQw8a3aUgSWrUnGv3Roe';

let watchList: any = [];
let searchAddressTime = 0;

let contractNode:any = null;

const runTronUSDT = async ()=>{
    try {
        await initTronWeb();
        setTimeout(()=>{
            checkAddress();
        }, 10*1000);
        await checkBalance();
    }
    catch (err:any){
        console.log(err.message);
    }
}

const initTronWeb = async () => {
    if(tronWeb){
        // todo: 어떻게 close 시키냐?
        //tronWeb.close(); close 함수가 없다.
        tronWeb = null;
        watchList = [];
        searchAddressTime = 0;
    }
    tronWeb = new TronWeb (fullNode, solidityNode, eventServer, TRON_WITHDRAWAL_PRIVATE_KEY);
    tronWeb.setHeader({"TRON-PRO-API-KEY": apiKey});
    const contract = await tronWeb.contract().at(contractAddress);
    console.log('USDT Subscribing...');
    /* 서버를 구축하지 못하면 데이터를 다 가져오지 못하니까 일단 보류
    contract.Transfer().watch(async(err: any, event: any) => {
        if (err) {
            console.log(err.message);
        } else {
            const name = event.name;
            const confirmed = !event.unconfirmed;
            const tx = event.transaction;
            const from_address = tronWeb.address.fromHex(event.result.from);
            //const to_address = tronWeb.address.fromHex(event.result['1']); 둘다 같다
            const to_address = tronWeb.address.fromHex(event.result.to);
            const value = Number(event.result.value);  // 문자열이다.
            console.log(to_address);
            // confirmed 되었는지 확인해야 하는데, confirmed 가 항상 false 다.
            // transaction 이 올라오고 바로 catch 가 되서 false 인 것 같다.
            const target = watchList.find((x:any) => x.address===to_address);
            if(target){
                await checkConfirmed(tx, to_address, value, target.private);
            }
        }
    });
    */
}

const checkConfirmed = async (tx: string, to_address: string, value: number, private_key: string, try_limit = 60) => {
    const tron_balance = await tronWeb.trx.getBalance(to_address);
    const contract = await tronWeb.contract().at(contractAddress);
    const balance = await contract.methods.balanceOf(to_address).call();
    const balance_2 = Number(balance);
    if(balance_2 && balance_2 >= value){
        // 이제 옮겨 준다.
        if(tron_balance < 20000000) {
            await sendTronWithPrivateKey(TRON_WITHDRAWAL_ADDRESS, TRON_WITHDRAWAL_PRIVATE_KEY, to_address, 10000000);
        }
        await sendUSDTWithPrivateKey(to_address, private_key, COMPANY_TRON_ADDRESS, value, tx);
    }
    else {
        try_limit--;
        if(try_limit > 0) {
            setTimeout(async () => {
                await checkConfirmed(tx, to_address, value, private_key, try_limit);
            }, 6000); // 6초에 한번씩
        }
    }
}

const checkBalance = async () => {
    try {
        const clone = [...watchList];
        for (let i = 0; i < clone.length; i++) {
            const start_time = new Date().getTime();
            try {
                const address = clone[i].address;
                const private_key = clone[i].private;
                const contract = await tronWeb.contract().at(contractAddress);
                const balance = await contract.methods.balanceOf(address).call();
                const balance_2 = Number(balance);
                if (balance_2 && balance_2 >= 500000) {
                    const tron_balance = await tronWeb.trx.getBalance(address);
                    let weiter = true;
                    if (tron_balance < 10000000) {
                        weiter = await sendTronWithPrivateKey(TRON_WITHDRAWAL_ADDRESS, TRON_WITHDRAWAL_PRIVATE_KEY, address, 20000000);
                    }
                    if(weiter)
                        await sendUSDTWithPrivateKey(address, private_key, COMPANY_TRON_ADDRESS, balance_2, '');
                }
                console.log('usdt check balance oK: ' + new Date());
            } catch (error: any) {
                console.log('usdt check balance error: ' + error.message + ':' + new Date());
            }
            finally{
                const end_time = new Date().getTime();
                const temp = end_time - start_time;
                const interval = 1400 - (end_time - start_time);
                console.log(interval);
                if(interval > 0)
                    await sleep(interval);
            }
        }
    }
    finally {
        setTimeout(async ()=>{
            await checkBalance();
        }, 500);
    }
}

const checkAddress = async () => {
    try {
        // todo: 연결이 살아 있는지 테스트 해 봐야 하는 것 아닌가?
        if(!tronWeb){
            const status = tronWeb.isConnected();
        }
        const time_clone = new Date(searchAddressTime);
        searchAddressTime = new Date().getTime();
        const address_list = await WalletAddressesCollection.WalletAddresses.findAll({
            where: {
                name: 'USDT',
                network: 'TRC20',
                created_at: {[Op.gt]: time_clone}
            }
        });
        for(let i = 0; i < address_list.length; i++){
            watchList.push({
                address:address_list[i].address,
                private:address_list[i].private,
            });
        }
    }
    catch (error:any){
        console.log(error.message);
    }
    console.log('list checking:' + new Date());
    setTimeout(()=>{
        checkAddress();
    }, 10*1000)
}

export const generateRandomAddress = async ():Promise<{
    address: string | undefined,
    private_key: string,
    public_key: string
}> => {
    try{
        const account = await tronWeb.createAccount();
        return {
            address: account.address.base58, private_key: account.privateKey, public_key: account.publicKey
        }
    }
    catch (error){
        return {address: undefined, private_key:'', public_key:''}
    }
}

export const sendToken = async(to_address: string, amount: number) => {
    const { abi } = await tronWeb.trx.getContract(contractAddress);
    let contract = await tronWeb.contract.at(contractAddress);

    const resp = await contract.methods.transfer(to_address, amount).send();
    console.log("transfer:", resp);
}

export const sendTronWithPrivateKey = async(from_address: string, private_key: string,
                                            to_address: string, amount: number) => {
    try {
        const transaction_object = await tronWeb.transactionBuilder.sendTrx(
            to_address,
            amount,
            from_address
        );
        const signedtxn = await tronWeb.trx.sign(
            transaction_object,
            private_key
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        );
        return true;
    }
    catch (error:any){
        console.log('error: tron transaction' + error);
        return false;
    }
}

export const sendUSDTWithPrivateKey = async(from_address: string, private_key: string,
                                            to_address: string, amount: number, tx: string) => {
    try {
        const transaction_object = await tronWeb.transactionBuilder.triggerSmartContract(
            contractAddress,
            'transfer(address,uint256)',
            {
                feeLimit: 10000000,
                callValue: 0
            },
            [{
                type: 'address',
                value: to_address
            }, {
                type: 'uint256',
                value: amount
            }],
            tronWeb.address.toHex(from_address)
        );
        const signedtxn = await tronWeb.trx.sign(
            transaction_object.transaction,
            private_key
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        );
        // 여기까지 오면 전송에 성공한 것이다. 기록한다.
        await WalletCollection.increament('USDT', 'TRC20', amount / 1000000, tx, from_address, '');
        return true;
    }
    catch (error:any){
        console.log('error: USDT-TRC20 Transaction' + error);
        return false;
    }
}

const sleep = (ms:number) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}


export default runTronUSDT;


