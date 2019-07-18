const express = require('express')
const chalk = require('chalk')
const path = require('path')
const envVarUtil = require('./utils/envars.js')
const otherUtils = require('./utils/otherutils.js')
const fs = require('fs')
const request = require('request')
const bodyParser = require('body-parser')
const app = express()
const crypto = require('crypto')
const getRawBody = require('raw-body');
//const appvaultutil = require('./utils/appvaultutil.js')
//const apirequestutil = require('./utils/apirequestutil.js')

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))

//This is called by front end to get homepage details
app.get('/backend/homepage', (req, res) => {
    console.log(chalk.green('-----------------Shopify Home page request from front end '))
})

app.get('/backend/syncproducts', (req, res) => {
    return res.send('Syncproducts')
})


app.get('/backend/manageproducts', (req, res) => {
    return res.send('Manage products')
})

app.get('/backend/costcalc', (req, res) => {

    const nummeta = req.query.nummetafields
    const numsku = req.query.numsku
    const waittime = 20
    const querytime = 1
    const maxcost = 1000
    var maxskucount = 0 //max number of sku requested in 1 GraphQL query

    for (i = 0; i <= numsku; i++) {
        const costsingquery = 1 + 1 + 3 * i + nummeta * i
        if (costsingquery > maxcost) {
            break
        }
        maxskucount = i
    }

    var totalwaittime = 0
    var totalapicalls = 0
    var skusent = 0

    while (skusent < numsku) {
        skusent = skusent + maxskucount
        totalapicalls = totalapicalls + 1
        totalwaittime = totalwaittime + 20
    }

    if (totalwaittime > 0) {
        totalwaittime = totalwaittime - 20
    }

    const output = 'Total SKU sent:      ' + numsku + ', Total Meta fields per sku:    ' + nummeta + ' , Total API calls:      ' + totalapicalls + ', Total Wait time (in seconds)     ' + totalwaittime + ',  SKU sent per API call:       ' + maxskucount
    return res.send(output)

})


app.get('/backend/registerwebhook/productupdate', (req, res) => {


    //Added for Walmart Playground
    const shop = req.query.shop
    const url_base = 'https://' + shop
    const shop_token = ''

    console.log("Received request from front end for webhook")

    //Added for Walmart Playground
    //const url = 'https://test-wal-mp.myshopify.com/admin/api/2019-04/webhooks.json'
    const url = url_base + '.myshopify.com/admin/api/2019-04/webhooks.json'

    const options = {
        url,
        method: 'POST',
        json: true,
        headers: {
            'X-Shopify-Access-Token': shop_token
        },
        body: {
            'webhook':
            {
                'topic': 'products/update',
                'address': '',
                'format': 'json'
            }
        }

    }

    const options2 = {
        url,
        method: 'POST',
        json: true,
        headers: {
            'X-Shopify-Access-Token': shop_token
        },
        body: {
            'webhook':
            {
                'topic': 'product_listings/add',
                'address': 'https://shopifywalbackend.herokuapp.com/backend/callwebhook/productupdate',
                'format': 'json'
            }
        }

    }


    const options3 = {
        url,
        method: 'POST',
        json: true,
        headers: {
            'X-Shopify-Access-Token': shop_token
        },
        body: {
            'webhook':
            {
                'topic': 'product_listings/update',
                'address': 'https://shopifywalbackend.herokuapp.com/backend/callwebhook/productupdate',
                'format': 'json'
            }
        }

    }


    const options4 = {
        url,
        method: 'POST',
        json: true,
        headers: {
            'X-Shopify-Access-Token': shop_token
        },
        body: {
            'webhook':
            {
                'topic': 'inventory_levels/update',
                'address': 'https://shopifywalbackend.herokuapp.com/backend/callwebhook/productupdate',
                'format': 'json'
            }
        }

    }

    var data = ''

    request(options, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            data = 'Error fetch data from Shopify:' + data + error
        }
        else if (response) {
            console.log('Response:' + response.body)
            data = data + response.body
        }
    })

    request(options2, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            data = 'Error fetch data from Shopify:' + data + error
        }
        else if (response) {
            console.log('Response:' + response.body)
            data = data + response.body
        }
    })



    request(options3, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            data = 'Error fetch data from Shopify:' + data + error
        }
        else if (response) {
            console.log('Response:' + response.body)
            data = data + response.body
        }
    })


    request(options4, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            data = 'Error fetch data from Shopify:' + data + error
        }
        else if (response) {
            console.log('Response:' + JSON.stringify(response.body))
            data = data + JSON.stringify(response.body).webhooks
            console.log('Webhooks:' + ((JSON.stringify(response.body)).webhooks))
        }
    })



    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(data)


})

app.post('/backend/callwebhook/productupdate', async (req, res) => {
    console.log('Received webhook')
    console.log('Output full request' + req)
    console.log('Output url' + req.url)
    console.log('Output headers' + JSON.stringify(req.headers))
    console.log('Output:json' + JSON.stringify(req.body))
    console.log('Output body' + req.body.id)
    console.log('Output body2' + req.body.price)
    console.log('Output body3' + req.body.variants);

    const HMAC = req.headers['x-shopify-hmac-sha256']

    console.log('Validation-----')

    const rawBody = await getRawBody(req);
   // const newHMAC = crypto.createHmac('sha256', envVarUtil.envVars.SHOPIFY_SECRET_API_KEY).update(JSON.stringify(req.body)).digest('hex')
   const newHMAC = crypto.createHmac('sha256', envVarUtil.envVars.SHOPIFY_SECRET_API_KEY).update(rawBody).digest('base64')

   
    console.log('HMAC:' + HMAC + '/n Calculated HMAC: ' + newHMAC)


    if (HMAC == newHMAC)
        console.log('HMAC Validated')
    else
        console.log('HMAC Not validated')

    res.sendStatus(200)

})

