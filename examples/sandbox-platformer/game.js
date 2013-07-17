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
var GRAVITY = CONSTANTS.GRAVITY
var TERMINAL_VELOCITY = CONSTANTS.TERMINAL_VELOCITY
var createTerrain = require("./lib/generate-terrain.js")

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
        y: -(boundary.y * SIZE) - PLAYER_HEIGHT,
        xVelocity: 0,
        yVelocity: 0,
        jumpsAllowed: true,
        meta: {
            color: PLAYER_COLOR,
            type: "player"
        }
    })
    setupPlayer(main, player)

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
        player.xVelocity = changes.x
        if (changes.y < 0 && player.jumpsAllowed) {
            player.yVelocity = -SPEED
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
        tryMove(main, player, function () {
            viewModel.player.set(player)
        })
    })

    return viewModel
}

function tryMove(main, player, callback) {
    var deltaX = player.xVelocity * SPEED
    var deltaY = player.yVelocity * SPEED
    var newX = player.x + deltaX
    var newY = player.y + deltaY

    loop(function(next, finish) {
        if (Math.abs(player.y - newY) < 1) {
            return finish()
        }

        canMove(main, "player", {
            x: player.x,
            y: player.y + (deltaY > 0 ? 1 : -1)
        }, function (err, moveAllowed) {
            if (err) return finish(err)

            if (moveAllowed) {
                player.y = player.y + (deltaY > 0 ? 1 : -1)
                next()
            } else {
                player.jumpsAllowed = true
                player.yVelocity = 0
                finish()
            }
        })
    }, function (err) {
        if (err) throw err

        loop(function (next, finish) {
            if (Math.abs(player.x - newX) < 1) {
                return finish()
            }

            canMove(main, "player", {
                x: player.x + (deltaX > 0 ? 1 : -1),
                y: player.y
            }, function (err, moveAllowed) {
                if (err) return finish(err)

                if (moveAllowed) {
                    player.x = player.x + (deltaX > 0 ? 1 : -1)
                    next()
                } else {
                    finish()
                }
            })
        }, function (err) {
            if (err) throw err


        })
    })
}

function loop(body, callback) {
    body(function next() {
        body(next, callback)
    }, callback)
}



// canMove := (SurfaceDB, String, { x: Number, y: Number}, Callback<Boolean>)
function canMove(db, type, position, callback) {
    var lowerLeft = {
        x: position.x,
        y: position.y + PLAYER_HEIGHT - 1
    }
    var lowerRight = {
        x: position.x + SIZE,
        y: position.y + PLAYER_HEIGHT -1
    }

    db.point(lowerLeft, function (err, surfaces1) {
        if (err) return callback(err)

        db.point(lowerRight, function (err, surfaces2) {
            if (err) return callback(err)

            var surfaces = surfaces1.concat(surfaces2)
            // console.log("point query", lowerLeft, lowerRight, surfaces)
            var moveAllowed = surfaces.every(function (ent) {
                return ent.meta.type === type
            })

            callback(null, moveAllowed)
        })
    })
}

function setupPlayer(main, player) {
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

    return terrain.boundaryChunks
}
