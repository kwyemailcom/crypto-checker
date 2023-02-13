//@ts-ignore
import {DataTypes, InferAttributes, InferCreationAttributes, Model, Op} from 'sequelize';
import {sequelize} from "./index";
import {WalletHistoryCode} from "../@types/Code";

export class WalletHistory extends Model<InferAttributes<WalletHistory>, InferCreationAttributes<WalletHistory>>{
    declare idx?: number;
    declare user_idx: number;
    declare wallet_idx: number;
    declare debit_currency: string;
    declare debit_network: string;
    declare debit: number;
    declare debit_balance: number;
    declare credit: number;
    declare credit_currency: string;
    declare credit_balance: number;
    declare exchange_rate: number;
    declare usdt_price?: number;
    declare reason: number;
    declare currency: string;
    declare created_at: Date;
    declare changed_at?: Date;
    declare status?: string;
    declare deposit_address?: string;
    declare deposit_tag?: string;
    declare withdrawal_address?: string;
    declare withdrawal_tag?: string;
    declare tx?: string;
}

WalletHistory.init({
    idx:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_idx:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    wallet_idx: {
        type:DataTypes.INTEGER,
        allowNull: false
    },
    debit_currency: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    debit_network: {
        type:DataTypes.STRING,
    },
    debit: {
        type:DataTypes.DOUBLE,
        allowNull:false
    },
    debit_balance: {
        type:DataTypes.DOUBLE,
        allowNull:false
    },
    credit: {
        type:DataTypes.DOUBLE,
        allowNull:false
    },
    credit_currency: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    credit_balance: {
        type:DataTypes.DOUBLE,
        allowNull:false
    },
    exchange_rate: {
        type:DataTypes.DOUBLE,
        allowNull:false
    },
    usdt_price: {
        type:DataTypes.DOUBLE,
        allowNull:true
    },
    reason: {
        type:DataTypes.SMALLINT,
        allowNull: false
    },
    currency: {
        type:DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type:DataTypes.DATE,
        defaultValue: new Date()
    },
    changed_at: {
        type:DataTypes.DATE
    },
    status: {
        type:DataTypes.STRING,
        defaultValue: 'complete'
    },
    deposit_address: {
        type:DataTypes.STRING,
        allowNull: true
    },
    deposit_tag: {
        type:DataTypes.STRING,
        allowNull: true
    },
    withdrawal_address: {
        type:DataTypes.STRING,
        allowNull: true
    },
    withdrawal_tag: {
        type:DataTypes.STRING,
        allowNull: true
    },
    tx: {
        type:DataTypes.STRING,
        allowNull: true
    },
}, {sequelize, tableName:'wallet_history', timestamps:false});

export const insert = async (user_idx: number, wallet_idx: number, debit_currency: string, debit_network: string, debit:number, debit_balance:number,
                             credit_balance:number, credit: number, credit_currency: string, exchange_rate:number,
                             reason:number, currency:string, status:string, tx: string, deposit_address:string, deposit_tag: string, usdt_price:number, option={}) => {
    const data:any = {
        user_idx,
        wallet_idx,
        debit_currency,
        debit_network,
        debit,
        debit_balance,
        credit,
        credit_currency,
        credit_balance,
        exchange_rate,
        reason,
        currency,
        status,
        usdt_price,
        deposit_address,
        deposit_tag,
        created_at: new Date(),
        //changed_at: new Date(),
        tx,
    };
    return await WalletHistory.create(data, option);
}

