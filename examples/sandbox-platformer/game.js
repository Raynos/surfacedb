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
var SPEED = CONSTANTS.SPEED
var JUMP_SPEED = CONSTANTS.JUMP_SPEED
var GRAVITY = CONSTANTS.GRAVITY
var TERMINAL_VELOCITY = CONSTANTS.TERMINAL_VELOCITY

var createTerrain = require("./lib/generate-terrain.js")
var persist = require("./lib/persist-entity.js")
var moveUntilCollision = require("./lib/collision.js")

module.exports = Game

function Game(db, inputs) {
    var main = db.addLayer("main", {
        sceneGraph: "bucket"
    })

    var boundaryChunks = initTerrain(main)
    var boundary = boundaryChunks[MAP_SIZE]

    var player = Observable({
        x: 0,
        height: PLAYER_HEIGHT,
        width: SIZE,
        y: -(boundary.y * SIZE) - PLAYER_HEIGHT - 1,
        xVelocity: 0,
        yVelocity: 0,
        jumpsAllowed: true,
        meta: {
            color: PLAYER_COLOR,
            type: "entity",
            outline: "rgb(0, 0, 255)"
        }
    })

    persist(main, player, SurfaceDB.Rectangle)

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
        var player = viewModel.player()
        player.xVelocity = changes.x * SPEED
        if (changes.y < 0 && player.jumpsAllowed) {
            player.yVelocity = -JUMP_SPEED
            player.jumpsAllowed = false
        }
        viewModel.player.set(player)
    })

    inputs.on("pulse", function () {
        var player = viewModel.player()

        // gravity
        player.yVelocity = Math.min(
            TERMINAL_VELOCITY, player.yVelocity + GRAVITY)

        // move
        moveUntilCollision(main, player, function (err, changes) {
            if (err) throw err

            player.x += changes.deltaX
            player.y += changes.deltaY

            if (changes.collideY) {
                player.jumpsAllowed = true
                player.yVelocity = 0
            }

            viewModel.player.set(player)
        })
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

    return terrain.boundaryChunks
}
