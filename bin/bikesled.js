#!/usr/bin/env node
/* eslint-disable no-console */

var runner = require( "commander" );
var bikesled = require( "../index.js" );

function parseAction( action ){
    if( bikesled[ action ] ){
        bikesled[ action ]();
    }
    else{
        console.log( "Please input a valid bikesled command!" );

        runner.outputHelp();
    }
}

runner
    .arguments( "<action>" )
    .option(
        "-c --configure <config>",
        "Specify path to .bikesledrc configuration file"
    )
    .action( parseAction )
    .parse( process.argv );

if( !process.argv.slice( 2 ).length ){
    runner.outputHelp();
}
