var http = require("http")
var path = require("path")
var ecstatic = require("ecstatic")
var ServeBrowserify = require("serve-browserify")

var serveJS = ServeBrowserify({
    root: __dirname,
    debug: true
})
var serveStatic = ecstatic({
    root: path.join(__dirname, "static")
})

http.createServer(function (req, res) {
    if (req.url.substr(0, 3) === "/js") {
        serveJS(req, res)
    } else {
        serveStatic(req, res)
    }
}).listen(8000, function () {
    console.log("started server on port", 8000)
})
