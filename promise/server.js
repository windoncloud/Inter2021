const http = require('http');

http.createServer((req, res) => {
    console.log(req);
    let callback = `JSONP.callbackMap['__name0']`;
    res.end(`${callback}(${JSON.stringify({
        name: 'avery'
    })})`)
}).listen(3000);