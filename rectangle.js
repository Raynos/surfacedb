module.exports = Rectangle

function Rectangle(opts) {
    var meta = opts.meta || {}
    meta.x = opts.x
    meta.y = opts.y
    meta.width = opts.width
    meta.height = opts.height
    meta.bb = boundingBox(opts)
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
        meta: meta
    }
}

function boundingBox(opts) {
    return {
        min: { x: opts.x, y: opts.y },
        max: { x: opts.x + opts.width, y: opts.y + opts.height }
    }
}
