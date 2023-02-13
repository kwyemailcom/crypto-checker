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

export class WalletMissing extends Model<InferAttributes<WalletMissing>, InferCreationAttributes<WalletMissing>>{
    declare idx?: number;
    declare currency: string;
    declare tx: string | undefined;
    declare created_at: Date;
}

WalletMissing.init({
    idx:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    currency: {
        type:DataTypes.STRING
    },
    tx: {
        type:DataTypes.STRING
    },
    created_at: {
        type:DataTypes.DATE,
        defaultValue: new Date()
    },
}, {sequelize, tableName:'wallet_missing', timestamps:false});