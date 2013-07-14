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
                return boxIntersection(
                    boundingBox(other), boundingBox(surface))
            })
        }))
    }
}

function boundingBox(surface) {
    return surface.points.reduce(function (acc, point) {
        return {
            min: {
                x: point.x < acc.min.x ? point.x : acc.min.x,
                y: point.y < acc.min.y ? point.y : acc.min.y
            },
            max: {
                x: point.x > acc.max.x ? point.x : acc.max.x,
                y: point.y > acc.max.y ? point.y : acc.max.y
            }
        }
    }, {
        min: { x: Infinity, y: Infinity },
        max: { x: -Infinity, y: -Infinity }
    })
}

function boxIntersection(leftBB, rightBB) {
    return !(leftBB.max.x < rightBB.min.x ||
        rightBB.max.x < leftBB.min.x ||
        leftBB.max.y < rightBB.min.y ||
        rightBB.max.y < leftBB.min.y
    )
}

function surfaceIntersection(leftSurface, rightSurface) {
    var leftBB = boundingBox(leftSurface)
    var rightBB = boundingBox(rightSurface)

    if (!boxIntersection(leftBB, rightBB)) {
        return false
    }

    var bb = {
        min: {
            x: Math.max(leftBB.min.x, rightBB.min.x),
            y: Math.max(leftBB.min.y, rightBB.min.y)
        },
        max: {
            x: Math.min(leftBB.max.x, rightBB.max.x),
            y: Math.min(leftBB.max.y, rightBB.max.y)
        }
    }

    var containingPoints = leftSurface.points
        .concat(rightSurface.points)
        .filter(function (point) {
            return (bb.min.x <= point.x && point.x <= bb.max.x) &&
                (bb.min.y <= point.y && point.y <= bb.max.y)
        })

    if (containingPoints.length === 0) {
        return true
    }

    return leftSurface.points.some(function (point) {
        return pointInSurface(point, rightSurface)
    }) || rightSurface.points.some(function (point) {
        return pointInSurface(point, leftSurface)
    })
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
