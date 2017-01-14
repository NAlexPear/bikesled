"use strict";

var config = require( "./config/config" );

function build( options ){
    config
        .get( options )
        .then(
            /* eslint-disable no-console */
            ( result ) => console.log( "configuration: ", result ),
            ( err ) => console.log( err )
        );
}

module.exports.build = build;
