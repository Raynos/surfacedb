/*jshint maxcomplexity: 10*/
var uuid = require("uuid")

module.exports = NaiveLayer

function NaiveLayer() {
    var items = {}

    return {
        insert: insert,
        update: update,
        remove: remove,
        point: point,
        region: region
    }

    function insert(surfaces, callback) {
        surfaces.forEach(function (surface) {
            surface.id = uuid()
            items[surface.id] = surface
        })

        callback(null)
    }

    function update(surfaces, callback) {
        surfaces.forEach(function (surface) {
            items[surface.id] = surface
        })

        callback(null)
    }

    function remove(surfaces, callback) {
        surfaces.forEach(function (surface) {
            items[surface.id] = null
        })

        callback(null)
    }

    function point(opts, callback) {
        callback(null, Object.keys(items).map(function (key) {
            return items[key]
        }).filter(function (surface) {
            return pointInSurface(opts, surface)
        }))
    }

    function region(surfaces, callback) {
        callback(null, Object.keys(items).map(function (key) {
            return items[key]
        }).filter(function (surface) {
            return surfaces.some(function (other) {
                return boxIntersection(other.meta.bb, surface.meta.bb)
            })
        }))
    }
}

function boxIntersection(leftBB, rightBB) {
    return !(leftBB.max.x < rightBB.min.x ||
        rightBB.max.x < leftBB.min.x ||
        leftBB.max.y < rightBB.min.y ||
        rightBB.max.y < leftBB.min.y
    )
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
