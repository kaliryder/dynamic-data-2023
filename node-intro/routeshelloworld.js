const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((request,response) => {
    //get URL
    const path = request.url;
        switch(path) {
            case '':
            case '/':
                response.writeHead(200, {"Content-Type" : "Text/Plain"});
                response.end("Home Page");
            break
            case '/about':
                response.writeHead(200, {"Content-Type" : "Text/Plain"});
                response.end("About Page");
            break
            case '/contact':
                response.writeHead(200, {"Content-Type" : "Text/Plain"});
                response.end("Contact Page");
            break
            default:
                response.writeHead(404, {"Content-Type" : "Text/Plain"});
                response.end("Not Found");
            break
        }
})

server.listen(port, () => console.log("server started on port " + port + " press ctrl + c to stop"));