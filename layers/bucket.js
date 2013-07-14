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
            lastIndex,
            bucket,
            b, i, x, y

        for (i = 0; i < surfaces.length; i += 1) {
            surface = surfaces[i]
            surface.id = surface.id || uuid()
            items[surface.id] = surface

            bb = surface.meta.bb
            index = bucketIndex(bb.min.y, bb.min.y)
            lastIndex = bucketIndex(bb.max.x, bb.max.y)

            for (x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    index = bucketIndex(x, y)
                    bucket = buckets[index]
                    if (bucket) {
                        bucket[surface.id] = true
                        bucket.keys.push(surface.id)
                    } else {
                        b = {
                            keys: [surface.id]
                        }
                        b[surface.id] = true
                        buckets[lastIndex] = b
                    }
                }
            }

            if (index !== lastIndex) {
                bucket = buckets[lastIndex]
                if (bucket) {
                    bucket[surface.id] = true
                    bucket.keys.push(surface.id)
                } else {
                    b = {
                        keys: [surface.id]
                    }
                    b[surface.id] = true
                    buckets[lastIndex] = b
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
            lastIndex,
            bucket,
            i, x, y

        for (i = 0; i < surfaces.length; i += 1) {
            surface = surfaces[i]
            surface.id = surface.id || uuid()
            items[surface.id] = surface

            bb = surface.meta.bb
            index = bucketIndex(bb.min.y, bb.min.y)
            lastIndex = bucketIndex(bb.max.x, bb.max.y)

            for (x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    index = bucketIndex(x, y)
                    bucket = buckets[index]
                    if (bucket) {
                        delete bucket[surface.id]
                        bucket.keys = Object.keys(bucket)
                    }
                }
            }

            if (index !== lastIndex) {
                bucket = buckets[lastIndex]
                if (bucket) {
                    delete bucket[surface.id]
                    bucket.keys = Object.keys(bucket)
                }
            }
        }

        callback(null)
    }

    function bucketIndex(x, y) {
        var k1 = x >= 0 ? (x / bucketSize) >> 0 : (x / bucketSize) - 1
        var k2 = y >= 0 ? (y / bucketSize) >> 0 : (y / bucketSize) - 1
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
        var query

        // NAUGHTY
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
            var bucket, index, lastIndex = bucketIndex(bb.max.x, bb.max.y)

            for (var x = bb.min.x; x < bb.max.x; x += bucketSize) {
                for (var y = bb.min.y; y < bb.max.y; y += bucketSize) {
                    index = bucketIndex(x, y)
                    bucket = buckets[index]
                    if (bucket) {
                        bucket.keys.forEach(insertResult)
                    }
                }
            }

            if (index !== lastIndex) {
                bucket = buckets[lastIndex]
                if (bucket) {
                    bucket.keys.forEach(insertResult)
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
