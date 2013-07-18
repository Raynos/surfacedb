var computed = require("observ/computed")
var SurfaceDB = require("../../index.js")

var CONSTANTS = require("./constants")
var WIDTH = CONSTANTS.WIDTH
var HEIGHT = CONSTANTS.HEIGHT
var SKY_COLOR = CONSTANTS.SKY_COLOR
var CanvasRender = require("./lib/canvas-render.js")

module.exports = Display

/*  Display := (
        db: SurfaceDB,
        viewModel: Object<String, Observable>
    ) => { view: DOMElement }
*/
function Display(database, viewModel) {
    var canvas = CanvasRender(database.layer("main"), {
        width: WIDTH,
        height: HEIGHT,
        blankColor: SKY_COLOR
    }, computed([viewModel.camera], SurfaceDB.Rectangle))

    return { view: canvas }
}
