#!/usr/bin/env node
/* eslint-disable no-console */

var runner = require( "commander" );
var bikesled = require( "../index.js" );

function parseOptions( opts ){
    return opts.options
        .map(
            ( option ) => option.long.replace( "--", "" )
        )
        .reduce(
            ( acc, key ) => {
                acc[ key ] = opts[ key ];

                return acc;
            },
            {}
        );
}

function parseAction( action, options ){
    options = parseOptions( options );

    if( bikesled[ action ] ){
        bikesled[ action ]( options );
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
    .option(
        "-t --target <target>",
        "Specify external target directory"
    )
    .action( parseAction )
    .parse( process.argv );

if( !process.argv.slice( 2 ).length ){
    runner.outputHelp();
}
