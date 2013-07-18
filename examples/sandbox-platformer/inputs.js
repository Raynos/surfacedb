var kb = require("kb-controls")
var EventEmitter = require("events").EventEmitter

var KEYS_MAP = {
    "<left>": "left",
    "<right>": "right",
    "<up>": "up",
    "<down>": "down",
    "A": "left",
    "D": "right",
    "W": "up",
    "S": "down"
}

module.exports = Inputs

// Inputs := (WindowContext) => EventEmitter
function Inputs(window) {
    var emitter = new EventEmitter()
    var controls = kb(window, KEYS_MAP, function oninput() {
        var x = 0, y = 0
        if (controls.left || controls.right) {
            x = (controls.left ? -1 : 1)
        }
        if (controls.up || controls.down) {
            y = (controls.up ? -1 : 1)
        }

        emitter.emit("move", { x: x, y: y })
    })

    controls.on("pulse", function () {
        emitter.emit("pulse")
    })

    return emitter
}
