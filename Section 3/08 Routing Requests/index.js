/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
// const { StringDecoder } = require('string_decoder');

// Configure the server to respond to all requests with a string
var server = http.createServer(function (req, res) {

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
      res.writeHead(statusCode);
      // closing the payload string
      res.end(payloadString);
      console.log('Request received with this payload: ', buffer);

      console.log('Request received with these headers: ', headers);

      console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and this query string: ', queryStringObject);
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });

});

// Start the server
server.listen(3000, function () {
  console.log('The server is up and running now');
});


// Define all the handlers
var handlers = {};

// Sample handler
// data contains every bit of data which is passed from browser
// callback is a function which will be called when the handler had done with their request
handlers.sample = function (data, callback) {
  // callback a http status code, and a payload object

  // 406 Not Acceptable client error response code 
  // indicates that the server cannot produce a 
  // response matching the list of acceptable values 
  // defined in the request's proactive content 
  // negotiation headers, and that the server is 
  // unwilling to supply a default representation

  // this payload key value pair is passed
  callback(406, { 'name': 'sample handler' });
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Define the request router
// here when sample passed in url the handler.sample will be called
var router = {
  'sample': handlers.sample
};