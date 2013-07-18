var document = require("global/document")
var raf = require("raf").polyfill

module.exports = CanvasRender

// CanvasRender := (SurfaceDB, Object, Observable<Surface>)
function CanvasRender(db, opts, viewport) {
    var canvas = document.createElement("canvas")
    canvas.height = opts.height
    canvas.width = opts.width
    canvas.style.width = opts.width + "px"
    canvas.style.height = opts.height + "px"
    canvas.style.border = "solid 1px black"
    var context = canvas.getContext("2d")

    var textures = {
        grass: createBlock(opts.grass),
        dirt: createBlock(opts.dirt),
        rock: createBlock(opts.rock),
        entity: createBlock(opts.entity)
    }

    raf(ondraw)

    function ondraw() {
        context.fillStyle = opts.blankColor
        context.fillRect(0, 0, opts.width, opts.height)

        db.region(viewport(), render)
        raf(ondraw)
    }

    function render(err, surfaces) {
        if (err) {
            throw err
        }

        var screenSurface = viewport()

        for (var i = 0; i < surfaces.length; i++) {
            var surface = surfaces[i]
            var x = surface.meta.x - screenSurface.meta.x
            var y = surface.meta.y - screenSurface.meta.y
            var width = surface.meta.width
            var height = surface.meta.height

            context.putImageData(textures[surface.meta.type], x, y)

            if (surface.meta.outline) {
                context.strokeStyle = surface.meta.outline
                context.strokeRect(x, y, width, height)
            }
        }
    }

    return canvas
}

function createBlock(opts) {
    return blockBuffer(opts.width, opts.height, opts.color, opts.outline)
}

function blockBuffer(width, height, color, outline) {
    var canvas = createCanvas(width, height)
    var context = canvas.getContext("2d")

    context.fillStyle = color
    context.fillRect(0, 0, width, height)

    if (outline) {
        context.strokeStyle = outline
        context.strokeRect(0, 0, width, height)
    }

    return context.getImageData(0, 0, width, height)
}

function createCanvas(width, height) {
    var canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    return canvas
}