var window = require("global/window")
var document = require("global/document")
var ArrowKeys = require("arrow-keys")

var SurfaceDB = require("../index")

var surfaces = []
for (var i = 0; i < 200; i++) {
    for (var j = 0; j < 200; j++) {
        var r = Math.floor(Math.random() * 256)
        var g = Math.floor(Math.random() * 256)
        var b = Math.floor(Math.random() * 256)

        surfaces.push(SurfaceDB.Rectangle({
            x: i * 10,
            y: j * 10,
            width: 10,
            height: 10,
            information: {
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

window.requestAnimationFrame(function ondraw() {
    db.region("main", screen, function (err, surfaces) {
        if (err) {
            throw err
        }

        context.clearRect(0, 0, 640, 320)

        surfaces.forEach(function (surface) {
            var rect = createRectangle(surface)
            context.fillStyle = surface.information.color
            context.fillRect(rect.x - screenCoord.x, rect.y - screenCoord.y,
                rect.width, rect.height)
        })

        window.requestAnimationFrame(ondraw)
    })
})

function createRectangle(surface) {
    return {
        x: surface.points[0].x,
        y: surface.points[0].y,
        width: surface.points[3].x - surface.points[0].x,
        height: surface.points[2].y - surface.points[0].y
    }
}
