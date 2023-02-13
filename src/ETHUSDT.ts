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
import {WalletAddresses} from "./maria/WalletAddresses";
import {Op} from "sequelize";
import {Expression} from "mongoose";
import AWSHttpProvider, {AMB_HTTP_ENDPOINT} from './aws/aws-http-provider';
import {parseNumbers} from "xml2js/lib/processors";
import {sendTronWithPrivateKey} from "./TRON";


const INFURA_API_KEY = 'https://mainnet.infura.io/v3/4181507473444d5fae237c81cbb5a3d8';  // kwy@email
const INFURA_SOCKET_KEY = 'wss://mainnet.infura.io/ws/v3/4181507473444d5fae237c81cbb5a3d8';

const COMPANY_ETH_ADDRESS = '0x1F68F46a6FE16CFfCe85d730dffddcb8d2d57C7b';
const COMPANY_USDT_ADDRESS = '0x1F68F46a6FE16CFfCe85d730dffddcb8d2d57C7b';
const ETH_WITHDRAWAL_ADDRESS = '0x45b5c8910b354e118C75C37F5A8224891f381D14';
const ETH_WITHDRAWAL_PRIVATE_KEY = '0x4118e7ec0274cc7892d9c35ee0f434e3d9c83a08b03d5afd1e4bca26554bb3bb';


const USDT_CODE = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}];

const USDT_DECIMAL = 1000000;
const web3 = new Web3(INFURA_API_KEY);

let watchList: any = [];
let searchAddressTime = 0;

const runETHUSDT = async ()=>{
    try {
        await checkAddress();
        await checkBalance();
    }
    catch (err:any){
        console.log(err.message);
    }
}

const fetchWithTimeout = async (url: string) =>{
    const controller = new AbortController();
    const {signal} = controller;
    const timeout = setTimeout(() => {
        controller.abort();
    }, 5000);
    const request = await fetch(url, {signal});
    clearTimeout(timeout);
    try {
        return await request.json();
    } catch (error) {
        return null;
    }
}

const checkBalance = async () => {
    try {
        const clone = [...watchList]
        for (let i = 0; i < clone.length; i++) {
            const start_time = new Date().getTime();
            try {
                const address = clone[i].address;
                const private_key = clone[i].private;
                // @ts-ignore
                const contract = new web3.eth.Contract(USDT_ABI, USDT_CODE, {from: address});
                const usdt_balance = await contract.methods.balanceOf(address).call();
                if(Number(usdt_balance) >= 100000){
                    // 먼저 가스비가 있는지 확인한다.
                    const balance_wei = await web3.eth.getBalance(address);
                    const eth_balance = Number(web3.utils.fromWei(balance_wei, 'ether'));
                    if(eth_balance < 0.001){
                        await transferETH(ETH_WITHDRAWAL_ADDRESS, address, ETH_WITHDRAWAL_PRIVATE_KEY, 0.002);
                    }
                    // 회사 계정으로 보낸다.
                    await sleep(10000);
                    await transferUSDT(address, COMPANY_USDT_ADDRESS, private_key, Number(usdt_balance));
                }
                console.log('eth usdt check balance oK: ' + new Date());
            } catch (error: any) {
                console.log('eth usdt check balance error: ' + error.message + ':' + new Date());
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

const transferETH = async (from_address: string, to_address: string, private_key: string, amount: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            let gas_price = Number(await web3.eth.getGasPrice());
            gas_price = Math.round(gas_price*1.2);
            const value = web3.utils.toWei(amount.toString(), 'ether');
            const value_number = Number(value);
            const transaction:any = {
                from: from_address,
                to: to_address,
                gasPrice: web3.utils.toHex(gas_price),
            };
            const gas_limit = await web3.eth.estimateGas(transaction);
            transaction.gas = gas_limit;
            // 정확히 빼면 튕길때가 있다.
            transaction.value = web3.utils.toHex(Math.floor(value_number - (gas_price*gas_limit) - 100000));
            const nonce = await web3.eth.getTransactionCount(from_address, 'latest');
            transaction.nonce = nonce;
            const signedTx = await web3.eth.accounts.signTransaction(transaction, private_key);
            if (!signedTx.rawTransaction)
                return resolve(false);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                if (!error) {
                    console.log('eth transfer 성공');
                    return resolve(hash);
                } else {
                    console.log('eth transfer 실패');
                    return reject(error);
                }
            });
        }
        catch (error){
            return reject(error);
        }
    });
}

const transferUSDT = async (from_address: string, to_address: string, private_key: string, usdt_balance:number) => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const contract = new web3.eth.Contract(USDT_ABI, USDT_CODE, {from: from_address});
            const transaction:any = {
                from: from_address,
                to: USDT_CODE,
                value: "0x0",
                data: contract.methods.transfer(to_address, usdt_balance).encodeABI(),
            };
            const gas_limit = await contract.methods.transfer(to_address, usdt_balance).estimateGas({from: from_address});
            transaction.gas = Math.round(gas_limit*2);  // 2배로 해준다.
            const signedTx = await web3.eth.accounts.signTransaction(transaction, private_key);
            if (!signedTx.rawTransaction)
                return resolve(false);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, async (error, hash) => {
                if (!error) {
                    // DB에 기록한다.
                    await WalletCollection.increament('USDT','ERC20',usdt_balance / 1000000, '', from_address, '');
                    return resolve(hash);
                } else {
                    return reject(error);
                }
            });
        }
        catch (error){
            console.log('transferUSDT 에서 에러 발생');
            return reject(error);
        }
    });
}

const checkAddress = async () => {
    try {
        const time_clone = new Date(searchAddressTime);
        searchAddressTime = new Date().getTime();
        const address_list = await WalletAddressesCollection.WalletAddresses.findAll({
            where: {
                name: 'USDT',
                network: 'ERC20',
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
    console.log('eth list checking:' + new Date());
    setTimeout(()=>{
        checkAddress();
    }, 10*1000)
}

const sleep = (ms:number) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

export default runETHUSDT;


