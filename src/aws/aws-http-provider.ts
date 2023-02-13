/////////////////////////////////////////////////////
// Authored by Carl Youngblood
// Senior Blockchain Solutions Architect, AWS
// Adapted from web3 npm package v1.3.0
// licensed under GNU Lesser General Public License
// https://github.com/ethereum/web3.js
/////////////////////////////////////////////////////

import AWS from 'aws-sdk';
import HttpProvider from 'web3-providers-http';
// @ts-ignore
import XHR2 from 'xhr2';

// 아마존 이더리음 접속 엑세스 키 아이디: AKIA4NVGXR4K3HPVI77U
process.env.AWS_ACCESS_KEY_ID="AKIA4NVGXR4K3HPVI77U";
process.env.AWS_SECRET_ACCESS_KEY="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";
export const AMB_HTTP_ENDPOINT="https://nd-bvojjgfsgjcb7frvebzlpemy6m.ethereum.managedblockchain.ap-northeast-2.amazonaws.com/"
export const AMB_WS_ENDPOINT="wss://nd-bvojjgfsgjcb7frvebzlpemy6m.wss.ethereum.managedblockchain.ap-northeast-2.amazonaws.com/"

//@ts-ignore
export default class AWSHttpProvider extends HttpProvider {
    send(payload:any, callback:any) {
        const self = this;
        const request = new XHR2(); // eslint-disable-line

        //@ts-ignore
        request.timeout = self.timeout;
        //@ts-ignore
        request.open('POST', self.host, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.timeout !== 1) {
                let result = request.responseText; // eslint-disable-line
                let error = null; // eslint-disable-line

                try {
                    result = JSON.parse(result);
                } catch (jsonError) {
                    let message;
                    if (!!result && !!result.error && !!result.error.message) {
                        message = `[aws-ethjs-provider-http] ${result.error.message}`;
                    } else  {
                        //@ts-ignore
                        message = `[aws-ethjs-provider-http] Invalid JSON RPC response from host provider ${self.host}: ` +
                            `${JSON.stringify(result, null, 2)}`;
                    }
                    error = new Error(message);
                }

                callback(error, result);
            }
        };

        request.ontimeout = () => {
            //@ts-ignore
            callback(`[aws-ethjs-provider-http] CONNECTION TIMEOUT: http request timeout after ${self.timeout} ` +
                `ms. (i.e. your connect has timed out for whatever reason, check your provider).`, null);
        };

        try {
            const strPayload = JSON.stringify(payload);
            //const region = process.env.AWS_DEFAULT_REGION || 'us-east-1';
            const region = process.env.AWS_DEFAULT_REGION || 'ap-northeast-2';
            const credentials = new AWS.EnvironmentCredentials('AWS');
            //@ts-ignore
            const endpoint = new AWS.Endpoint(self.host);
            const req = new AWS.HttpRequest(endpoint, region);
            req.method = request._method;
            req.body = strPayload;
            req.headers['host'] = request._url.host;
            //@ts-ignore
            const signer = new AWS.Signers.V4(req, 'managedblockchain');
            signer.addAuthorization(credentials, new Date());
            request.setRequestHeader('Authorization', req.headers['Authorization']);
            request.setRequestHeader('X-Amz-Date', req.headers['X-Amz-Date']);
            request.send(strPayload);
        } catch (error) {
            //@ts-ignore
            callback(`[aws-ethjs-provider-http] CONNECTION ERROR: Couldn't connect to node '${self.host}': ` +
                `${JSON.stringify(error, null, 2)}`, null);
        }
    }
}