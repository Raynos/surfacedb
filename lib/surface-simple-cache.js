var extend = require("xtend")

module.exports = simpleCache

function simpleCache(layer, opts) {
    var cache = []
    var region = {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: 0,
            y: 0
        }
    }

    var deltaX = opts.deltaX
    var deltaY = opts.deltaY

    function CacheRegion(opts, callback) {
        var bb = opts.meta.bb

        if (bb.max.x > region.max.x ||
            bb.max.y > region.max.y ||
            bb.min.x < region.min.x ||
            bb.min.y < region.min.y) {
            region = {
                min: {
                    x: bb.min.x - deltaX,
                    y: bb.min.y - deltaY
                },
                max: {
                    x: bb.max.x + deltaX,
                    y: bb.max.y + deltaY
                }
            }
            var newQuery = extend(opts, {
                meta: {
                    bb: region
                }
            })

            console.log("New query")

            layer.region(newQuery, function (err, data) {
                if (err) {
                    return callback(err)
                }

                cache = data
                callback(null, data)
            })
        } else {
            callback(null, cache)
        }
    }

    return extend(layer, {
        region: CacheRegion
    })
}