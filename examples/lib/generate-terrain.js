var noise = require("perlin").noise
var uuid = require("uuid")

var SurfaceDB = require("../../index.js")

var SKY_COLOR = "rgb(87, 238, 255)"
var GRASS_COLOR = "rgb(59, 217, 15)"
var DIRT_COLOR = "rgb(87, 51, 2)"

module.exports = createSurfaces

function createSurfaces(opts) {
    opts = opts || {}
    var size = opts.size || 64

    var surfaces = []
    var chunks = perlinTerrain(uuid())({ x: -100, y: 0 }, 200)

    for (var i = 0; i < chunks.length; i++) {
        var grassPoint = chunks[i]
        for (var j = -20; j < 20; j++) {
            var color = j < grassPoint.y ? DIRT_COLOR :
                j > grassPoint.y ? SKY_COLOR : GRASS_COLOR

            surfaces.push(SurfaceDB.Rectangle({
                x: grassPoint.x * size,
                y: -(j * size),
                width: size,
                height: size,
                meta: { color: color }
            }))
        }
    }

    return surfaces
}

function perlinTerrain(seed, floor, ceiling, divisor) {
    floor = floor || 0
    ceiling = ceiling || 20 // minecraft's limit
    divisor = divisor || 50
    noise.seed(seed)

    return function generateChunk(position, width) {
        var line = Math.floor(Math.random() * 1000)
        var chunks = []
        var startX = position.x

        for (var x = startX; x < startX + width; x++) {
            var n = noise.simplex2(x / divisor, line)
            var y = ~~scale(n, -1, 1, floor, ceiling)
            chunks.push({ x: x, y: y })
        }

        return chunks
    }
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
    return ( x - fromLow ) * ( toHigh - toLow ) /
        ( fromHigh - fromLow ) + toLow
}
