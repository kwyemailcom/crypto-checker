import runXRP from "./XRP";
import BTC from './BTC';
import runTRON from './TRON';
import runTronUSDT from "./TRONUSDT";
import runETH from "./ETH";
import runETHUSDT from "./ETHUSDT";

(async()=>{
    try {
       await runXRP();
       const btc = new BTC();
       await runTRON();
       //await runTronUSDT();
       await runETH();
       //await runETHUSDT();
    }
    catch (error){
        console.log('index 파일에서 예외를 잡았습니다: ' + error)
    }
})();


