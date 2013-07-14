var window = require("global/window")
var document = require("global/document")
var Observable = require("observ")
var kb = require("kb-controls")

var CanvasRender = require("./lib/canvas-render.js")
var createTerrain = require("./lib/generate-terrain.js")
var SurfaceDB = require("../index.js")

var WIDTH = 640
var HEIGHT = 320
var SPEED = 5
var SIZE = 32
var TERRAIN_HEIGHT = 10
var KEYS_MAP = {
    "<left>": "left",
    "<right>": "right",
    "<up>": "up",
    "<down>": "down",
    "A": "left",
    "D": "right",
    "W": "up",
    "S": "down"
}

var db = window.db = SurfaceDB()
var app = App(db)
document.body.appendChild(app.view)

function App(db) {
    // create layer for screen
    var main = db.addLayer("main", {
        sceneGraph: "naive"
    })

    // create surfaces for layer
    var surfaces = createTerrain({ size: SIZE, ceiling: TERRAIN_HEIGHT })
    main.insert(surfaces)

    // create a screen to view
    var screenCoord = {
        x: 0 - (WIDTH / 2), y: 0 - (HEIGHT / 2) - (TERRAIN_HEIGHT * SIZE / 2),
        width: WIDTH + (SIZE * 2), height: HEIGHT + (SIZE * 2)
    }
    var screen = Observable(SurfaceDB.Rectangle(screenCoord))

    // render the layer within the screen
    var canvas = CanvasRender(main, {
        width: WIDTH, height: HEIGHT
    }, screen)

    // on user input update the screen
    var controls = kb(KEYS_MAP, function oninput() {
        if (controls.left || controls.right) {
            screenCoord.x += (controls.left ? -1 : 1) * SPEED
        }
        if (controls.up || controls.down) {
            screenCoord.y += (controls.up ? -1 : 1) * SPEED
        }

        screen.set(SurfaceDB.Rectangle(screenCoord))
    })

    return { view: canvas }
}
