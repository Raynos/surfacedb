var SurfaceDB = require("./index")

var Rectangle = require("./rectangle")

var db = SurfaceDB({
    layers: {
        "name": "bucket"
    }
})

db.insert("name", Rectangle({
    x: 9,
    y: 9,
    width: 5,
    height: 5
}))

db.point("name", {
    x: 10,
    y: 10
}, function (err, surfaces) {
    console.log("SURFACES A", surfaces)
})

db.region("name", Rectangle({
    x: 10,
    y: 10,
    width: 1,
    height: 1
}), function (err, surfaces) {
    console.log("SURFACES B", surfaces)
})
