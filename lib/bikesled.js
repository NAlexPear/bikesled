"use strict";

// Node Modules
var path = require( "path" );
var fs = require( "fs" );

// Lodash Methods
var template = require( "lodash/fp/template" );

// Internal Modules
var config = require( "./config/config" );
var Utils = require( "./utilities" );
var renderComponents = require( "./renderers/main" );

function handleOutputDirectory( outputPath ){
    return new Promise(
        ( resolve, reject ) => Utils.checkResource( outputPath )
            .then( resolve )
            .catch(
                () => fs.mkdir(
                    outputPath,
                    Utils.getPromiseErrorHandler( resolve, reject, outputPath )
                )
            )
    );
}

function makeStylesheet( output, options, target ){
    var stylesheet = options.stylesheet;
    var oldStylesheetPath;
    var newStylesheetPath;

    return new Promise(
        ( resolve, reject ) => {
            if( stylesheet ){
                oldStylesheetPath = path.resolve( target, stylesheet );
                newStylesheetPath = path.resolve( output, stylesheet.split( "/" ).pop() );

                Utils.checkResource( oldStylesheetPath )
                    .then(
                        () => fs.writeFile(
                            newStylesheetPath,
                            fs.readFileSync( oldStylesheetPath, "utf8" ),
                            Utils.getPromiseErrorHandler( resolve, reject )
                        )
                    )
                    .catch( reject );
            }
            else{
                resolve();
            }
        }
    );
}

function makeIndex( output, options, rendered = "" ){
    var indexPath = path.resolve( output, "index.html" );
    var templatePath = path.resolve( __dirname, "./templates/default.html" );
    var cssPath = path.resolve( __dirname, "./css/style.css" );

    var templateContent = fs.readFileSync( templatePath, "utf8" );
    var cssContent = fs.readFileSync( cssPath , "utf8" );

    var styles = `<style>${cssContent}</style>`;

    var templateOptions = Object.assign(
        {
            "rendered": rendered,
            "styles": styles
        },
        options
    );

    var content = template( templateContent )( templateOptions );

    return new Promise(
        ( resolve, reject ) => handleOutputDirectory( output )
            .then(
                () => fs.writeFile(
                    indexPath,
                    content,
                    Utils.getPromiseErrorHandler( resolve, reject )
                )
            )
            .catch( reject )
    );
}

/* eslint-disable no-console */

function renderIndex( options, targetDirectory = "." ){
    var components = options.components;
    var main = path.resolve( targetDirectory, components.main );
    var output = path.resolve( targetDirectory, options.output );

    renderComponents( main ).then(
        ( rendered ) => Promise
            .all( [
                makeIndex( output, options, rendered ),
                makeStylesheet( output, options, targetDirectory )
            ] )
            .catch( console.log )
    );
}

function build( options ){
    config
        .get( options )
        .then(
            ( result ) => renderIndex( result, options.target )
        )
        .catch( console.log );
}

module.exports.build = build;
