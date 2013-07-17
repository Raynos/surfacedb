var Observable = require("observ")
var computed = require("observ/computed")
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
    var player = setupPlayer(main, grassChunks)

    var viewModel = {
        camera: computed([player], function (player) {
            return {
                x: player.x - (WIDTH / 2),
                y: player.y - (HEIGHT / 2),
                width: WIDTH + (SIZE * 2),
                height: HEIGHT + (SIZE * 2)
            }
        }),
        player: player
    }

    inputs.on("move", function (changes) {
        var coords = viewModel.player()
        coords.x += changes.x
        coords.y += changes.y
        viewModel.player.set(coords)
    })

    return viewModel
}

function setupPlayer(main, grassChunks) {
    var grass = grassChunks[MAP_SIZE]

    var player = Observable({
        x: 0,
        height: PLAYER_HEIGHT,
        width: SIZE,
        y: -(grass.y * SIZE) - PLAYER_HEIGHT,
        meta: {
            color: PLAYER_COLOR
        }
    })

    main.insert(SurfaceDB.Rectangle(player()),
        function (err, surfaces) {
            if (err) {
                throw err
            }

            var surface = surfaces[0]
            player(function (player) {
                var newSurface = SurfaceDB.Rectangle(player)
                newSurface.id = surface.id
                main.update(newSurface)
            })
        })

    return player
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
