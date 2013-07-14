var window = require("global/window")
var document = require("global/document")
var ArrowKeys = require("arrow-keys")
var Observable = require("observ")

var CanvasRender = require("./lib/canvas-render.js")
var SurfaceDB = require("../index.js")

var db = window.db = SurfaceDB()
var app = App(db)
document.body.appendChild(app.view)

function App(db) {
    // create layer for screen
    var main = db.addLayer("main", { sceneGraph: "bucket" })

    // create surfaces for layer
    var surfaces = createSurfaces()
    main.insert(surfaces)

    // create a screen to view
    var screenCoord = {
        x: 0, y: 0, width: 640, height: 320
    }
    var screen = Observable(SurfaceDB.Rectangle(screenCoord))

    // render the layer within the screen
    var canvas = CanvasRender(main, screen)

    // on user input update the screen
    var keys = ArrowKeys()
    keys.on("change", function (changes) {
        if (changes.x) {
            screenCoord.x += changes.x
        }
        if (changes.y) {
            screenCoord.y += changes.y
        }

        screen.set(SurfaceDB.Rectangle(screenCoord))
    })

    return { view: canvas }
}

function createSurfaces() {
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
    return surfaces
}
