var document = require("global/document")
var window = require("global/window")

module.exports = CanvasRender

// CanvasRender := (SurfaceDB, Observable<Surface>)
function CanvasRender(db, screen) {
    var canvas = document.createElement("canvas")
    canvas.style.width = "640px"
    canvas.style.height = "320px"
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
            context.fillStyle = surface.meta.color
            context.fillRect(
                surface.points[0].x - screenSurface.meta.x,
                surface.points[0].y - screenSurface.meta.y,
                surface.points[3].x - surface.points[0].x,
                surface.points[2].y - surface.points[0].y)
        }

        window.requestAnimationFrame(ondraw)
    }

    return canvas
}
