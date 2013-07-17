var noise = require("perlin").noise
var uuid = require("uuid")

var SurfaceDB = require("../../../index.js")

var SKY_COLOR = "rgb(87, 238, 255)"
var GRASS_COLOR = "rgb(59, 217, 15)"
var DIRT_COLOR = "rgb(87, 51, 2)"
var BLACK = "rgb(0, 0, 0)"

module.exports = createSurfaces

function createSurfaces(opts) {
    opts = opts || {}
    var chunkSize = opts.chunkSize || 64

    var surfaces = []
    var ceiling = opts.ceiling || 20
    var mapSize = opts.mapSize || 100
    var generateChunks = perlinTerrain(uuid(), null, ceiling)
    var grassChunks = generateChunks({ x: -(mapSize), y: 0 }, mapSize * 2)

    for (var i = 0; i < grassChunks.length; i++) {
        var left = Math.max(0, i - 1)
        var right = Math.min(grassChunks.length - 1, i + 1)
        var point = grassChunks[i]

        var grassPoint = Math.min(grassChunks[left].y,
            point.y, grassChunks[right].y)
        var minGrass = Math.min(point.y, grassPoint)
        var maxGrass = Math.max(point.y, grassPoint)

        minGrass < maxGrass && minGrass++
        for (var j = -(ceiling); j <= maxGrass; j++) {
            var color = j < minGrass ? DIRT_COLOR :
                j > maxGrass ? SKY_COLOR : GRASS_COLOR
            var outline = j > maxGrass ? undefined : BLACK

            surfaces.push(SurfaceDB.Rectangle({
                x: point.x * chunkSize,
                y: -(j * chunkSize),
                width: chunkSize,
                height: chunkSize,
                meta: { color: color, outline: outline }
            }))
        }
    }

    return {
        grassChunks: grassChunks,
        surfaces: surfaces
    }
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
