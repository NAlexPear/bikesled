"use strict";

// Node Modules
var path = require( "path" );
var fs = require( "fs" );
var webpack = require( "webpack" );
var rimraf = require( "rimraf" );

// Lodash Methods
var isEmpty = require( "lodash/fp/isEmpty" );
var map = require( "lodash/fp/map" );
var mapValues = require( "lodash/fp/mapValues" );
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

function handleStylesheetPromise( resolve, reject, oldPath, newPath ){
    Utils.checkResource( oldPath )
        .then(
            () => fs.writeFile(
                newPath,
                fs.readFileSync( oldPath, "utf8" ),
                Utils.getPromiseErrorHandler( resolve, reject )
            )
        )
        .catch( reject );
}

function makeStylesheet( output, options ){
    var stylesheet = options.stylesheet;
    var oldStylesheetPath;
    var newStylesheetPath;

    return new Promise(
        ( resolve, reject ) => {
            if( stylesheet ){
                oldStylesheetPath = path.resolve( options.target, stylesheet );
                newStylesheetPath = path.resolve( output, stylesheet.split( "/" ).pop() );

                handleStylesheetPromise(
                    resolve,
                    reject,
                    oldStylesheetPath,
                    newStylesheetPath
                );
            }
            else{
                resolve();
            }
        }
    );
}

function makeIndex( output, options, rendered = "", names = [] ){
    var indexPath = path.resolve( output, "index.html" );
    var templatePath = path.resolve( __dirname, "./templates/default.html" );
    var cssPath = path.resolve( __dirname, "./css/style.css" );


    var templateContent = fs.readFileSync( templatePath, "utf8" );
    var cssContent = fs.readFileSync( cssPath , "utf8" );


    var styles = `<style>${cssContent}</style>`;

    var templateOptions = Object.assign(
        {
            "names": names,
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

function getWebpackConfig( entryPath, output, options ){
    var resolve = options.resolve || {};

    if( resolve.alias && !isEmpty( resolve.alias ) ){
        resolve.alias = mapValues(
            ( route ) => path.resolve( options.target, route )
        )( resolve.alias );
    }

    return {
        "entry": entryPath,
        "output": {
            "path": output,
            "filename": "bundle.js"
        },
        "module": {
            "loaders": [
                {
                    "test": /\.html$/,
                    "loader": "html-loader",
                    "options": {
                        "attrs": false
                    }
                },
                {
                    "test": /\.json$/,
                    "loader": "json-loader"
                }
            ]
        },
        "resolve": resolve
    };
}

function resolveDependencies( ...args ){
    var webpackConfig = getWebpackConfig( ...args );

    return new Promise(
        ( resolve, reject ) => webpack(
            webpackConfig,
            ( err, stats ) => {
                var compilationErrors = stats.compilation.errors;
                var hasCompilationErrors = compilationErrors && ( compilationErrors.length > 0 );

                if( err || hasCompilationErrors ){
                    reject( compilationErrors );
                }
                else{
                    resolve( stats );
                }
            }
        )
    );
}

function cleanTmpDirectory( tmpPath, message = "" ){
    return new Promise(
        ( resolve, reject ) => Utils
            .checkResource( tmpPath )
            .then(
                () => rimraf(
                    tmpPath,
                    Utils.getPromiseErrorHandler( resolve, reject, message )
                )
            )
            .catch(
                () => resolve( message )
            )
    );
}

function makeBundle( output, options ){
    var tmpPath = path.resolve( options.target, "./tmp" );
    var entryPath = path.resolve( tmpPath, "./entry.js" );

    resolveDependencies( entryPath, output, options )
        .then(
            /* eslint-disable no-console */
            () => cleanTmpDirectory( tmpPath, "Compilation complete!" )
                .then( console.log )
                .catch( console.log )
        )
        .catch( console.log );
}


function renderIndex( options ){
    var components = options.components;
    var targetDirectory = options.target;
    var main = path.resolve( targetDirectory, components.main );
    var output = path.resolve( targetDirectory, options.output );

    var renderers = map(
        ( renderer ) => {
            renderer.src = path.resolve( targetDirectory, renderer.src );

            return renderer;
        }
    )( options.renderers );

    renderComponents( main, targetDirectory, renderers )
        .then(
            ( data ) => Promise
                .all( [
                    makeIndex( output, options, data.rendered, data.names ),
                    makeStylesheet( output, options )
                ] )
                .then(
                    () => makeBundle( output, options )
                )
                .catch( console.log )
        );
}

function build( options ){
    var targetDirectory = options.target || ".";
    var tmpPath = path.resolve( targetDirectory, "./tmp" );

    cleanTmpDirectory( tmpPath )
        .then(
            () => config
                .get( options )
                .then(
                    ( result ) => {
                        result.target = targetDirectory;

                        renderIndex( result );
                    }
                )
                .catch( console.log )
        )
        .catch( console.log );
}

module.exports.build = build;
