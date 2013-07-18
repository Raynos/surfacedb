var extend = require("xtend")

module.exports = clip

function clip(layer) {
    return extend(layer, {
        region: function (opts, callback) {
            layer.region(opts, function (err, surfaces) {
                if (err) {
                    return callback(err)
                }

                var bb = opts.meta.bb

                callback(null, surfaces.filter(function (s) {
                    return boxIntersection(s.meta.bb, bb)
                }))
            })
        }
    })
}

function boxIntersection(leftBB, rightBB) {
    return !(leftBB.max.x <= rightBB.min.x ||
        rightBB.max.x <= leftBB.min.x ||
        leftBB.max.y <= rightBB.min.y ||
        rightBB.max.y <= leftBB.min.y
    )
}