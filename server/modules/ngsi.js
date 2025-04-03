// use strict;
const fs = require("fs");

const NGSI = "http://localhost:1026/v2/subscription"
const URL = "http://host.docker.internal:80/"

const subscribe = () => {
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
                actionType: ["update"],  /* ("delete", "append", "create", "change") */
                // https://github.com/telefonicaid/fiware-orion/issues/1494#issuecomment-252624469
                entities:[
                    {type: "Vuelo"},
                    {idPattern: ".*"} 
                ], 
                condition: { 
                    attrs: []
                },
                q: "numberOfItems<10;..."
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