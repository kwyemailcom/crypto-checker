// blockchain.com
// kwy.seo@gmail.com
// 비번: _1보쿰비번


import WebSocket from 'ws';
import Web3, {Modules} from "web3";
import * as WalletCollection from './maria/Wallet';
import * as WalletHistoryCollection from './maria/WalletHistory';
import * as WalletAddressesCollection from './maria/WalletAddresses';
import * as WalletMissingCollection from './maria/WalletMissing';
import * as MoneysCollection from './maria/Moneys';
import {WalletHistoryCode} from "./@types/Code";
import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";
import {Op} from "sequelize";
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';
//@ts-ignore
import * as explorers from 'bitcore-explorers';

const ECPair = ECPairFactory(ecc);
const NETWORK = bitcoin.networks.bitcoin;
const validator = (
    pubkey: Buffer,
    msghash: Buffer,
    signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);


const blockchain_url = 'wss://ws.blockchain.info/inv';
const COMPANY_BTC_ADDRESS = 'bc1qyte8gzy4qfmx2rpuh0wcwtm030elakz6y9yyyp';

export default class BTC{

    ws:WebSocket | null = null;
    searchAddressTime = new Date(new Date().getTime() - 10*365*24*60*60*1000).getTime();
    addressList: any = [];
    // 아마존 세팅이 특이해서 포트 포워딩을 해 줘야 외부에서 접속할 수 있다.
    rpcURL = 'http://3.38.189.16:9335/'
    id_no = 0;
    confirmationLimit = 1; // 6번 confirmation 을 받아야 코인을 다시 전송할 수 있다고 한다. 속도를 위하여 줄인다.
    awaitTimeLimit = 120; // 120분
    constructor() {
        (async()=>{
            try {
               //const result = await this.transfer(
               //    'c649b40d7ffd6f05dc3d368a69f6b5fb06c73759b35e128fbd58d9c8bae4d30b',
               //    '14MbqeNJabrMDPnsTSrNFAPht4SNjzKeP5',
               //    'L2EARmTFaFRZqVCMX555rjq73Q8YnCx7AU3YFksY6MbgQ6R6iXyr',
               //    COMPANY_BTC_ADDRESS, 0.003*100000000);
               //const temp = result;
                //await this.getConfirmationCount('c649b40d7ffd6f05dc3d368a69f6b5fb06c73759b35e128fbd58d9c8bae4d30b');
                await this.initBTCClient();
                setTimeout(()=>{
                    this.checkClient();
                }, 30*1000);
            }
            catch (err:any){
                console.log(err.message);
            }
        })();
    }

    async getBlockCount(){
        try{
            const response = await this.postWithTimeout("getblockcount", []);
            if(response.error)
                return 0;
            else
                return response.result;
        }
        catch (error:any){
            console.log(error.message);
            return 0;
        }
    }

    async getConfirmationCount(tx_id:string){
        try{
            const response = await this.postWithTimeout("getrawtransaction", [tx_id, true]);
            if(response.error)
                return 0;
            else
                return response.result.confirmations;
        }
        catch (error:any){
            console.log(error.message);
            return 0;
        }
    }

    async getRowTransaction(tx_id:string){
        try{
            const response = await this.postWithTimeout("getrawtransaction", [tx_id]);
            if(response.error)
                return '';
            else
                return response.result;
        }
        catch (error:any){
            console.log(error.message);
            return '';
        }
    }

    async sendRowTransaction(hex:any){
        try{
            const response = await this.postWithTimeout("sendrawtransaction", [hex]);
            if(response.error)
                return '';
            else
                return response.hex;
        }
        catch (error:any){
            console.log(error.message);
            return '';
        }
    }

