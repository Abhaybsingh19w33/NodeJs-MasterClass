// dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
// const { StringDecoder } = require('string_decoder');
var config = require('./config');
var fs = require('fs');

// var _data = require('./lib/data');

// TESTING 
// _data.create('test', 'newFile', { 'foo': 'bar' }, function (err) {
//     console.log('this was the error', err);
// });

// _data.read('test', 'newFile1', function (err, data) {
//     console.log('this was the error', err, ' this was the data ', data);
// });

// _data.update('test', 'newFile', { 'fizz': 'buzz' }, function (err, data) {
//     console.log('this was the error', err, ' this was the data ', data);
// });

// _data.delete('test', 'newFile', function (err) {
//     console.log('this was the error', err, ' deletion of file ', err ? 'unsuccessfully' : 'successfully');
// });

// instantiating the server
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

// step - 0 start the server, and have it listen on port 3000
// when it done listening it will run this function

// to work this NODE_ENV command
// for ubuntu - NODE_ENV=production node index.js
// for windows - here spaces between command letters are important
// run the command set NODE_ENV=production&&node index.js in CMD with administrator privilage
httpServer.listen(config.httpPort, function () {
    console.log('The HTTP server is running on port ' + config.httpPort);
})

// Instantiate the HTTPS server
// reading the data from the http file
// key is imp for encryption and decryption
var httpsServerOptions = {
    //there are 2 type of function here sync and async, we are using sync version 
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

// passing serverOptions for the https
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
    console.log('The HTTPS server is running on port ' + config.httpsPort);
});

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {

    // step - 1 get the url and parse it
    // true means parse the query string, as it will call the query string module
    // using 2 module at once
    var parseUrl = url.parse(req.url, true);

    // step - 2 get the path from url
    // pareUrl contains many values
    // one of which is pathname and it is untrimmed 
    var path = parseUrl.pathname;
    // trimming the first and last slashes from both sides
    var trimmedPath = path.replace(/\/+|\/+$/g, '')

    // step - 2.0 get the query string as an object
    // all data which is sent throough url will be stored in keys and values pair
    var queryStringObject = parseUrl.query;

    // step - 2.1 get the HTTP method like get post, etc
    var method = req.method.toLowerCase();

    // step - 2.2 get the headers as an object from req
    var headers = req.headers;

    // step - 2.3 get the payload, if there is any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    // data event, this callback function will be called
    req.on('data', function (data) {
        // appending the data to buffer
        buffer += decoder.write(data);
    })
    // end event
    req.on('end', function () {
        // append the buffer with decoder end
        buffer += decoder.end();

        // step - 5.3 Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        // here a function varibale is stored here, not a value based variable 
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        // chosenHandler had stored handler function so we can pass parameter to that function through chosen handler
        chosenHandler(data, function (statusCode, payload) {

            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            // when request is finished

            // sending the header content type as json to the user
            res.setHeader('Content-Type', 'application/json');
            // writing the statusCode to the header
            res.writeHead(statusCode);
            // closing the payload string
            res.end(payloadString);

            // log the request path
            console.log("Returning this response: ", statusCode, payloadString);
        });
    });
};

// Step - 5 Define all the handlers
var handlers = {};

// step - 5.2 Sample handler
// data contains every bit of data which is passed from browser
// callback is a function which will be called when the handler had done with their request
// handlers.sample = function (data, callback) {
// callback a http status code, and a pyload object

// 406 Not Acceptable client error response code 
// indicates that the server cannot produce a 
// response matching the list of acceptable values 
// defined in the request's proactive content 
// negotiation headers, and that the server is 
// unwilling to supply a default representation

// this payload key value pair is passed
//     callback(406, { 'name': 'sample handler' });
// };

// Ping handler
// to keep check if the server is alive or dead
// payload will be empty
handlers.ping = function (data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// step - 5.1 Define the request router
// here when sample passed in url the handler.sample will be called
var router = {
    'ping': handlers.ping
};