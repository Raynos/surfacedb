var noise = require("perlin").noise

var SurfaceDB = require("../../index.js")

var SKY_COLOR = "rgb(87, 238, 255)"
var GRASS_COLOR = "rgb(59, 217, 15)"
var DIRT_COLOR = "rgb(87, 51, 2)"

module.exports = createSurfaces

function createSurfaces(opts) {
    opts = opts || {}
    var size = opts.size || 64

    var surfaces = []
    for (var i = 0; i < 40; i++) {
        for (var j = 0; j < 40; j++) {
            var r = Math.floor(Math.random() * 256)
            var g = Math.floor(Math.random() * 256)
            var b = Math.floor(Math.random() * 256)

            surfaces.push(SurfaceDB.Rectangle({
                x: i * size,
                y: j * size,
                width: size,
                height: size,
                meta: {
                    color: "rgb(" + r + "," + g + "," + b + ")"
                }
            }))
        }
    }

    perlinTerrain("fawfwafwaf")({ x: 0, y: 0 }, 20)

    return surfaces
}

function perlinTerrain(seed, floor, ceiling, divisor) {
    floor = floor || 0
    ceiling = ceiling || 20 // minecraft's limit
    divisor = divisor || 50
    noise.seed(seed)

    return function generateChunk(position, width) {
        var surfaces = []
        var startX = position.x * width
        var startY = position.y * width

        for (var x = startX; x < startX + width; x++) {
            var n = noise.simplex2(x / divisor, 0)
            var y = ~~scale(n, -1, 1, floor, ceiling)
            if (y === floor || startY < y && y < startY + width) {
                var xidx = Math.abs((width + x % width) % width)
                var yidx = Math.abs((width + y % width) % width)
                console.log("x", x, "y", y, "xidx", xidx, "yidx", yidx)
            }
        }

        return surfaces
    }
}

function scale( x, fromLow, fromHigh, toLow, toHigh ) {
    return ( x - fromLow ) * ( toHigh - toLow ) /
        ( fromHigh - fromLow ) + toLow
}
