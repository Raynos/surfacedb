var noise = require("perlin").noise
// var uuid = require("uuid")

var SurfaceDB = require("../../../index.js")

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
    var generateChunks = perlinTerrain(null, ceiling)
    var start = { x: boundingBox.minX, y: 0 }
    var grassChunks = generateChunks(seed, start, distance)
    var rockChunks = generateChunks(seed + 100, start, distance)
        .map(function (chunk) {
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
            var type = j <= rockChunkY ? "rock" :
                j < minGrass ? "dirt" :
                j > maxGrass ? "sky" : "grass"

            surfaces.push(SurfaceDB.Rectangle({
                x: point.x * chunkSize,
                y: -(j * chunkSize),
                width: chunkSize,
                height: chunkSize,
                meta: { type: type }
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

function perlinTerrain(floor, ceiling, divisor) {
    floor = floor || 0
    ceiling = ceiling || 20 // minecraft's limit
    divisor = divisor || 50
    // noise.seed(seed)

    return function generateChunk(seed, position, width) {
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
