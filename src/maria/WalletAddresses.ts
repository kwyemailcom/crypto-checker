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
import * as WalletCollection from "./Wallet";
import {AbortController} from "node-abort-controller";
import fetch from "node-fetch";
import * as WalletHistoryCollection from "./WalletHistory";
import {WalletHistoryCode} from "../@types/Code";
import * as MoneysCollection from "./Moneys";

export class WalletAddresses extends Model<InferAttributes<WalletAddresses>, InferCreationAttributes<WalletAddresses>>{
    declare idx?: number;
    declare name: string;
    declare network: string | null;
    declare user_idx: number;
    declare address: string;
    declare private: string;
    declare public: string;
    declare tag: string;
    declare deleted_at?: Date;
    declare created_at: Date;
}

WalletAddresses.init({
    idx:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    network: {
        type:DataTypes.STRING,
    },
    user_idx:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    address: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    private: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    public: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    tag: {
        type:DataTypes.STRING,
        defaultValue: ''
    },
    deleted_at: {
        type:DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type:DataTypes.DATE,
        defaultValue: new Date()
    },
}, {sequelize, tableName:'wallet_addresses', timestamps:false});





