var Layers = {
    naive: require("./layers/naive.js")
}

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

        var layer = layers[name] = createLayer()
        return layer
    }

    function insert(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }

        layers[name].insert(surfaces, callback)
    }
    function update(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }

        layers[name].update(surfaces, callback)
    }
    function remove(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        if (!callback) {
            callback = noop
        }

        layers[name].remove(surfaces, callback)
    }
    function point(name, opts, callback) {
        layers[name].point(opts, callback)
    }
    function region(name, surfaces, callback) {
        if (!Array.isArray(surfaces)) {
            surfaces = [surfaces]
        }

        layers[name].region(surfaces, callback)
    }
}

function noop() {}
