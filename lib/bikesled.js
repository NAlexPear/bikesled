"use strict";

var config = require( "./config/config" );
var path = require( "path" );
var fs = require( "fs" );
var glob = require( "glob" );
var template = require( "lodash/fp/template" );
var startCase = require( "lodash/fp/startCase" );

function escapeHTML( html ){
    var esc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };

    return html
        .replace(
            /[&<>]/g,
            ( char ) => esc[ char ]
        )
        .trim();
}

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
                () => resolve( outputPath )
            )
            .catch(
                () => fs.mkdir(
                    outputPath,
                    ( err ) => handlePromiseError( err, resolve, reject, outputPath )
                )
            )
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
                    ( err ) => handlePromiseError( err, resolve, reject )
                )
            )
            .catch( reject )
    );
}

function getComponents( componentsDirectory ){
    return new Promise(
        ( resolve, reject ) => glob(
            `${componentsDirectory}/**/*.html`,
            ( err, results ) => (
                err ? reject( err ) : resolve( results )
            )
        )
    );
}

function mapComponent( component, tmpl ){
    var parseContent = template( tmpl );
    var name = component
        .split( "/" )
        .pop()
        .split( "." )
        .shift();

    return new Promise(
        ( resolve, reject ) => fs.readFile(
            component,
            "utf8",
            ( err, content ) => {
                var parsedContent;

                if( err ){
                    reject( err );
                }
                else{
                    parsedContent = parseContent( {
                        "name": startCase( name ),
                        "input": escapeHTML( content ),
                        "output": content,
                        "annotations": ""
                    } );

                    resolve( parsedContent );
                }
            }
        )
    );
}

function mapComponents( componentsDirectory, tmpl ){
    return new Promise(
        ( resolve, reject ) => getComponents( componentsDirectory )
            .then(
                ( components ) => {
                    var promisedComponents = components.map(
                        ( component ) => mapComponent( component, tmpl )
                    );

                    resolve( promisedComponents );
                }
            )
            .catch( reject )
    );
}

function renderComponents( componentsDirectory ){
    var componentTemplatePath = path.resolve( __dirname, "./templates/component.html" );
    var componentTemplate = fs.readFileSync( componentTemplatePath, "utf8" );

    return new Promise(
        ( resolve, reject ) => mapComponents( componentsDirectory, componentTemplate )
            .then(
                ( componentPromises ) => Promise
                    .all( componentPromises )
                    .then(
                        ( renderedArray ) => resolve( renderedArray.join() )
                    )
            )
            .catch( reject )
    );
}

function renderIndex( options, targetDirectory = "." ){
    var components = options.components;
    var main = path.resolve( targetDirectory, components.main );
    var output = path.resolve( targetDirectory, options.output );

    renderComponents( main ).then(
        /* eslint-disable no-console */
        ( rendered ) => makeIndex( output, options, rendered ).catch( console.log )
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