    //todo: bitcoin core 에서 발라스를 계산하는 방법을 넣어야 한다.
    // bitcoin core 는 기본적으로 자기 지갑에 있는 것만 발라스를 얻을 수 있음으로 importaddress 명령으로
    // 관리하는 주소를 넣어야 한다.
    async getBalance(address: string){
        let url = 'https://blockchain.info/rawaddr/' + address;
        let options: any = {};
        options['headers'] = {'http-verb':'GET'};
        try {
            let response = await this.getWithTimeout(url, options);
            return response.final_balance;
        }
        catch (e) {
            return 0;
        }
    }

    async estimateFee(block:number | null = null){
        if(!block)
            block = 1;
        const default_fee = 0.002;
        try{
            const response = await this.postWithTimeout("estimatesmartfee", [block]);
            if(response.error)
                return default_fee;
            else
                return response.result.feerate;
        }
        catch (error:any){
            console.log(error.message);
            return default_fee;
        }
    }

    // blockchin.info에 utxo인 트랜잭션의 트랜잭션 아이디를 구하는 api
    // https://blockchain.info/unspent?active=place_bitcoin_address_here
    // bitcoin core에서 지갑에 없는 주소의 utxo를 구할려면 먼저 importaddress 함수로 그 주소를 bitcoin core에 등록해야 한다.
    // 그리고 listunspent 명령을 사용하면 된다고 한다.
    async transfer(tx_id: string, from_address:string, from_private_key:string, to_address: string, amount: number, fee=0){
        const keyPair = ECPair.fromWIF(from_private_key);
        const p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const psbt = new bitcoin.Psbt();
        const row_transaction = await this.getRowTransaction(tx_id);
        psbt.addInput({
            hash: tx_id,
            index: 0,
            //redeemScript: p2pkh.redeem?.output,
            nonWitnessUtxo: Buffer.from(row_transaction, 'hex') //
        });
        // 수수료를 뺀 값을 전송해야 한다.
        psbt.addOutput({
            address: to_address,
            value: Math.floor(amount - fee),
        });
        psbt.signInput(0, keyPair);
        if(psbt.validateSignaturesOfInput(0, validator)){
            psbt.finalizeAllInputs();
            const transaction = psbt.extractTransaction();
            if(fee===0){
                const fee_rate = await this.estimateFee(7); // 7은 내 마음대로 넣은 거다,
                const virtual_size = psbt.extractTransaction().virtualSize();
                const fee = fee_rate*virtual_size*100000000;
                //const fee = fee_rate*virtual_size;
                if(amount < fee){
                    console.log('amount is smaller than fee');
                    return;
                }
                await this.transfer(tx_id, from_address, from_private_key, to_address, amount, fee);
            }
            else{
                const hex = transaction.toHex();
                const send_hex = await this.sendRowTransaction(hex);
                if(send_hex){
                    // DB에 기록한다.
                    await WalletCollection.increament('BTC', 'BTC', amount/100000000, send_hex, from_address, '');
                }
            }
        }
        else{
            console.log('transaction validation error');
        }
    }

    // todo: 이 방식은 사용자가 많아지면 랙이 걸린다. 나중에 소켓으로 체크하는 방식으로 바꾼다.
    async checkConfirmationCount(tx_id: string, value:number, address: string, private_key: string, start_time: number){
        const now = new Date();
        if(start_time < now.getTime() - this.awaitTimeLimit*60*1000){
            // 제한 시간을 초과했으면 더 이상 찾지 않는다. 수동으로 처리한다.
            // 소켓으로 하면 이런 문제가 발생하지 않는다.
            return;
        }
        const confirmation_count = await this.getConfirmationCount(tx_id);
        if(!confirmation_count || confirmation_count==='undefined' || confirmation_count < this.confirmationLimit){
            setTimeout(async () => {
                await this.checkConfirmationCount(tx_id, value, address, private_key, start_time);
            }, 120 * 1000);  // 2분에 한번씩 체크한다.
        }
        else{
            const balance = await this.getBalance(address);
            if(!balance || balance < value){
                setTimeout(async () => {
                    await this.checkConfirmationCount(tx_id, value, address, private_key, start_time);
                }, 120 * 1000);  // 2분에 한번씩 체크한다.
            }
            else{
                // 이체한다.
                await this.transfer(tx_id, address, private_key, COMPANY_BTC_ADDRESS, value);
            }
        }
    }

