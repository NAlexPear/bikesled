"use strict";

// Node Modules
var marked = require( "marked" );

// Internal Modules
var Utils = require( "../utilities" );


function resolver( oldDefinition, annotation ){
    var parsedAnnotation = marked( annotation );

    if( !oldDefinition.annotations ){
        oldDefinition.annotations = [];
    }

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

function parseName( component ){
    return Utils
        .getNameFromPath( component )
        .replace( /^\d*-/, "" );
}

module.exports = function renderMarkdown( md ){
    return function curriedRender( componentsObject ){
        var reducer = Utils.getReducer( resolver, parseName );

        return md.reduce(
            reducer,
            componentsObject
        );
    };
};
