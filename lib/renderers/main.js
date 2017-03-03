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
var filter = require( "lodash/fp/filter" );
var flow = require( "lodash/fp/flow" );
var kebabCase = require( "lodash/fp/kebabCase" );
var map = require( "lodash/fp/map" );
var pluck = require( "lodash/fp/pluck" );
var reduce = require( "lodash/fp/reduce" );
var template = require( "lodash/fp/template" );


function sortByPath( defA, defB ){
    var a = defA.path;
    var b = defB.path;
    var sort = 0;

    if( a < b ){
        sort = -1;
    }
    else if( a > b ){
        sort = 1;
    }

    return sort;
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

function parseComponents( results, tmpl, options ){
    var [ html, md, js ] = results;
    var parseContent = template( tmpl );

    var definitions = flow(
        renderMd( md ),
        renderHtml( html ),
        renderJs( js, options ),
        reduce(
            ( acc, definition ) => [ ...acc, definition ]
        )( [] )
    )( {} );

    return new Promise(
        ( resolve, reject ) => Promise
            .all( definitions )
            .then(
                ( newResults ) => {
                    var resolved = newResults
                        .sort( sortByPath )
                        .map(
                            ( definition ) => {
                                var expandedDef = defaults( {
                                    "name": "Untitled Component",
                                    "inputs": "",
                                    "annotations": [],
                                    "output": ""
                                } )( definition );

                                var id = kebabCase( expandedDef.name );

                                expandedDef.id = id;

                                return {
                                    "name": expandedDef.name,
                                    "content": parseContent( expandedDef )
                                };
                            }
                        );

                    resolve( resolved );
                }
            )
            .catch( reject )
        );
}

function mapComponents( componentsDirectory, tmpl, options ){
    return new Promise(
        ( resolve, reject ) => Promise
            .all( [
                getComponents( componentsDirectory, "html" ),
                getComponents( componentsDirectory, "md" ),
                getComponents( componentsDirectory, "js" )
            ] )
            .then(
                ( results ) => {
                    var ignoreRegex = map(
                        ( test ) => new RegExp( test )
                    )( options.ignore );

                    var filteredResults = map(
                        filter(
                            ( result ) => filter(
                                ( regex ) => result.match( regex )
                            )( ignoreRegex ).length === 0
                        )
                    )( results );

                    resolve(
                        parseComponents( filteredResults, tmpl, options )
                    );
                }
            )
            .catch( reject )
    );
}

module.exports = function renderComponents( componentsDirectory, options ){
    var componentTemplatePath = path.resolve( __dirname, "../templates/component.html" );
    var componentTemplate = fs.readFileSync( componentTemplatePath, "utf8" );

    return new Promise(
        ( resolve, reject ) => mapComponents(
            componentsDirectory,
            componentTemplate,
            options
        )
        .then(
            ( componentPromises ) => Promise
                .all( componentPromises )
                .then(
                    ( components ) => {
                        var names = pluck( "name" )( components );
                        var content = pluck( "content" )( components );

                        resolve( {
                            "names": names,
                            "rendered": content.join( "" )
                        } );
                    }
                )
        )
        .catch( reject )
    );
};
