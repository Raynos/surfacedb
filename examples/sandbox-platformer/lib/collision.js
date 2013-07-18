module.exports = moveUntilCollision

function moveUntilCollision(db, entity, isCollide, callback) {
    if (arguments.length === 3) {
        callback = isCollide
        isCollide = defaultIsCollide
    }

    var testCollide = function (surface) {
        return isCollide(entity, surface)
    }

    var maxDeltaX = entity.xVelocity
    var maxDeltaY = entity.yVelocity
    var x = entity.x
    var y = entity.y
    var height = entity.height
    var width = entity.width

    var currentDeltaX = 0
    var currentDeltaY = 0
    var deltaXDirection = maxDeltaX > 0 ? 1 : -1
    var deltaYDirection = maxDeltaY > 0 ? 1 : -1
    var yCollision = false
    var xCollision = false

    // recursively try to advance deltaY by 1
    recurse(function(next, finish) {
        if (Math.abs(currentDeltaY - maxDeltaY) < 1) {
            return finish()
        }

        // compute the current bounding box
        var box = boundingBox({
            x: x + currentDeltaX,
            y: y + currentDeltaY + deltaYDirection,
            height: height,
            width: width
        })

        // query for surfaces that are colliding with box
        queryCollision(db, box, function (err, surfaces) {
            if (err) return finish(err)

            // if any of these surfaces are a collision
            var collision = surfaces.some(testCollide)
            if (collision) {
                // then set collision & finish
                yCollision = true
                finish()
            } else {
                // else we can increment the y delta and try again
                currentDeltaY += deltaYDirection
                next()
            }
        })
    }, function (err) {
        if (err) throw err

        // recursively try to advance deltaX by 1
        recurse(function (next, finish) {
            if (Math.abs(currentDeltaX - maxDeltaX) < 1) {
                return finish()
            }

            var box = boundingBox({
                x: x + currentDeltaX + deltaXDirection,
                y: y + currentDeltaY,
                height: height,
                width: width
            })

            queryCollision(db, box, function (err, surfaces) {
                if (err) return finish(err)

                var collision = surfaces.some(testCollide)
                if (collision) {
                    xCollision = true
                    finish()
                } else {
                    currentDeltaX += deltaXDirection
                    next()
                }
            })
        }, function (err) {
            if (err) return callback(err)

            callback(null, {
                deltaX: currentDeltaX,
                deltaY: currentDeltaY,
                collideX: xCollision,
                collideY: yCollision
            })
        })
    })
}

function defaultIsCollide(entity, surface) {
    return entity.meta.type !== surface.meta.type
}

// canMove := (SurfaceDB, String, { x: Number, y: Number}, Callback<Boolean>)
function queryCollision(db, boundingBox, callback) {
    var lowerLeft = {
        x: boundingBox.minX,
        y: boundingBox.maxY
    }
    var lowerRight = {
        x: boundingBox.maxX,
        y: boundingBox.maxY
    }

    db.point(lowerLeft, function (err, surfaces1) {
        if (err) return callback(err)

        db.point(lowerRight, function (err, surfaces2) {
            if (err) return callback(err)

            callback(null, surfaces1.concat(surfaces2))
        })
    })
}

function recurse(body, callback) {
    body(function next() {
        body(next, callback)
    }, callback)
}

function boundingBox(shape) {
    return {
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height
    }
}
