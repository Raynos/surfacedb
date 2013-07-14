/*jshint maxcomplexity: 10*/
var uuid = require("uuid")

module.exports = BucketLayer

function BucketLayer(opts) {
    var buckets = {}
    var items = {}
    var bucketSize = opts.size || 32

    return {
        insert: insert,
        update: update,
        remove: remove,
        point: point,
        region: region
    }

    function insert(surfaces, callback) {
        surfaces.forEach(function (surface) {
            surface.id = surface.id || uuid()
            items[surface.id] = surface

            var bb = surface.meta.bb
            var index = bucketIndex(bb.min.y, bb.min.y)
            var lastIndex = bucketIndex(bb.max.x, bb.max.y)

            var bucket, b

            for (var x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (var y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    index = bucketIndex(x, y)
                    bucket = buckets[index]
                    if (bucket) {
                        bucket[surface.id] = true
                    } else {
                        b = {}
                        b[surface.id] = true
                        buckets[index] = b
                    }
                }
            }

            if (index !== lastIndex) {
                bucket = buckets[lastIndex]
                if (bucket) {
                    bucket[surface.id] = true
                } else {
                    b = {}
                    b[surface.id] = true
                    buckets[lastIndex] = b
                }
            }
        })

        callback(null)
    }

    function update(surfaces, callback) {
        remove(surfaces)
        insert(surfaces)

        callback(null)
    }

    function remove(surfaces, callback) {
        surfaces.forEach(function (s) {
            var surface = items[s.id]
            items[surface.id] = null

            var bb = surface.meta.bb
            var bucket, index

            for (var x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (var y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    index = bucketIndex(x, y)
                    bucket = buckets[index]
                    if (bucket) {
                        bucket[surface.id] = null
                    }
                }
            }
        })

        callback(null)
    }

    function bucketIndex(x, y) {
        return Math.floor(x / bucketSize) + "-" + Math.floor(y / bucketSize)
    }

    function point(opts, callback) {
        var bucket = buckets[bucketIndex(opts.x, opts.y)] || {}

        callback(null, Object.keys(bucket).map(function (key) {
            return items[key]
        }).filter(function (surface) {
            return pointInSurface(opts, surface)
        }))
    }

    function region(surfaces, callback) {
        var query

        var matches = {}
        var result = []

        function insertResult(key) {
            if (!matches[key]) {
                matches[key] = true
                result.push(items[key])
            }
        }

        for (var i = 0; i < surfaces.length; i += 1) {
            query = surfaces[i]

            var bb = query.meta.bb
            var bucket

            for (var x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (var y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    bucket = buckets[bucketIndex(x, y)]
                    if (bucket) {
                        Object.keys(bucket).forEach(insertResult)
                    }
                }
            }
        }

        callback(null, result)
    }
}

function pointInSurface(point, surface) {
    var points = surface.points
    var len = points.length

    var i, j, inside = false

    for (i = 0, j = len - 1; i < len; j = i++) {
        if (
            ((points[i].y > point.y) !== (points[j].y > point.y)) &&
            (point.x < (points[j].x - points[i].x) * (point.y - points[i].y) /
                (points[j].y - points[i].y) + points[i].x)
        ) {
            inside = !inside
        }
    }

    return inside
}
