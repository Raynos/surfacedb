var window = require("global/window")
var document = require("global/document")
var ArrowKeys = require("arrow-keys")
var Observable = require("observ")

var CanvasRender = require("./lib/canvas-render.js")
var createTerrain = require("./lib/generate-terrain.js")
var SurfaceDB = require("../index.js")

var WIDTH = 640
var HEIGHT = 320
var SPEED = 5
var SIZE = 64

var db = window.db = SurfaceDB()
var app = App(db)
document.body.appendChild(app.view)

function App(db) {
    // create layer for screen
    var main = db.addLayer("main", { sceneGraph: "bucket" })

    // create surfaces for layer
    var surfaces = createTerrain({ size: SIZE })
    main.insert(surfaces)

    // create a screen to view
    var screenCoord = {
        x: -(WIDTH / 2), y: -(HEIGHT / 2),
        width: WIDTH + (SIZE * 2), height: HEIGHT + (SIZE * 2)
    }
    var screen = Observable(SurfaceDB.Rectangle(screenCoord))

    // render the layer within the screen
    var canvas = CanvasRender(main, {
        width: WIDTH, height: HEIGHT
    },screen)

    // on user input update the screen
    var keys = ArrowKeys()
    keys.on("change", function (changes) {
        if (changes.x) {
            screenCoord.x += changes.x * SPEED
        }
        if (changes.y) {
            screenCoord.y += changes.y * SPEED
        }

        // console.log("screenCoord", screenCoord)
        screen.set(SurfaceDB.Rectangle(screenCoord))
    })

    return { view: canvas }
}
