"use strict";

// Node Modules
var fs = require( "fs" );
var hljs = require( "highlightjs" );

// Lodash Methods
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var Utils = require( "../utilities" );

function highlightContent( content ){
    var highlighted = hljs.highlightAuto( content, [ "html", "css", "javascript" ] );

    return highlighted.value;
}

function resolvePromise( oldDefinition, html, name ){
    return Object.assign(
        oldDefinition,
        {
            "name": startCase( name ),
            "input": highlightContent( html ),
            "output": html
        }
    );
}

function reduceComponent( acc, component ){
    var name = Utils.getNameFromPath( component );

    var definition = acc[ name ] || Promise.resolve( {} );

    acc[ name ] = new Promise(
        ( resolve, reject ) => {
            var html = fs.readFileSync( component, "utf8" );

            definition.then(
                ( oldDefinition ) => resolve(
                    resolvePromise( oldDefinition, html, name )
                )
            )
            .catch( reject );
        }
    );

    return acc;
}

module.exports = function renderHtml( html ){
    return function curriedRender( componentsObject ){
        return html.reduce(
            reduceComponent,
            componentsObject
        );
    };
};
