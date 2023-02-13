import {
    Sequelize,
    DataTypes,
    Model,
    //@ts-ignore
    InferAttributes, InferCreationAttributes, CreationOptional, Optional,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    Association} from 'sequelize';
import {sequelize} from "./index";
import {WalletHistory} from "./WalletHistory";
import {WalletHistoryCode} from "../@types/Code";
import {AbortController} from "node-abort-controller";
import fetch from "node-fetch";
import * as WalletHistoryCollection from "./WalletHistory";
import * as MoneysCollection from "./Moneys";
import * as WalletAddressesCollection from './WalletAddresses';
import * as WalletMissingCollection from './WalletMissing';

export class Wallet extends Model<InferAttributes<Wallet>, InferCreationAttributes<Wallet>> {
    declare idx?: number;
    declare user_idx: number;
    declare currency: string;
    declare quantity: number;
    declare available_quantity: number;
    declare updated_at: Date;
}

Wallet.init({
    idx: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_idx: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    quantity: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    available_quantity: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    updated_at:{
        type:DataTypes.DATE,
        defaultValue: new Date()
    }
}, {sequelize, tableName:'wallets', timestamps:false});

export const increament = async(currency: string, network: string, increase_amount:number, tx_hash: string, address: string, tag: string) => {
    try {
        const query:any = {
            where: {
                name: currency,
                address: address,
                //address: 'rD9ATMaY3q9poRJSHDX2E8wYUPxiYywYoP',
                //tag: 65407
            }
        };
        if(tag){
            query.where.tag = tag;
        }
        const target = await WalletAddressesCollection.WalletAddresses.findOne(query);
        if (target) {
            const user_idx = target.user_idx;
            // 지갑 잔고를 늘린다.
            try {
                let amount = currency==='XRP'? Number(increase_amount.toPrecision(4)):increase_amount;
                amount = roundTo(amount);
                await Wallet.increment(
                    {quantity: amount, available_quantity: amount},
                    {
                        where: {
                            currency: currency,
                            user_idx: user_idx
                        }
                    });
                const wallet_data = await Wallet.findOne({
                    where: {
                        currency: currency,
                        user_idx: user_idx
                    }
                });
                if (!wallet_data)
                    return;
                // 기록을 남긴다.
                // 먼저 USDT 가격을 구한다.
                let usdt = increase_amount;
                if(currency !== 'USDT') {
                    const controller = new AbortController();
                    const {signal} = controller;
                    const timeout = setTimeout(() => {
                        controller.abort();
                    }, 5000);
                    const url = `https://www.binance.com/api/v3/ticker/price?symbol=${currency}USDT`;
                    const request = await fetch(url, {signal});
                    clearTimeout(timeout);
                    try {
                        const result = await request.json();
                        usdt = Number(result['price']);
                    } catch (error) {
                        console.log('usdt 가격을 가져오는데 실패');
                    }
                }
                await WalletHistoryCollection.insert(user_idx, wallet_data.idx!, currency, network, amount, wallet_data.available_quantity,
                    0, 0, '', 1, WalletHistoryCode.deposit, '', 'complete', tx_hash!, address, tag,usdt * amount);
                await MoneysCollection.Moneys.create({
                    user_idx: user_idx,
                    code: 1,
                    currency: currency,
                    network: network,
                    address: address,
                    tag:tag,
                    quantity: amount,
                    status: 2,
                    reg_ip: '',
                    reg_dt: new Date(),
                    upt_dt: new Date()
                });
                console.log('입금 처리 완료');
            } catch (error: any) {
                console.log(error.message);
            }
        }
    }
    catch (error){
        console.log('wallet error');
    }
}

const roundTo = (num:number, length=8) => {
    let str = num.toString();
    const e_index = num.toString().indexOf('e');
    if(e_index > 0){
        str = num.toFixed(length + 1);
    }
    //@ts-ignore
    return +(Math.round(str + `e+${length}`)  + `e-${length}`);
}

