var noise = require("perlin").noise
// var uuid = require("uuid")

var SurfaceDB = require("../../../index.js")

var SKY_COLOR = "rgb(87, 238, 255)"
var GRASS_COLOR = "rgb(59, 217, 15)"
var DIRT_COLOR = "rgb(87, 51, 2)"
var BLACK = "rgb(0, 0, 0)"
var ROCK_COLOR = "rgb(70, 70, 70)"
var ROCK_OFFSET = 8

module.exports = createSurfaces

function createSurfaces(opts) {
    opts = opts || {}
    var chunkSize = opts.chunkSize || 64

    var surfaces = []
    var ceiling = opts.ceiling || 20
    var boundingBox = opts.boundingBox || { minX: -100, maxX: 100 }
    var seed = opts.seed || Math.floor(Math.random() * 1000)

    var distance = boundingBox.maxX - boundingBox.minX
    var generateChunks = perlinTerrain(seed, null, ceiling)
    var start = { x: boundingBox.minX, y: 0 }
    var grassChunks = generateChunks(start, distance)
    var rockChunks = generateChunks(start, distance).map(function (chunk) {
        chunk.y -= ROCK_OFFSET
        return chunk
    })

    for (var i = 0; i < grassChunks.length; i++) {
        var left = Math.max(0, i - 1)
        var right = Math.min(grassChunks.length - 1, i + 1)
        var point = grassChunks[i]
        var rockChunkY = rockChunks[i].y

        var grassPoint = Math.min(grassChunks[left].y,
            point.y, grassChunks[right].y)
        var minGrass = Math.min(point.y, grassPoint)
        var maxGrass = Math.max(point.y, grassPoint)

        minGrass < maxGrass && minGrass++
        for (var j = -(ceiling); j <= Math.max(maxGrass, rockChunkY); j++) {
            var color = j <= rockChunkY ? ROCK_COLOR :
                j < minGrass ? DIRT_COLOR :
                j > maxGrass ? SKY_COLOR : GRASS_COLOR

            surfaces.push(SurfaceDB.Rectangle({
                x: point.x * chunkSize,
                y: -(j * chunkSize),
                width: chunkSize,
                height: chunkSize,
                meta: { color: color, outline: BLACK }
            }))
        }
    }

    return {
        boundaryChunks: grassChunks.map(function (chunk, index) {
            return chunk.y > rockChunks[index].y ? chunk : rockChunks[index]
        }),
        surfaces: surfaces
    }
}

function perlinTerrain(seed, floor, ceiling, divisor) {
    floor = floor || 0
    ceiling = ceiling || 20 // minecraft's limit
    divisor = divisor || 50
    // noise.seed(seed)

    return function generateChunk(position, width) {
        var line = seed
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