app.get('/backend/loadtest', (req, res) => {
    console.log('Request received')
    const revData = req.query.time
    const timestamp = new Date()
    return res.send('Request received:' + revData)
})

app.get('/backend/testdata', (req, res) => {
    for (i = 0; i < 500; i++) {
        //console.log('HandleProd'+i)
    }
})

app.get('/backend/saveprivatemeta', (req, res) => {

    var taxcode = req.query.taxcode
    var gtin = req.query.gtin
    var category = req.query.category
    var subcategory = req.query.subcategory
    var clothingsize = req.query.clothingsize

    //Call and shopify metafield
    //ProductID:2615407214677 //handle:adidas-classic-backpack

    //Added for Walmart Playground
    const shop = req.query.shop
    const url_base = 'https://' + shop
    const shop_token = ''
    const prodid = '2615407214677'
    console.log("Received request from front end for save private field: for shop:" + shop)
    const url = url_base + '.myshopify.com/admin/api/unstable/graphql.json'
    // const url = url_base + '.myshopify.com/admin/api/2019-04/products/' + prodid + '/metafields.json'

    var query = `mutation{
        productUpdate(input: {id: "2615407312981", metafields: {key: "clothing_attr", namespace: "walmart_test5", value: "{\"taxcode\": \"ABC\", \"gtin\": \"123444\", \"category\":\"clothing\"}", valueType: JSON_STRING}}) {
          product {
            id
          }
           userErrors {
            field
            message
          }
        }
    }`

    const options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': shop_token
        },
        body: JSON.stringify({ 'query': query })
    }

    request(options, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            return res.send("Error fetch data from Shopify:" + error)
        }
        else if (response) {
            console.log('Response:' + JSON.stringify(response.body))
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            return res.send(JSON.stringify(response.body))
        }
    })



    // const variables =
    // {
    //     "input": {
    //         "owner": "gid://shopify/Product/2615407214677",
    //         "namespace": "walmart_test2",
    //         "key": "clothingsize",
    //         "valueInput": {
    //             "value": "5.00",
    //             "valueType": "STRING"
    //         }
    //     }
    // }

    // const query = `
    //     mutation($input: PrivateMetafieldInput!) {
    //         privateMetafieldCreate(input: $input) {
    //           privateMetafield {
    //             namespace
    //             key
    //             value
    //             valueType
    //           }
    //           userErrors {
    //             field
    //             message
    //           }
    //         }
    //       }`

    // const options = {
    //     url,
    //     json: true,
    //     method: 'POST',
    //     headers: {
    //         'X-Shopify-Access-Token': shop_token,
    //         'Content-pe':'application/json'
    //     },
    //     body: JSON.stringify({
    //         query,
    //         variables
    //     })

    // }

    // var data = ''

    // request(options, (error, response) => {
    //     if (error) {
    //         console.log('Error:' + error)
    //         data = 'Error fetch data from Shopify:' + data + error
    //     }
    //     else if (response) {
    //         console.log('Response:' + JSON.stringify(response.body))
    //         data = data + JSON.stringify(response.body)
    //     }
    // })

})

app.get('/backend/getprivatemeta', (req, res) => {

    const shop = req.query.shop
    const url_base = 'https://' + shop
    const shop_token = ''
    const prodid = '2615407214677'
    console.log("Received request from front end for reading private field: for shop:" + shop)
    const url = url_base + '.myshopify.com/admin/api/2019-04/products/' + prodid + '/metafields.json'

    const options = {
        url,
        method: 'GET',
        json: true,
        headers: {
            'X-Shopify-Access-Token': shop_token
        }
    }

    var data = ''

    request(options, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            data = 'Error fetch data from Shopify:' + data + error
        }
        else if (response) {
            console.log('Response:' + JSON.stringify(response.body))
            data = data + JSON.stringify(response.body)
        }
    })

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return res.send(data)
})


app.get('/backend/product_listings', (req, res) => {

    //Added for Walmart Playground
    const shop = req.query.shop
    const shop_token = ''

    console.log("Received request from front end for shop:" + shop)
    //Added for Walmart Playground
    //const url = 'https://test-wal-mp.myshopify.com/admin/api/2019-04/product_listings.json?limit=250'
    const url = 'https://' + shop + '.myshopify.com/admin/api/2019-04/product_listings.json?limit=250'
    //We can add filters to above url like title, published_status, etc.


    const options = {
        url,
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': shop_token,
            'limit': '250'
        }

    }

    request(options, (error, response) => {
        if (error) {
            console.log('Error:' + error)
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            return res.send("Error fetch data from Shopify:" + error)
        }
        else if (response) {
            console.log('Response:' + response.body)
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.send(JSON.parse(response.body))
        }
    })
})



app.listen(process.env.PORT || 3000), () => {
    console.log("Server is runnxing on port 3000")
}


//chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=localhost:9229/b4111321-4a42-47d0-92b9-525c19c78d5d
//curl -X GET -H "X-Shopify-Access-Token: a12070de2fb759429529f8d14db10be2" "https://test-wal-mp.myshopify.com/admin/api/2019-04/product_listings.json"

//https://test-wal-mp.myshopify.com/admin/bulk?resource_name=Product&edit=metafields.walmart.taxcode:string,metafields.walmart.gtin:string,metafields.walmart.checkflag:boolean,metafields.walmart.category:select,clothing,electronics,metafield.walmart.size:string.metafield.walmart.color:string,variants.sku&metafield_options[metafields.walmart.category][1]=clothing&metafield_options[metafields.walmart.category][2]=Electronics&metafield_options[metafields.walmart.category][3]=Tires
