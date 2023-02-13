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

export class Moneys extends Model<InferAttributes<Moneys>, InferCreationAttributes<Moneys>>{
    declare idx?: number;
    declare user_idx: number;
    declare code: number;
    declare currency: string;
    declare network: string | null;
    declare address: string;
    declare tag: string;
    declare quantity: number;
    declare status: number;
    declare reg_ip: string;
    declare reg_dt: Date;
    declare upt_dt: Date;
}

Moneys.init({
    idx:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_idx:{
        type: DataTypes.INTEGER,
    },
    code: {
        type:DataTypes.INTEGER
    },
    currency: {
        type:DataTypes.STRING
    },
    network: {
        type:DataTypes.STRING
    },
    address: {
        type:DataTypes.STRING
    },
    tag: {
        type:DataTypes.STRING
    },
    quantity: {
        type:DataTypes.DOUBLE
    },
    status: {
        type:DataTypes.TINYINT
    },
    reg_ip: {
        type:DataTypes.TINYINT
    },
    reg_dt: {
        type:DataTypes.DATE
    },
    upt_dt: {
        type:DataTypes.DATE
    },
}, {sequelize, tableName:'moneys', timestamps:false});