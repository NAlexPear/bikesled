"use strict";

// Node Modules
var fs = require( "fs" );
var path = require( "path" );
var glob = require( "glob" );

// Internal Modules
var renderHtml = require( "./html" );
var renderMd = require( "./markdown" );
var renderJs = require( "./javascript" );

// Lodash Methods
var defaults = require( "lodash/fp/defaults" );
var template = require( "lodash/fp/template" );
var reduce = require( "lodash/fp/reduce" );
var flow = require( "lodash/fp/flow" );


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

function parseComponents( results, tmpl ){
    var [ html, md, js ] = results;
    var parseContent = template( tmpl );

    var definitions = flow(
        renderMd( md ),
        renderHtml( html ),
        renderJs( js ),
        reduce(
            ( acc, definition ) => [ ...acc, definition ]
        )( [] )
    )( {} );

    return new Promise(
        ( resolve, reject ) => Promise
        .all( definitions )
        .then(
            ( newResults ) => {
                var resolved = newResults.map(
                    ( definition ) => {
                        var expandedDef = defaults( {
                            "name": "Untitled Component",
                            "input": "",
                            "annotations": [],
                            "output": ""
                        } )( definition );

                        return parseContent( expandedDef );
                    }
                );

                resolve( resolved );
            }
        )
        .catch( reject )
    );
}

function mapComponents( componentsDirectory, tmpl ){
    return new Promise(
        ( resolve, reject ) => Promise
            .all( [
                getComponents( componentsDirectory, "html" ),
                getComponents( componentsDirectory, "md" ),
                getComponents( componentsDirectory, "js" )
            ] )
            .then(
                ( results ) => resolve(
                    parseComponents( results, tmpl )
                )
            )
            .catch( reject )
    );
}

module.exports = function renderComponents( componentsDirectory ){
    var componentTemplatePath = path.resolve( __dirname, "../templates/component.html" );
    var componentTemplate = fs.readFileSync( componentTemplatePath, "utf8" );

    return new Promise(
        ( resolve, reject ) => mapComponents(
            componentsDirectory,
            componentTemplate
        )
        .then(
            ( componentPromises ) => Promise
                .all( componentPromises )
                .then(
                    ( renderedArray ) => resolve( renderedArray.join( "" ) )
                )
        )
        .catch( reject )
    );
};
