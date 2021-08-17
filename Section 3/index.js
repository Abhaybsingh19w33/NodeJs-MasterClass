// dependencies
const http = require('http');
const url = require('url');
// const StringDecoder = require('string_decoder').StringDecoder;
const { StringDecoder } = require('string_decoder');

// server should respond to all request with a string
const server = http.createServer(function (req, res) {

    // get the url and parse it
    // true means parse the query string, it will call the query string module 
    var parseUrl = url.parse(req.url, true);

    // get the path from url
    var path = parseUrl.pathname;
    // trimming the first and last slashes from both sides
    var trimmedPath = path.replace(/\/+|\/+$/g, '')

    // get the query string as an object
    var queryStringObject = parseUrl.query;

    // get the HTTP method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    // get the payload, if there is any
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

        // when requestt is finished

        // send the res
        res.end('hello world\n');

        // log the request
        // console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and with these query string parameters: ', queryStringObject);
        console.log('Request received with these payload: ', buffer);
    });


});

// start the server, and have it listen on port 3000
// when it done listening it will run this function
server.listen(3000, function () {
    console.log("The server is listening to port 3000 ");
})