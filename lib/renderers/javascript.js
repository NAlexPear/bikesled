"use strict";

// Node Modules
var fs = require( "fs" );
var hljs = require( "highlightjs" );

// Lodash Methods
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var Utils = require( "../utilities" );


function highlightContent( content ){
    var highlighted = hljs.highlight( "javascript", content );

    return highlighted.value;
}

function resolvePromise( oldDefinition, js, name ){
    return Object.assign(
        oldDefinition,
        {
            "name": startCase( name ),
            "input": highlightContent( js )
        }
    );
}

function reduceComponent( acc, component ){
    var name = Utils.getNameFromPath( component );

    var definition = acc[ name ] || Promise.resolve( {} );

    acc[ name ] = new Promise(
        ( resolve, reject ) => {
            var js = fs.readFileSync( component, "utf8" );

            definition.then(
                ( oldDefinition ) => resolve(
                    resolvePromise( oldDefinition, js, name )
                )
            )
            .catch( reject );
        }
    );

    return acc;
}

module.exports = function renderJs( js ){
    return function curriedRender( componentsObject ){
        return js.reduce(
            reduceComponent,
            componentsObject
        );
    };
};
