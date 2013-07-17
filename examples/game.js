var Observable = require("observ")

var CONSTANTS = require("./constants")
var WIDTH = CONSTANTS.WIDTH
var TERRAIN_HEIGHT = CONSTANTS.TERRAIN_HEIGHT
var SIZE = CONSTANTS.SIZE
var HEIGHT = CONSTANTS.HEIGHT
var MAP_SIZE = CONSTANTS.MAP_SIZE
var createTerrain = require("./lib/generate-terrain.js")

module.exports = Game

function Game(db, inputs) {
    initTerrain(db)

    var viewModel = {
        camera: Observable({
            x: 0 - (WIDTH / 2),
            y: (-TERRAIN_HEIGHT * SIZE / 2) - (HEIGHT / 2),
            width: WIDTH + (SIZE * 2),
            height: HEIGHT + (SIZE * 2)
        })
    }

    inputs.on("move", function (changes) {
        var coords = viewModel.camera()
        coords.x += changes.x
        coords.y += changes.y
        viewModel.camera.set(coords)
    })

    return viewModel
}

function initTerrain(db) {
    var main = db.addLayer("main", {
        sceneGraph: "bucket"
    })

    var terrain = createTerrain({
        chunkSize: SIZE,
        ceiling: TERRAIN_HEIGHT,
        mapSize: MAP_SIZE
    })
    main.insert(terrain)
}