    async postWithTimeout(method: string, params: any){
        this.id_no++;
        if(this.id_no > 10000000)
            this.id_no = 1;
        const body = {
            "jsonrpc":"1.0",
            "id": `${this.id_no}`,
            "method":method,
            "params":params
        };
        const controller = new AbortController();
        const {signal} = controller;
        const timeout = setTimeout(() => {
            controller.abort();
        }, 10000);
        try {
            const request = await fetch(this.rpcURL, {
                signal, ...{
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        "content-type": "text/plain;",
                        "Authorization": "Basic " + Buffer.from("bitcoinrpc:bitcoinrpc").toString('base64')
                    }
                }
            });
            clearTimeout(timeout);
            const result = await request.json();
            return result;
        }catch (err){
            return null;
        }
    }

    async getWithTimeout(url: string, option:any={}){
        const controller = new AbortController();
        const {signal} = controller;
        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000);
        const request = await fetch(url, {signal, ...option});
        clearTimeout(timeout);
        try {
            return await request.json();
        } catch (error) {
            return null;
        }
    }

    /*
    async checkClient(){
        this.ws?.send(JSON.stringify({
            "op": "ping"
        }))
        if(this.ws)
            await this.addAddress(this.searchAddressTime);
        setTimeout(()=>{
            this.checkClient();
        }, 10*1000)
    }
     */

    async checkClient(){
        try {
            if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
                await this.initBTCClient();
            }
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    "op": "ping"
                }));
                console.log('send ping');
                await this.addAddress(this.searchAddressTime);
            }
        }
        finally {
            setTimeout(()=>{
                this.checkClient();
            }, 10*1000)
        }
    }

    async addAddress(time: number | null = null){
        const where:any = {
            where: {
                name: 'BTC'
            },
            order: [['created_at', 'DESC']],
        };
        if(time){
            where.where['created_at'] = {[Op.gt]: time};
        }
        const address_list = await WalletAddressesCollection.WalletAddresses.findAll(where);
        if(!time)
            this.addressList = [];
        for (let i = 0; i < address_list.length; i++) {
            const target = address_list[i];
            if (i === 0) {
                this.searchAddressTime = target.created_at.getTime();
            }
            // 작동하지 않는 것 같다.
            //this.subscribe(target.address);
            this.addressList.push({
                currency: target.name,
                address: target.address,
                private: target.private,
                user_idx: target.user_idx,
            });
        }
    }

    //deprecated
    subscribe(address:string){
        this.ws?.send(JSON.stringify({
            "op": "addr_sub",
            "addr": `${address}`
        }));
    }

    async initBTCClient(){
        try {
            if(this.ws){
                this.ws.terminate();
                this.ws = null;
            }
            this.ws = new WebSocket(blockchain_url);
            this.ws.on('open', async()=>{
                await this.addAddress();
                //this.subscribe('14MbqeNJabrMDPnsTSrNFAPht4SNjzKeP5');
                this.ws?.send(JSON.stringify({
                    "op": "unconfirmed_sub"
                }));
            });
            this.ws.on('message', (data)=>{
                this.onMessage(data);
            });
        }
        catch (error){
            console.log('BTC initial error');
        }
    }

    async onMessage(data:any){
        const result = JSON.parse(data);
        if(result.op === 'pong'){
            console.log('pong');
        }
        else if(result.op === 'utx'){
            for(let i = 0; i < result.x.out.length; i++){
                const out = result.x.out[i];
                const receiver_address = out.addr;
                const target = this.addressList.find((x:any)=>x.address===receiver_address);
                if(target){
                    setTimeout(async ()=>{
                        await this.checkConfirmationCount(result.x.hash, out.value, target.address, target.private, new Date().getTime());
                    }, 1000);
                }
            }
            console.log('utx received');
        }
    }

}