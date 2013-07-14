var assert = require("assert")
var suite = require("./lib/suite")
var SurfaceDB = require("../index.js")

var SPEED = 2.0

suite("region query 100 out of 900", function (benchmark) {
    var db = createDB({ width: 30, height: 30, size: 10 })

    benchmark("naive", 3200 * SPEED, function () {
        query(db, "naive", {
            width: 1, height: 1, size: 100
        })
    })
    benchmark("bucket", 5000 * SPEED, function () {
        query(db, "bucket", {
            width: 1, height: 1, size: 400
        })
    })
})

suite("region query 900 out of 900", function (benchmark) {
    var db = createDB({ width: 30, height: 30, size: 10 })

    benchmark("naive", 2500 * SPEED, function () {
        query(db, "naive", {
            x: 0, y: 0, width: 30, height: 30, size: 900
        })
    })
    benchmark("bucket", 2200 * SPEED, function () {
        query(db, "bucket", {
            x: 0, y: 0, width: 30, height: 30, size: 900
        })
    })
})

suite("region query 400 out of 3600", function (benchmark) {
    var db = createDB({ width: 60, height: 60, size: 10 })

    benchmark("naive", 600 * SPEED, function () {
        query(db, "naive", {
            width: 11, height: 11, size: 400
        })
    })
    benchmark("bucket", 2400 * SPEED, function () {
        query(db, "bucket", {
            width: 11, height: 11, size: 700
        })
    })
})

suite("region query 2500 out of 3600", function (benchmark) {
    var db = createDB({ width: 60, height: 60, size: 10 })

    benchmark("naive", 600 * SPEED, function () {
        query(db, "naive", {
            x: 0, y: 0, width: 50, height: 50, size: 2500
        })
    })
    benchmark("bucket", 450 * SPEED, function () {
        query(db, "bucket", {
            x: 0, y: 0, width: 50, height: 50, size: 3600
        })
    })
})

suite("region query 150 out of 10000", function (benchmark) {
    var db = createDB({ width: 100, height: 100, size: 10 })

    benchmark("naive", 150 * SPEED, function () {
        query(db, "naive", {
            width: 4, height: 4, size: 169
        })
    })
    benchmark("bucket", 2500 * SPEED, function () {
        query(db, "bucket", {
            width: 4, height: 4, size: 700
        })
    })
})

suite("region query 1000 out of 10000", function (benchmark) {
    var db = createDB({ width: 100, height: 100, size: 10 })

    benchmark("naive", 150 * SPEED, function () {
        query(db, "naive", {
            width: 22, height: 22, size: 961
        })
    })
    benchmark("bucket", 750 * SPEED, function () {
        query(db, "bucket", {
            width: 22, height: 22, size: 2300
        })
    })
})

suite("region query 8000 out of 10000", function (benchmark) {
    var db = createDB({ width: 100, height: 100, size: 10 })

    benchmark("naive", 150 * SPEED, function () {
        query(db, "naive", {
            width: 80, height: 80, size: 7921
        })
    })
    benchmark("bucket", 150 * SPEED, function () {
        query(db, "bucket", {
            width: 80, height: 80, size: 7900
        })
    })
})

function query(db, name, opts) {
    db.region(name, SurfaceDB.Rectangle({
        x: "x" in opts ? opts.x : 20,
        y: "y" in opts ? opts.y : 20,
        width: opts.width,
        height: opts.height
    }), function (err, results) {
        assert.ifError(err)

        if (opts.size) {
            assert.equal(results.length, opts.size)
        } else {
            console.log("length", results.length)
        }
    })
}

function createDB(opts) {
    var db = SurfaceDB({
        layers: {
            "naive": "naive"
        }
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

    db.addLayer("bucket", {
        sceneGraph: "bucket",
        size: 20
    })

    db.insert("naive", surfaces)
    db.insert("bucket", surfaces)

    return db
}
