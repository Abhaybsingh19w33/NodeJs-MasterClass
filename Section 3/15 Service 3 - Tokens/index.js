/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
// const { StringDecoder } = require('string_decoder');
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

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


// Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// Start the server
// to work this NODE_ENV command
// for ubuntu - NODE_ENV=production node index.js
// for windows - here spaces between command letters are important
// run the command set NODE_ENV=production&&node index.js in CMD with administrator privilage
// server.listen(config.port, function () {
//   console.log('The server is up and running on port ' + config.port + ' in ' + config.envName + ' mode.');
// });

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  console.log('The HTTP server is running on port ' + config.httpPort);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
  console.log('The HTTPS server is running on port ' + config.httpsPort);
});


// All the server logic for both the http and https server
var unifiedServer = function (req, res) {

  // Parse the url
  // second parameter true - refers to means parse the query string, as it will call the query string module using 2 module at once
  var parsedUrl = url.parse(req.url, true);
  console.log("This is parsed url : ", parsedUrl);

  // Get the path
  // pareUrl contains many values
  // one of which is pathname and it is untrimmed 
  var path = parsedUrl.pathname;
  console.log("This is untrimmed path : ", path);
  // trimming the first and last slashes from both sides
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  // all data which is sent throough url will be stored in keys and values pair
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  // data event, this callback function will be called
  req.on('data', function (data) {
    // appending the data to buffer
    buffer += decoder.write(data);
  });

  // end event
  req.on('end', function () {
    // append the buffer with decoder end
    buffer += decoder.end();

    // Check the router for a matching path for a handler. 
    // If one is not found, use the notFound handler instead.

    // Treat chosenHandler as a function variable, it stores functions as variable
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
      // when request is finished writing the statusCode to the header
      // sending the header content type as json to the user
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      // closing the payload string
      res.end(payloadString);
      console.log('Request received with this payload: ', buffer);

      console.log('Request received with these headers: ', headers);

      console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and this query string: ', queryStringObject);
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });

};

// Define the request router
// here when sample passed in url the handler.sample will be called
var router = {
  'ping': handlers.ping,
  'sample': handlers.sample,
  'users': handlers.users,
  'tokens' : handlers.tokens
};