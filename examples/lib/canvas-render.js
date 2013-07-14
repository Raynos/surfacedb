var document = require("global/document")
var window = require("global/window")

module.exports = CanvasRender

// CanvasRender := (SurfaceDB, Observable<Surface>)
function CanvasRender(db, opts, screen) {
    var canvas = document.createElement("canvas")
    canvas.height = opts.height
    canvas.width = opts.width
    canvas.style.width = opts.width + "px"
    canvas.style.height = opts.height + "px"
    canvas.style.border = "solid 1px black"
    var context = canvas.getContext("2d")

    window.requestAnimationFrame(ondraw)

    function ondraw() {
        db.region(screen(), render)
    }

    function render(err, surfaces) {
        if (err) {
            throw err
        }

        var screenSurface = screen()
        context.clearRect(0, 0, 640, 320)

        for (var i = 0; i < surfaces.length; i++) {
            var surface = surfaces[i]
            var x = surface.points[0].x - screenSurface.meta.x
            var y = surface.points[0].y - screenSurface.meta.y
            var width = surface.points[3].x - surface.points[0].x
            var height = surface.points[2].y - surface.points[0].y

            context.fillStyle = surface.meta.color
            context.fillRect(x, y, width, height)

            context.strokeStyle = "rgb(0, 0, 0)"
            context.strokeRect(x,y,width,height)
        }

        window.requestAnimationFrame(ondraw)
    }

    return canvas
}
