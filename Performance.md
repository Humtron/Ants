# Why use prototypes rather than modular objects?

## Speed

Initializing objects like Ant.Tile is 25% faster in testing when done with all functions declared on the prototype, rather than inside each tile object as a module.  The following timer was run in Firebug for both prototype and module pattern on a mid-2012 Macbook Air:

<pre><code>var tiles = [],
	uTime;

uTime = new Date();

for (var i = 0; i &lt; 100000; i++) {
	tiles.push(new Ant.Tile({ id: i, food: 25 }));
}

console.info("Time: ", ((new Date()) - uTime) + "ms");
</code></pre>

Prototype:

-	Average: 560 ms

Module:

-	Average: 790 ms

## Memory usage

With module pattern, every function on an Ant.Tile is repeatedly declared inside the tile object.  This wastes memory in a linear fashion.  With prototype pattern, only the data specific to a tile exists in the tile object, and all functions are declared on the tile's prototype.  When running the timer above to create 100,000 tiles, the following memory usage occurred:

Prototype:

-	Total memory: 29.75 MB
-	GC heap: 26 MB
-	Objects: 2 MB

Module: 

-	Total memory: 123 MB
-	GC heap: 95 MB
-	Objects: 26.5 MB
