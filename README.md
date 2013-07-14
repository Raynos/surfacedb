# SurfaceDB

<!-- [![build status][1]][2] [![dependency status][3]][4]

[![browser support][5]][6] -->

A 2d scene graph database

## Concept (What is the idea)

You can render 2D scenes fast, really fast.

For when `<canvas>` is not fast enough. Canvas forces you to
    mutate a matrix of colors for your scene. This includes a
    huge amount of mutation, every mutation have to go through
    a JS <-> native boundary which is expensive on mobiles.

SurfaceDB is about persisting the scene information on the
    native side. This means only deltas go through the JS <-> native
    boundary interface. This means your sending only the changes
    in your scene rather then sending an entire list of rendering
    commands on every tick.

In situations where the boundary interface overhead is tiny, like
    web and desktop, we still have the benefit of arranging our
    scenes into scene graphs. This allows us to do fast regional
    queries and point queries. This allows filtering your scene
    in logarithmic time, which means we can have a massive scene
    and render a subset of it fast.

In situations where the boundary interface overhead is massive,
    like mobiles we get all the gorgeous speed advantages.





## Scope (What is the scope of this and any sub projects)

The scope of this project is about being able to store surfaces
    and query them in a render agnostic fashion.

The actual database of surfaces needs to exist in a readable
    format on the native side (C) and thus the data structures
    will probably live in C memory. There will be a javascript
    interface and probably a javascript implementation of the
    database for browser usage.

The C implementation will be used for desktop and mobile.

There will be related projects like

 - a web based renderer of surfaces to canvas.
 - a desktop based renderer of surfaces to opengl
 - a mobile based renderer of surfaces to opengl ES2.0
 - android and iOS bindings for surfacedb
 - a node binding for surfacedb

It is expected that the database of surfaces will be in memory
    with some optional loading from disk for fast initial states

## Interface (How do you interact with it)

// TODO: Explain the interface

## Installation

`npm install surfacedb`

## Contributors

 - Matt-Esch

## MIT Licenced

  [1]: https://secure.travis-ci.org/Matt-Esch/surfacedb.png
  [2]: https://travis-ci.org/Matt-Esch/surfacedb
  [3]: https://david-dm.org/Matt-Esch/surfacedb.png
  [4]: https://david-dm.org/Matt-Esch/surfacedb
  [5]: https://ci.testling.com/Matt-Esch/surfacedb.png
  [6]: https://ci.testling.com/Matt-Esch/surfacedb
