module.exports = Rectangle

function Rectangle(opts) {
    var points = [{
        x: opts.x,
        y: opts.y
    }, {
        x: opts.x,
        y: opts.y + opts.height
    }, {
        x: opts.x + opts.width,
        y: opts.y + opts.height
    }, {
        x: opts.x + opts.width,
        y: opts.y
    }]

    return {
        points: points,
        information: opts.information
    }
}
