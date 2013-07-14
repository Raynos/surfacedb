var assert = require("assert")
var suite = require("./lib/suite")
var SurfaceDB = require("../index.js")

var SPEED = 2.0

suite("region query 100 out of 900", function (benchmark) {
    var db = createDB({ width: 30, height: 30, size: 10 })

    benchmark("naive", 3500 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 20,
            y: 20,
            width: 1,
            height: 1
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 100)
        })
    })
})

suite("region query 900 out of 900", function (benchmark) {
    var db = createDB({ width: 30, height: 30, size: 10 })

    benchmark("naive", 3500 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 0,
            y: 0,
            width: 30,
            height: 30
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 900)
        })
    })
})

suite("region query 400 out of 3600", function (benchmark) {
    var db = createDB({ width: 60, height: 60, size: 10 })

    benchmark("naive", 900 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 20,
            y: 20,
            width: 11,
            height: 11
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 400)
        })
    })
})

suite("region query 2500 out of 3600", function (benchmark) {
    var db = createDB({ width: 60, height: 60, size: 10 })

    benchmark("naive", 800 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 0,
            y: 0,
            width: 50,
            height: 50
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 2500)
        })
    })
})

suite("region query 1000 out of 10000", function (benchmark) {
    var db = createDB({ width: 100, height: 100, size: 10 })

    benchmark("naive", 300 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 20,
            y: 20,
            width: 22,
            height: 22
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 961)
        })
    })
})

suite("region query 8000 out of 10000", function (benchmark) {
    var db = createDB({ width: 100, height: 100, size: 10 })

    benchmark("naive", 250 * SPEED, function () {
        db.region("naive", SurfaceDB.Rectangle({
            x: 20,
            y: 20,
            width: 80,
            height: 80
        }), function (err, results) {
            assert.ifError(err)
            assert.equal(results.length, 7921)
        })
    })
})

function createDB(opts) {
    var db = SurfaceDB({
        layers: { "naive": "naive" }
    })

    var surfaces = []
    for (var i = 0; i < opts.width; i++) {
        for (var j = 0; j < opts.height; j++) {
            surfaces.push(SurfaceDB.Rectangle({
                x: i,
                y: j,
                width: opts.size,
                height: opts.size
            }))
        }
    }

    db.insert("naive", surfaces)

    return db
}
