module.exports = persist

/*  persist := (SurfaceDB, Observable<A>, (A) => Surface)

    persist will take a database, an observable entity and
        a function which converts the entity into a surface.

    It will then ensure that the entity stays in sync with the
        database.
*/
function persist(db, obs, lambda) {
    db.insert(lambda(obs()), function (err, surfaces) {
        if (err) return db.emit("error", err)

        var surface = surfaces[0]
        obs(function (entity) {
            var newSurface = lambda(entity)
            newSurface.id = surface.id
            db.update(newSurface)
        })
    })

    return obs
}
