var window = require("global/window")
var document = require("global/document")
var SurfaceDB = require("../index.js")

var Inputs = require("./inputs.js")
var Game = require("./game.js")
var Display = require("./display.js")

var db = window.db = SurfaceDB()
var app = App(db)
document.body.appendChild(app.view)

/*  Inputs := (window: WindowContext) => inputs: EventEmitter
    Game := (db: SurfaceDB, inputs: EventEmitter) =>
        viewModel: Object<String, Observable>
    Display := (
        db: SurfaceDB,
        viewModel: Object<String, Observable>
    ) => { view: DOMElement }

    Inputs should work with both DOM based window and server
        side openGL based window
    Game is input & rendering agnostic, just deals with surfacedb
    Display deals with a surfacedb and a viewModel that changes
    You can write specific displays for different things
*/

function App(db) {
    var inputs = Inputs(window)

    // game ??
    var viewModel = Game(db, inputs)

    var display = Display(db, viewModel)

    return display
}
