/*jshint maxcomplexity: 10*/
var uuid = require("uuid")

module.exports = AABB

function AABB(opts) {
    var items = {}
    var boxCount = opts.boxCount || 10
    var tree = buildTree([])

    return {
        insert: insert,
        update: update,
        remove: remove,
        point: point,
        region: region,
        _items: items
    }

    function insert(surfaces, callback) {
        var input = surfaces.map(function (surface) {
            surface.id = uuid()
            surface.bb = conformBB(surface.meta.bb)
            surface.centroid = centroid(surface.bb)
            return surface
        })

        Object.keys(items).forEach(function (key) {
            input.push(items[key])
        })

        items = {}

        tree = buildTree(input)
        console.log(tree)
        callback(null)
    }

    function buildTree(surfaces) {
        if (surfaces.length <= boxCount) {
            return {
                bb: surfaceBB(surfaces),
                surfaces: surfaces,
            }
        } else {
            var partition = computePartition(surfaces)

            return {
                bb: surfaceBB(surfaces),
                left: buildTree(leftPartition(partition, surfaces)),
                right: buildTree(rightPartition(partition, surfaces))
            }
        }
    }

    function computePartition(surfaces) {
        var bb = surfaceBB(surfaces)

        var bbWidth = bb.maxX - bb.minX
        var bbHeight = bb.maxY - bb.minY

        if (bbWidth >= bbHeight) {
            return {
                axis: "x",
                position: bb.minX + (bbWidth / 2)
            }
        } else {
            return {
                axis: "y",
                position: bb.minY + (bbHeight / 2)
            }
        }
    }

    function leftPartition(partition, surfaces) {
        return surfaces.filter(function (s) {
            return s.centroid[partition.axis] < partition.position
        })
    }

    function rightPartition(partition, surfaces) {
        return surfaces.filter(function (s) {
            return s.centroid[partition.axis] >= partition.position
        })
    }

    function surfaceBB(surfaces) {
        if (surfaces.length === 0) {
            return {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0
            }
        }

        var minX = Infinity
        var minY = Infinity
        var maxX = -Infinity
        var maxY = -Infinity

        surfaces.forEach(function (surface) {
            var bb = surface.bb
            if (bb.minX < minX) {
                minX = bb.minX
            }
            if (bb.minY < minY) {
                minY = bb.minY
            }
            if (bb.maxX > maxX) {
                maxX = bb.maxX
            }
            if (bb.maxY > maxY) {
                maxY = bb.maxY
            }
        })

        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        }
    }

    function centroid(bb) {
        return {
            x: bb.minX + ((bb.maxX - bb.minX) / 2),
            y: bb.minY + ((bb.maxY - bb.minY) / 2)
        }
    }

    function update(surfaces, callback) {
        // TODO
        callback(new Error("not implemented"))
    }

    function remove(surfaces, callback) {
        // TODO
        callback(new Error("not implemented"))
    }

    function point(opts, callback) {
        // TODO
        callback(new Error("not implemented"))
    }

    function region(surfaces, callback) {
        var results = []

        for (var i = 0; i < surfaces.length; i += 1) {
            results = results.concat(queryTree(tree, conformBB(surfaces[i].meta.bb)))
        }

        callback(null, results)
    }

    function conformBB(bb) {
        return {
            minX: bb.min.x,
            minY: bb.min.y,
            maxX: bb.max.x,
            maxY: bb.max.y
        }
    }

    function queryTree(tNode, bb) {
        if (boxIntersection(tNode.bb, bb)) {
            if (tNode.surfaces) {
                return tNode.surfaces
            }
        } else {
            return []
        }

        return queryTree(tNode.left, bb).concat(queryTree(tNode.right, bb))
    }
}

function boxIntersection(leftBB, rightBB) {
    return !(leftBB.maxX <= rightBB.minX ||
        rightBB.maxX <= leftBB.minX ||
        leftBB.maxY <= rightBB.minY ||
        rightBB.maxY <= leftBB.minY)
}
