"use strict";

// Node Modules
var hljs = require( "highlightjs" );

// Lodash Methods
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var Utils = require( "../utilities" );


function highlightContent( content ){
    var highlighted = hljs.highlight( "javascript", content );

    return highlighted.value;
}

function resolver( oldDefinition, js, name ){
    return Object.assign(
        oldDefinition,
        {
            "name": startCase( name ),
            "input": highlightContent( js )
        }
    );
}

module.exports = function renderJs( js ){
    return function curriedRender( componentsObject ){
        var reducer = Utils.getReducer( resolver );

        return js.reduce(
            reducer,
            componentsObject
        );
    };
};
