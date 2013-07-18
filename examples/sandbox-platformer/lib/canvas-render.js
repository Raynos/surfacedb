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

            context.fillStyle = surface.meta.color
            context.fillRect(x, y, width, height)

            if (surface.meta.outline) {
                context.strokeStyle = surface.meta.outline
                context.strokeRect(x, y, width, height)
            }
        }
    }

    return canvas
}
