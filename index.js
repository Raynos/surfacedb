var Layers = {
    naive: require("./layers/naive.js"),
    bucket: require("./layers/bucket.js")
}

SurfaceDB.Rectangle = require("./rectangle")

module.exports = SurfaceDB

function SurfaceDB(opts) {
    opts = opts || {}
    var layers = {}

    if (opts.layers) {
        Object.keys(opts.layers).forEach(function (name) {
            addLayer(name, {
                sceneGraph: opts.layers[name]
            })
        })
    }

    return {
        addLayer: addLayer,
        insert: insert,
        update: update,
        remove: remove,
        point: point,
        region: region
    }

    function addLayer(name, opts) {
        var createLayer = Layers[opts.sceneGraph]

        if (!createLayer) {
            throw new Error("Unknown scene graph")
        }

        var layer = layers[name] = createLayer(opts)
        return layer
    }

    function insert(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }
        var layer = layers[name]

        if (!layer) {
            throw new Error("Cannot insert into unknown layer " + name)
        }

        layer.insert(surfaces, callback)
    }
    function update(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }
        var layer = layers[name]

        if (!layer) {
            throw new Error("Cannot update into unknown layer " + name)
        }

        layer.update(surfaces, callback)
    }
    function remove(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }
        var layer = layers[name]

        if (!layer) {
            throw new Error("Cannot remove into unknown layer " + name)
        }

        layer.remove(surfaces, callback)
    }
    function point(name, opts, callback) {
        var layer = layers[name]

        if (!layer) {
            throw new Error("Cannot point into unknown layer " + name)
        }
        layer.point(opts, callback)
    }
    function region(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }
        var layer = layers[name]

        if (!layer) {
            throw new Error("Cannot region into unknown layer " + name)
        }

        layer.region(surfaces, callback)
    }
}

function noop() {}
