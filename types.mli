type LayerOptions := {
    sceneGraph: String
}

(* A surface get's inserted into a layer

    points is a list of points that represent the polygon shape

    information contains meta data used by the renderer like
        texture and transparency
*)
type Surface := {
    points: Array<{
        x: Number, y: Number
    }>,
    id: String,
    meta: Object
}

type MultiSurface := Array<Surface> | Surface

(* Layers are like tables or indexes.

    Each layer has it's own SceneGraph, i.e. it's own way of
        storing the surfaces with trade-offs

    A layer has one scene graph
    A layer contains many surfaces
*)
type Layer := {
    sceneGraph: String,
    insert: (MultiSurface, Callback),
    update: (MultiSurface, Callback),
    delete: (MultiSurface, Callback)
}


(* A scene graph is a storage engine
    for example with levelup you can use leveldown, memdown or
    lmdb

    The scope of the scenegraph is to trade-off query efficiency
        with write penalties

    For example: You may have a bucketed scene graph that
        allows moving of surfaces to different buckets quickly
        but if a surface is too big for a bucket it will have
        to be duplicated into multiple buckets leading to higher
        memory usage
*)
type SceneGraph

(* A surfaceDB consists of one or more layers

*)
type SurfaceDatabase := {
    addLayer: (String, LayerOptions, Callback),
    insert: (String, MultiSurface, Callback),
    update: (String, MultiSurface, Callback),
    remove: (String, MultiSurface, Callback),
    point: (String, {
        x: Number,
        y: Number
    }, Callback<Array<Surface>>)
    region: (String, MultiSurface, Callback<Array<Surface>>)
}

(* The web version of api

*)
surfacedb := ({
    layers: Object<String, String>
}) => SurfaceDatabase

(* The node / desktop version of api

*)
surfacedb/native := () => SurfaceDatabase
