"use strict";

// Node Modules
var fs = require( "fs" );
var path = require( "path" );
var glob = require( "glob" );
var marked = require( "marked" );
var hljs = require( "highlightjs" );

// Lodash Methods
var template = require( "lodash/fp/template" );
var startCase = require( "lodash/fp/startCase" );


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

module.exports = function renderComponents( componentsDirectory ){
    var componentTemplatePath = path.resolve( __dirname, "../templates/component.html" );
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
};
