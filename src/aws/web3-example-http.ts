import Web3 from 'web3';
import AWSHttpProvider, {AMB_HTTP_ENDPOINT} from './aws-http-provider';


// @ts-ignore
const web3 = new Web3(new AWSHttpProvider(AMB_HTTP_ENDPOINT));

web3.eth.getNodeInfo().then(console.log);