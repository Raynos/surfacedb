var test = require("tape")

var surfacedb = require("../index")

test("surfacedb is a function", function (assert) {
    assert.equal(typeof surfacedb, "function")
    assert.end()
})
