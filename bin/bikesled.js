#!/usr/bin/env node

var runner = require( "commander" );

runner
    .arguments( "<action>" )
    .option(
        "-c --configure <config>",
        "path to .bikesledrc configuration file"
    )
    .action(
        ( action ) => console.log( `You asked bikesled to ${action}` )
    )
    .parse( process.argv );
