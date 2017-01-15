"use strict";

// Node Modules
var fs = require( "fs" );
var marked = require( "marked" );

// Internal Modules
var Utils = require( "../utilities" );

function resolvePromise( oldDefinition, parsedAnnotation ){
    return Object.assign(
        oldDefinition,
        {
            "annotations": [
                ...oldDefinition.annotations,
                parsedAnnotation
            ]
        }
    );
}

function reduceComponent( acc, component ){
    var name = Utils
        .getNameFromPath( component )
        .replace( /^\d*-/, "" );

    var definition = acc[ name ] || Promise.resolve( {} );

    acc[ name ] = new Promise(
        ( resolve, reject ) => {
            var annotation = fs.readFileSync( component, "utf8" );
            var parsedAnnotation = marked( annotation );

            definition.then(
                ( oldDefinition ) => {
                    if( !oldDefinition.annotations ){
                        oldDefinition.annotations = [];
                    }

                    resolve(
                        resolvePromise( oldDefinition, parsedAnnotation )
                    );
                }
            )
            .catch( reject );
        }
    );

    return acc;
}

module.exports = function renderMarkdown( md ){
    return function curriedRender( componentsObject ){
        return md.reduce(
            reduceComponent,
            componentsObject
        );
    };
};
