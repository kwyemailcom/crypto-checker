import {Sequelize, ConnectionError, ConnectionTimedOutError, TimeoutError} from 'sequelize';
import tunnel from 'tunnel-ssh';

const mariaconfig = {
    "development": {
        "username": "admin",
        "password": "rjsemfwlak",
        "database": "smilebit",
        "host": "smilebit.covbz579fsps.ap-northeast-2.rds.amazonaws.com",
        // "host": "103.1.251.231",
        "dialect": 'mariadb'
    },
    "test": {
        "privateKey" : `-----BEGIN RSA PRIVATE KEY-----
MIIEoQIBAAKCAQEAxWMG89McH14b8doEiVuAq52RA/M263eKzNxGoUhVq61YSoSb
LBWypzazC6yZS2LWnOQtjQ8Hvpy4JH2PS0FLjxvfsHAMXMTo4i/uipIyeyAmQz5N
+5Md+OKx/dSyfqrUGb0SlkkjKKILdP8on3y82gVqd0cqsWVUBG8V0fKAKAoMK1qM
tngMcbiQ5hMNbf7AW/YD5suvxAwjfHPsKypet8gewCCIOycEkaQ+DtKJnpyQyVyo
mk1cMlHhlEILGcQEgNXtNYXjS4Tkhu2jIYFR2bc5oQnG7a8hQmcaR+MbATVcK36A
OElEpwG0mZTiWCnY9M2P1kUsP1pxJxgUFXtOcwIDAQABAoIBAQDAqIJdtF2LpFCE
RDcPVpeFajrj7x1YwQpiIFJ0E2VDNuOpgDrw0ZDZswMZTvMk6Kju46wuNVBq1Q7K
1x7o5id43Ez+Kq92UN+5/ezHpiDNmrieA48cESE9Dw+J4HQEPHrfUHN26pX9kAS8
wlwFJzwxVP3wxC7AjVVvKnnSvO4npMes1j43YAljq/GdunMHapfl/eoeazBu3dPt
dtuHPoJAXmVcfSJw3fHvT3q/z7sMx0Wb+CebQvojM28W1eAEB3VIu9CNM3V4nK3+
g6U8Hsc9UZE4Wsq6TD2y7VwO8VL4p0J6GgHpBE1eyvycJkMRl/m/x7yESDYN85w3
mGACN+BJAoGBAOs4shppwS+yMAauK0nh6RQfXyC0+CRWzyXglRhFCTBhnbE9QeXj
JM5JprT4RyOQ8/JnOQa50npZ0TTkjBtr8KODmQPSS1STazcH0vbp78piEB53GvQw
eMlzMGilPdej85XRAwtQ2y208hzE1RMW+4tnUzn33F8jjtkINR/VHA7HAoGBANbS
vOSPYz5+6SP8qqEaG36aUYgBm7Zid7e/Z9Wbf71iAVf7BpAiZ0jyIOGpGy5sMbIg
6hzEPjzCh23K+Q84Oy3bqxE8cNGb/kLbUz80rtSx4CQwUvuGFoXJ2L3TDIpt1BwY
oV9F1HHiUcHxuIA+ESyvRwD3Be3K83Es/c8984b1AoGASmKKiCnLav7piyNHEz06
zR9CoQA5vJwrM+o6nAsw5bjo+mTJ0x4qxIWsD2y4annre0vDT+oxsnl23EguOnm/
BqaWHAxDwEJCVIvH3keKijDKsieuQWyWtfYUZ/NhhDEX1dfcI5b1SRYAvrJMQ5Yw
BByvyBQm/3sqMF4VFrT5A38CgYAjI5WCTXIOZvP7zviaIYsdymBLvveZfcHXbJev
eSAL+lv96DHKodYDOJfoUaEAlvIKERg6XF9R0QAWFX1n3+rONYBl8V0C7GFKzlVv
oU53vCDNypnISsakW7/4TO1gN1bawayjyOhXOI3nC4MCdySYCpOytLVjkC8B9DoQ
DDIpgQJ/anvqW5Sw3UDHa0rKJJkGJ8FNHhWbxB6cshtKlShXBkX8vaPPvBcfOOkv
ripYf8esEtf38keXs3fLz8pcAf6Y2nW7+DmkoARiUBo+rZHn0I/OxfMjiPzxKUjt
z3YyqAGZQtw2p+O8PGjNU9YwTKcGBARHGXcO0CADabSDInBLRQ==
-----END RSA PRIVATE KEY-----`,
        "keepAlive": true,
        "host" : '54.242.0.217',
        "username": "margin",
        "password": "!qazxsw2",
        "database": "margindb",
        "dialect": "mariadb"
    },
    "production": {
        "username": "admin",
        "password": "rjsemfwlak",
        "database": "smilebit",
        "host": "smilebit.covbz579fsps.ap-northeast-2.rds.amazonaws.com",
        //"host": "103.1.251.231",
        "dialect": "mariadb"
    },
    "retry_max": 3
}

const mariadbType = 'development';

export const sequelize = (()=>{
    // @ts-ignore
    if(mariadbType === 'test'){
        const target = mariaconfig.test;
        let connection:any = null;
        console.log('try test db connection');
        const tnl = tunnel({
            host: target.host,
            privateKey:target.privateKey,
            port: 22,
            dstHost:'127.0.0.1',
            dstPort: 3606,
        }, function(){
            console.log('test db connection success');
            const db = new Sequelize(
                target.database,
                target.username,
                target.password,
                {
                    host: "127.0.0.1",
                    //@ts-ignore
                    dialect: target.dialect,
                    acquire: 60000,
                    idle: 10000,
                    dialectOptions:{
                        requestTimeout: 3000
                    },
                    retry: {
                        match: [
                            ConnectionError,
                            ConnectionTimedOutError,
                            TimeoutError,
                            /Deadlock/i,
                            target.dialect.toUpperCase+'_BUSY'],
                        max: 3
                    },
                    logging:false
                }
            )
            connection = db;
        }).on('error', e =>{
            console.log(e.message);
        });
        while(connection===null){
            //console.log('wait for test db connection');
        }
        return connection;
    }
    else{
        const target = mariaconfig.development;
        return new Sequelize(
            target.database,
            target.username,
            target.password,
            {
                host: target.host,
                //@ts-ignore
                dialect: target.dialect,
                retry: {
                    match: [
                        ConnectionError,
                        ConnectionTimedOutError,
                        TimeoutError,
                        /Deadlock/i,
                        target.dialect.toUpperCase+'_BUSY'],
                    max: 3
                },
                logging:false
            }
        )
    }
})();