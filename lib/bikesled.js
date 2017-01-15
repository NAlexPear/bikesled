"use strict";

// Node Modules
var path = require( "path" );
var fs = require( "fs" );
var glob = require( "glob" );
var hljs = require( "highlightjs" );
var marked = require( "marked" );

// Lodash Methods
var template = require( "lodash/fp/template" );
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var config = require( "./config/config" );
var Utils = require( "./utilities" );

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
                        () => {
                            var oldCss = fs.readFileSync( oldStylesheetPath, "utf8" );

                            fs.writeFile(
                                newStylesheetPath,
                                oldCss,
                                Utils.getPromiseErrorHandler( resolve, reject )
                            );
                        }
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

function getComponents( componentsDirectory, extension = "html" ){
    return new Promise(
        ( resolve, reject ) => glob(
            `${componentsDirectory}/**/*.${extension}`,
            ( err, results ) => (
                err ? reject( err ) : resolve( results )
            )
        )
    );
}

function highlightContent( content ){
    var highlighted = hljs.highlightAuto( content, [ "html", "css", "javascript" ] );

    return highlighted.value;
}

function mapComponent( component, tmpl, markdown ){
    var parseContent = template( tmpl );
    var name = component
        .split( "/" )
        .pop()
        .split( "." )
        .shift();

    var annotations = markdown
        .filter(
            ( annotation ) => annotation.includes( name )
        )
        .map(
            ( annotation ) => fs.readFileSync( annotation, "utf8" )
        )
        .map(
            ( annotation ) => marked( annotation )
        );

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
                        "input": highlightContent( content ),
                        "output": content,
                        "annotations": annotations
                    } );

                    resolve( parsedContent );
                }
            }
        )
    );
}

function mapComponents( componentsDirectory, tmpl ){
    return new Promise(
        ( resolve, reject ) => Promise
            .all( [
                getComponents( componentsDirectory, "html" ),
                getComponents( componentsDirectory, "md" )
            ] )
            .then(
                ( results ) => {
                    var [ html, markdown ] = results;
                    
                    var promisedComponents = html.map(
                        ( component ) => mapComponent( component, tmpl, markdown )
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
