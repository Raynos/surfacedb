var Benchmark = require("benchmark")
var console = require("console")

module.exports = suite

function suite(name, callback) {
    var java = new Benchmark.Suite(name)

    java.on("start", function () {
        console.log("# " + name)
    })
    java.on("cycle", function (event) {
        console.log("# --- " + String(event.target))
    })

    callback(benchmark)

    function benchmark(name, fn) {
        java.add(name, fn)
    }
}
