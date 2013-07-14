var SurfaceDB = require("surfacedb")

var Rectangle = require("surfacedb/rectangle")

var db = SurfaceDB({
    layers: {
        "name": "bucketed"
    }
})

db.addLayer("name", {
    sceneGraph: "bucketed"
})

db.insert("name", Rectangle({
    x: 10,
    y: 10,
    information: {}
}))

db.point("name", {
    x: 10,
    y: 10
}, function (err, surfaces) {

})

db.region("name", Rectangle({
    x: 10,
    y: 10,
    width: 10,
    height: 10,
    offset: { x: 5, y: 5 },
    rotation: 0
}), function (err, surfaces) {

})
