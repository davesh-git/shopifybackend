const request = require('request')
const fs = require('fs')

const makegetpirequest = (url, headers, json_flag, callback) => {

    const options = {
        url,
        method: 'GET',
        json: json_flag,
        headers: headers
    }


    request(options, (error, response) => {
        if (error) {
            var errordata = 'Error in GET CALL:' + error
            console.log(errordata)
            callback(errordata,'')
        }
        else if (response) {
            var responsedata = JSON.stringify(response.body)
            console.log('Response:' + responsedata)
            callback('',responsedata)
        }
    })
}


const makepostapirequest = (url, headers, json_flag, body, callback) => {

    const options = {
        url,
        method: 'POST',
        ca: [ fs.readFileSync('././certs/secvault.glb.prod.walmart.com.pem') ],//Walmart CA certificate file
        cert:[ fs.readFileSync('././certs/shopifywalappvault.wal-mart.com.pem') ],
        key:[ fs.readFileSync('././certs/shopifywalappvault.wal-mart.com.pem') ],
        passphrase: 'WALMART_shopify',
        json: json_flag,
        headers: headers,
        body:body
    }


    request(options, (error, response) => {
        if (error) {
            var errordata = 'Error in POST CALL:' + error
            console.log(errordata)
            callback(errordata,'')
        }
        else if (response) {
            console.log(response.body)
            var responsedata = JSON.stringify(response.body)
            console.log('Response:' + responsedata)
            callback('',responsedata)
        }
    })

}


module.exports = {
    makegetpirequest: makegetpirequest,
    makepostapirequest: makepostapirequest
}