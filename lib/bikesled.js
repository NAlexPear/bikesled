"use strict";

var config = require( "./config/config" );
var path = require( "path" );
var fs = require( "fs" );
var glob = require( "glob" );
var template = require( "lodash/fp/template" );

function handlePromiseError( err, resolve, reject, resolvedValue = "" ){
    if( err ){
        reject( err );
    }
    else{
        resolve( resolvedValue );
    }
}

function checkResource( resourcePath ){
    return new Promise(
        ( resolve, reject ) => fs.access(
            resourcePath,
            fs.constants.R_OK | fs.constants.W_OK,
            ( err ) => handlePromiseError( err, resolve, reject, resourcePath )
        )
    );
}

function handleOutputDirectory( outputPath ){
    return new Promise(
        ( resolve, reject ) => checkResource( outputPath )
            .then(
                () => resolve( outputPath ),
                () => fs.mkdir(
                    outputPath,
                    ( err ) => handlePromiseError( err, resolve, reject, outputPath )
                )
            )
    );
}

function makeIndex( indexPath, options ){
    var templatePath = path.resolve( __dirname, "./templates/default.html" );
    var templateContent = fs.readFileSync( templatePath );
    var content = template( templateContent )( options );

    return new Promise(
        ( resolve, reject ) => fs.writeFile(
            indexPath,
            content,
            ( err ) => handlePromiseError( err, resolve, reject )
        )
    );
}

function renderComponents( options, targetDirectory = "." ){
    var components = options.components;
    var main = path.resolve( targetDirectory, components.main );
    var output = path.resolve( targetDirectory, options.output );
    var indexPath = path.resolve( output, "index.html" );

    handleOutputDirectory( output )
        .then(
            () => makeIndex( indexPath, options )
            .then(
                /* eslint-disable no-console */
                () => console.log( "new index at ", indexPath ),
                ( err ) => console.log( err )
            ),
            ( err ) => console.log( err )
        );

    glob(
        `${main}/**/*.html`,
        ( results, err ) => console.log( results || err )
    );
}

function build( options ){
    config
        .get( options )
        .then(
            ( result ) => renderComponents( result, options.target ),
            /* eslint-disable no-console */
            ( err ) => console.log( err )
        );
}

module.exports.build = build;
