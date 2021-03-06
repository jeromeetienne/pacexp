#!/bin/env node

// require the library
var MicroCache	= require('../microcache.js')

// instanticiate a cache
var microcache	= new MicroCache();

console.assert( Object.keys(microcache.values()).length === 0 );

var val1	= microcache.getSet("foo", "bar");
console.assert(val1 === "bar")

console.assert( Object.keys(microcache.values()).length === 1 );

var val2	= microcache.getSet("foo", "bar");
console.assert(val2 === "bar")

console.assert( Object.keys(microcache.values()).length === 1 );

microcache.remove("foo");

console.assert( Object.keys(microcache.values()).length === 0 );
