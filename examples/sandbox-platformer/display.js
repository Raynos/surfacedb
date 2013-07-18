var computed = require("observ/computed")
var SurfaceDB = require("../../index.js")

var clip = require("../../lib/surface-clip.js")
var simpleCache = require("../../lib/surface-simple-cache.js")

var CONSTANTS = require("./constants")
var WIDTH = CONSTANTS.WIDTH
var HEIGHT = CONSTANTS.HEIGHT
var SKY_COLOR = CONSTANTS.SKY_COLOR
var GRASS_COLOR = "rgb(59, 217, 15)"
var DIRT_COLOR = "rgb(87, 51, 2)"
var BLACK = "rgb(0, 0, 0)"
var ROCK_COLOR = "rgb(70, 70, 70)"

var CanvasRender = require("./lib/canvas-render.js")

module.exports = Display

/*  Display := (
        db: SurfaceDB,
        viewModel: Object<String, Observable>
    ) => { view: DOMElement }
*/
function Display(database, viewModel) {
    var layer = database.layer("main")

    layer = simpleCache(layer, {
        deltaX: 32,
        deltaY: 32
    })
    layer = clip(layer)

    var canvas = CanvasRender(layer, {
        width: WIDTH,
        height: HEIGHT,
        blankColor: SKY_COLOR,
        grass: {
            width: CONSTANTS.SIZE,
            height: CONSTANTS.SIZE,
            color: GRASS_COLOR,
            outline: BLACK
        },
        dirt: {
            width: CONSTANTS.SIZE,
            height: CONSTANTS.SIZE,
            color: DIRT_COLOR,
            outline: BLACK
        },
        rock: {
            width: CONSTANTS.SIZE,
            height: CONSTANTS.SIZE,
            color: ROCK_COLOR,
            outline: null
        },
        entity: {
            width: CONSTANTS.SIZE,
            height: CONSTANTS.PLAYER_HEIGHT,
            color: CONSTANTS.PLAYER_COLOR,
            outline: "blue"
        }
    }, computed([viewModel.camera], SurfaceDB.Rectangle))

    return { view: canvas }
}
