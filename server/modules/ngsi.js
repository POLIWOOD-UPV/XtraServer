// use strict;
const fs = require("fs");

const NGSI = "http://orion:1026/v2/subscriptions"
const URL = "http://host.docker.internal:80/ngsi"

// ACTIONTYPE: https://github.com/telefonicaid/fiware-orion/issues/1494#issuecomment-252624469

exports.subscribe = async () => {
    let res = await (fetch(NGSI, {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description: "NGSI_2_SQL",
            type: "Subscription",
            subject: { 
                actionType: ["update","delete", "append", "create", "change"],
                entities:[
                    {idPattern: ".*"} 
                ]
            },
            format: "keyValues",
            notification: {
                http: {
                    url: URL,
                    accept: "application/json"
                }
            }
        })
    }));
}