/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');

 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res){

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

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Send the response
  res.end('Hello World!\n');

  // Log the request/response
  console.log('Request received on path: '+trimmedPath+' with method: '+method);
});

// Start the server
server.listen(3000,function(){
  console.log('The server is up and running now');
});
