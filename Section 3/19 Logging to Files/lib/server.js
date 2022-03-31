/*
 * Server-related tasks
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
// const { StringDecoder } = require('string_decoder');
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');


// Instantiate the server module object
var server = {};

// Start the server
// to work this NODE_ENV command
// for ubuntu - NODE_ENV=production node index.js
// for windows - here spaces between command letters are important
// run the command set NODE_ENV=production&&node index.js in CMD with administrator privilage

// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
  server.unifiedServer(req, res);
});

// All the server logic for both the http and https server
server.unifiedServer = function (req, res) {

  // Parse the url
  // second parameter true - refers to means parse the query string, as it will call the query string module using 2 module at once
  var parsedUrl = url.parse(req.url, true);

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
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
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
      // console.log('Request received with this payload: ', buffer);

      // console.log('Request received with these headers: ', headers);

      // console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and this query string: ', queryStringObject);
      // console.log("Returning this response: ", statusCode, payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
      }
    });

  });
};

// Define the request router
// here when sample passed in url the handler.sample will be called
server.router = {
  'sample': handlers.sample,
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};

// Init script
server.init = function () {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.log('\x1b[36m%s\x1b[0m', 'The HTTP server is running on port ' + config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function () {
    console.log('\x1b[35m%s\x1b[0m', 'The HTTPS server is running on port ' + config.httpsPort);
  });
};


// Export the module
module.exports = server;
