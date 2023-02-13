import mongoose from "mongoose";

const pConnection = mongoose.createConnection('mongodb+srv://seo01:_1rjsemfwlak@cluster0.tscin.mongodb.net/dading?retryWrites=true&w=majority');
// 내 테스트 DB
//const tConnection = mongoose.createConnection('mongodb+srv://sa:rjsemfwlak@cluster0.60vvn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
const tConnection = mongoose.createConnection('mongodb+srv://seo01:_1rjsemfwlak@cluster0.tscin.mongodb.net/dading?retryWrites=true&w=majority');

// 다딩 서버 이전 것
const oldConnection = mongoose.createConnection('mongodb+srv://sa:rjsemfwlak@cluster0.mcovq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

export {pConnection, tConnection, oldConnection}