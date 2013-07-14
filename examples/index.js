var window = require("global/window")
var document = require("global/document")
var ArrowKeys = require("arrow-keys")

var SurfaceDB = require("../index")

var surfaces = []
for (var i = 0; i < 40; i++) {
    for (var j = 0; j < 40; j++) {
        var r = Math.floor(Math.random() * 256)
        var g = Math.floor(Math.random() * 256)
        var b = Math.floor(Math.random() * 256)

        surfaces.push(SurfaceDB.Rectangle({
            x: i * 10,
            y: j * 10,
            width: 10,
            height: 10,
            meta: {
                color: "rgb(" + r + "," + g + "," + b + ")"
            }
        }))
    }
}

var db = window.db = SurfaceDB({
    layers: {
        "main": "naive"
    }
})

db.insert("main", surfaces)

var canvas = document.createElement("canvas")
canvas.style.width = "640px"
canvas.style.height = "320px"
canvas.style.border = "solid 1px black"
var context = canvas.getContext("2d")

document.body.appendChild(canvas)
var screenCoord = {
    x: 0,
    y: 0,
    width: 640,
    height: 320
}
var screen = SurfaceDB.Rectangle(screenCoord)

var keys = ArrowKeys()
keys.on("change", function (changes) {
    if (changes.x) {
        screenCoord.x += changes.x
    }
    if (changes.y) {
        screenCoord.y += changes.y
    }

    screen = SurfaceDB.Rectangle(screenCoord)
})

// var SURFACES
// db.region("main", screen, function (err, surf) {
//     SURFACES = surf
// })

window.requestAnimationFrame(ondraw)

function ondraw() {
    db.region("main", screen, render)
    // render(null, SURFACES)
}

function render(err, surfaces) {
    if (err) {
        throw err
    }

    context.clearRect(0, 0, 640, 320)

    for (var i = 0; i < surfaces.length; i++) {
        var surface = surfaces[i]
        context.fillStyle = surface.meta.color
        context.fillRect(
            surface.points[0].x - screenCoord.x,
            surface.points[0].y - screenCoord.y,
            surface.points[3].x - surface.points[0].x,
            surface.points[2].y - surface.points[0].y)
    }

    window.requestAnimationFrame(ondraw)
}
