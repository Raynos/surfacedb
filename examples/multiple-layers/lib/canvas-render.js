var document = require("global/document")
var raf = require("raf").polyfill

module.exports = CanvasRender

var SKY_COLOR = "rgb(87, 238, 255)"

// CanvasRender := (SurfaceDB, Observable<Surface>)
function CanvasRender(layers, opts, screen) {
    var canvas = document.createElement("canvas")
    canvas.height = opts.height
    canvas.width = opts.width
    canvas.style.width = opts.width + "px"
    canvas.style.height = opts.height + "px"
    canvas.style.border = "solid 1px black"
    var context = canvas.getContext("2d")

    raf(ondraw)

    function ondraw() {
        context.fillStyle = SKY_COLOR
        context.fillRect(0, 0, opts.width, opts.height)

        for (var i = 0; i < layers.length; i += 1) {
            layers[i].region(screen(), render)
        }
        raf(ondraw)
    }

    function render(err, surfaces) {
        if (err) {
            throw err
        }

        var screenSurface = screen()
        // console.log("clearing", opts.width, opts.height)

        for (var i = 0; i < surfaces.length; i++) {
            var surface = surfaces[i]
            var x = surface.meta.x - screenSurface.meta.x
            var y = surface.meta.y - screenSurface.meta.y
            var width = surface.meta.width
            var height = surface.meta.height

            context.fillStyle = surface.meta.color
            context.fillRect(x, y, width, height)
            // console.log("placing things in", x, y)

            if (surface.meta.outline) {
                context.strokeStyle = surface.meta.outline
                context.strokeRect(x, y, width, height)
            }
        }
    }

    return canvas
}
