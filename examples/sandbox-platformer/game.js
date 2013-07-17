var Observable = require("observ")
var SurfaceDB = require("../../index.js")

var CONSTANTS = require("./constants")
var WIDTH = CONSTANTS.WIDTH
var TERRAIN_HEIGHT = CONSTANTS.TERRAIN_HEIGHT
var SIZE = CONSTANTS.SIZE
var HEIGHT = CONSTANTS.HEIGHT
var MAP_SIZE = CONSTANTS.MAP_SIZE
var PLAYER_HEIGHT = CONSTANTS.PLAYER_HEIGHT
var PLAYER_COLOR = CONSTANTS.PLAYER_COLOR
var createTerrain = require("./lib/generate-terrain.js")

module.exports = Game

function Game(db, inputs) {
    var main = db.addLayer("main", {
        sceneGraph: "bucket"
    })
    var grassChunks = initTerrain(main)

    var grass = grassChunks[MAP_SIZE]

    var player = {
        x: 0,
        height: PLAYER_HEIGHT,
        width: SIZE,
        y: -(grass.y * SIZE) - PLAYER_HEIGHT,
        meta: {
            color: PLAYER_COLOR
        }
    }

    main.insert(SurfaceDB.Rectangle(player))
    var viewModel = {
        camera: Observable({
            x: player.x - (WIDTH / 2),
            y: player.y - (HEIGHT / 2),
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
    var terrain = createTerrain({
        chunkSize: SIZE,
        ceiling: TERRAIN_HEIGHT,
        mapSize: MAP_SIZE
    })
    db.insert(terrain.surfaces)

    return terrain.grassChunks
}
