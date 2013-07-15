var window = require("global/window")
var document = require("global/document")
var Observable = require("observ")
var kb = require("kb-controls")

var CanvasRender = require("./lib/canvas-render.js")
var createTerrain = require("./lib/generate-terrain.js")
var SurfaceDB = require("../index.js")

var WIDTH = 640
var HEIGHT = 480
var SPEED = 5
var SIZE = 16
var TERRAIN_HEIGHT = 40
var MAP_SIZE = 100
var KEYS_MAP = {
    "<left>": "left",
    "<right>": "right",
    "<up>": "up",
    "<down>": "down",
    "A": "left",
    "D": "right",
    "W": "up",
    "S": "down",
    "H": "home"
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
    var terrain = createTerrain({
        chunkSize: SIZE,
        ceiling: TERRAIN_HEIGHT,
        mapSize: MAP_SIZE
    })
    main.insert(terrain)

    var initialPos = {
        x: 0 - (WIDTH / 2), y: -(TERRAIN_HEIGHT * SIZE / 2) - (HEIGHT / 2)
    }

    // create a screen to view
    var camera = Camera({
        x: initialPos.x, y: initialPos.y,
        width: WIDTH + (SIZE * 2), height: HEIGHT + (SIZE * 2)
    })

    // on user input update the screen
    var controls = kb(KEYS_MAP, function oninput() {
        var x = 0, y = 0
        if (controls.left || controls.right) {
            x = (controls.left ? -1 : 1) * SPEED
        }
        if (controls.up || controls.down) {
            y = (controls.up ? -1 : 1) * SPEED
        }

        camera.move(x, y)
    })

    controls.on("home", function () {
        camera.reset(initialPos.x, initialPos.y)
    })

    // render the layer within the screen
    var canvas = CanvasRender(main, {
        width: WIDTH, height: HEIGHT
    }, camera)

    return { view: canvas }
}

function Camera(coords) {
    var screen = Observable(SurfaceDB.Rectangle(coords))

    screen.move = function (x, y) {
        coords.x += x
        coords.y += y
        screen.set(SurfaceDB.Rectangle(coords))
    }
    screen.reset = function (x, y) {
        coords.x = x
        coords.y = y
        screen.set(SurfaceDB.Rectangle(coords))
    }

    return screen
}
