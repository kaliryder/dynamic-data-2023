//setup server - node syntax - single quotes to keep format between different OS
const http = require('http');
//define port the app will be accessed from (80, 8080, 8888 are default to the domain)
const port = process.env.PORT || 3000; //3000 if unavailable

//server inline function - usually req,res - routing
const server = http.createServer((request,response) => {
    //200 - status code - all good
    response.writeHead(200, {"Content-Type" : "text/plain"});
    response.end("Hello World");
})

//start the server
//don't need {} if only executing one statement
server.listen(port, () => console.log("server started on port " + port + " press ctrl + c to stop"));