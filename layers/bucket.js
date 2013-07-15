/*jshint maxcomplexity: 10*/
var uuid = require("uuid")

module.exports = BucketLayer

function BucketLayer(opts) {
    var buckets = []
    var items = {}
    var bucketSize = opts.size || 32

    return {
        insert: insert,
        update: update,
        remove: remove,
        point: point,
        region: region,
        _items: items,
        _buckets: buckets
    }

    function insert(surfaces, callback) {
        var surface,
            bb,
            index,
            bucket,
            bucketsX,
            bucketsY,
            b, i, x, y

        for (i = 0; i < surfaces.length; i += 1) {
            surface = surfaces[i]
            surface.id = surface.id || uuid()
            items[surface.id] = surface

            bb = surface.meta.bb
            index = bucketIndex(bb.min.y, bb.min.y)

            bucketsX = Math.ceil((bb.max.x - bb.min.x)/(bucketSize))
            bucketsY = Math.ceil((bb.max.y - bb.min.y)/(bucketSize))

            for (x = 0; x < bucketsX; x += 1) {
                for (y = 0; y < bucketsY; y += 1) {
                    index = bucketIndex(bb.min.x + (x * bucketSize), bb.min.y + (y * bucketSize))
                    bucket = buckets[index]
                    if (bucket) {
                        if (!bucket[surface.id]) {
                            bucket[surface.id] = true
                            bucket.keys.push(surface.id)
                        }
                    } else {
                        b = {
                            keys: [surface.id]
                        }
                        b[surface.id] = true
                        buckets[index] = b
                    }
                }
            }
        }

        callback(null)
    }

    function update(surfaces, callback) {
        remove(surfaces)
        insert(surfaces)

        callback(null)
    }

    function remove(surfaces, callback) {
        var surface,
            bb,
            index,
            bucket,
            bucketsX,
            bucketsY,
            i, x, y

        for (i = 0; i < surfaces.length; i += 1) {
            surface = items[surfaces[i].id]
            delete items[surface.id]

            bb = surface.meta.bb
            index = bucketIndex(bb.min.y, bb.min.y)

            bucketsX = Math.ceil((bb.max.x - bb.min.x)/(bucketSize))
            bucketsY = Math.ceil((bb.max.y - bb.min.y)/(bucketSize))

            for (x = 0; x < bucketsX; x += 1) {
                for (y = 0; y < bucketsY; y += 1) {
                    index = bucketIndex(bb.min.x + (x * bucketSize), bb.min.y + (y * bucketSize))
                    bucket = buckets[index]
                    if (bucket) {
                        delete bucket[surface.id]
                        bucket.keys = Object.keys(bucket)
                    }
                }
            }
        }

        callback(null)
    }

    function bucketIndex(x, y) {
        var k1 = Math.floor(x / bucketSize)
        var k2 = Math.floor(y / bucketSize)
        return ((k1 + k2) * (k1 + k2 + 1)) + k2
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
        var surface,
            bb,
            index,
            bucket,
            bucketsX,
            bucketsY,
            i, x, y

        // NAUGHTY
        var matches = {}
        var result = []

        function insertResult(key) {
            if (!matches[key]) {
                matches[key] = true
                result.push(items[key])
            }
        }

        for (i = 0; i < surfaces.length; i += 1) {
            surface = surfaces[i]
            surface.id = surface.id || uuid()
            items[surface.id] = surface

            bb = surface.meta.bb
            index = bucketIndex(bb.min.y, bb.min.y)

            bucketsX = Math.ceil((bb.max.x - bb.min.x)/(bucketSize))
            bucketsY = Math.ceil((bb.max.y - bb.min.y)/(bucketSize))

            for (x = 0; x < bucketsX; x += 1) {
                for (y = 0; y < bucketsY; y += 1) {
                    index = bucketIndex(bb.min.x + (x * bucketSize), bb.min.y + (y * bucketSize))
                    bucket = buckets[index]
                    if (bucket) {
                        bucket.keys.forEach(insertResult)
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
