"use strict";

// Node Modules
var hljs = require( "highlightjs" );

// Lodash Methods
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var Utils = require( "../utilities" );


function highlightContent( content ){
    var highlighted = hljs.highlight( "html", content );

    return highlighted.value;
}

function resolver( oldDefinition, html, name ){
    return Object.assign(
        oldDefinition,
        {
            "name": startCase( name ),
            "input": highlightContent( html ),
            "output": html
        }
    );
}

module.exports = function renderHtml( html ){
    return function curriedRender( componentsObject ){
        var reducer = Utils.getReducer( resolver );

        return html.reduce(
            reducer,
            componentsObject
        );
    };
};