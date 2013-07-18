var Observable = require("observ")
// var computed = require("observ/computed")
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
var GENERATION_DISTANCE = CONSTANTS.GENERATION_DISTANCE

var createTerrain = require("./lib/generate-terrain.js")
var persist = require("./lib/persist-entity.js")
var moveUntilCollision = require("./lib/collision.js")

module.exports = Game

function Game(db, inputs) {
    var main = db.addLayer("main", {
        sceneGraph: "bucket"
    })

    var worldSeed = Math.floor(Math.random() * 1000)
    var world = Observable({
        minX: -MAP_SIZE,
        maxX: MAP_SIZE
    })
    var boundaryChunks = generateTerrain(main, world(), worldSeed)
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

    var viewModel = {
        camera: Observable({
            x: player().x - (WIDTH / 2),
            y: player().y - (HEIGHT / 2),
            width: WIDTH + (SIZE * 2),
            height: HEIGHT + (SIZE * 2)
        }),
        world: world,
        player: player
    }

    persist(main, player, SurfaceDB.Rectangle)

    viewModel.player(function (player) {
        var world = viewModel.world()
        if (Math.abs(player.x - world.minX * SIZE) < GENERATION_DISTANCE) {
            viewModel.world.set({
                minX: world.minX - MAP_SIZE * 2,
                maxX: world.maxX
            })
        } else if (Math.abs(player.x - world.maxX * SIZE) <
            GENERATION_DISTANCE
        ) {
            viewModel.world.set({
                minX: world.minX,
                maxX: world.maxX + MAP_SIZE * 2
            })
        }


    })

    accumulate(viewModel.world, function (prevWorld, currWorld) {
        var box = {}
        if (prevWorld.minX > currWorld.minX) {
            box.minX = currWorld.minX
            box.maxX = prevWorld.minX
        } else if (prevWorld.maxX < currWorld.maxX) {
            box.minX = prevWorld.maxX
            box.maxX = currWorld.maxX
        }

        if (box.minX && box.maxX) {
            generateTerrain(main, box, worldSeed)
        }

        return currWorld
    })

    viewModel.player(function (player) {
        // var camera = viewModel.camera()
        // // var deltaX =
        // // var deltaY =

        // if (player.x < camera.x - WIDTH / 4) {
        //     camera.x = player.x - WIDTH / 4
        // } else if (player.x > camera.x + WIDTH / 4) {
        //     camera.x = player.x - (3 * WIDTH / 4)
        // }

        // if (player.y < camera.y - HEIGHT / 4) {
        //     camera.y = player.y - HEIGHT / 4
        // } else if (player.y > camera.y + HEIGHT / 4) {
        //     camera.y = player.y - (3 * HEIGHT / 4)
        // }

        viewModel.camera.set({
            x: player.x - (WIDTH / 2),
            y: player.y - (HEIGHT / 2),
            width: WIDTH + (SIZE * 2),
            height: HEIGHT + (SIZE * 2)
        })
    })

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

function accumulate(obs, lambda, initial) {
    initial = initial || obs()
    var result = Observable(initial)

    obs(function (value) {
        result.set(lambda(result(), value))
    })

    return result
}

function generateTerrain(db, world, seed) {
    var terrain = createTerrain({
        chunkSize: SIZE,
        ceiling: TERRAIN_HEIGHT,
        boundingBox: world,
        seed: seed
    })
    db.insert(terrain.surfaces)

    return terrain.boundaryChunks
}
