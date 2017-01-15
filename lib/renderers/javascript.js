"use strict";

// Node Modules
var fs = require( "fs" );
var path = require( "path" );
var hljs = require( "highlightjs" );

// Lodash Methods
var startCase = require( "lodash/fp/startCase" );
var camelCase = require( "lodash/fp/camelCase" );

// Internal Modules
var Utils = require( "../utilities" );


function getFunctionName( filePath ){
    var kebab = Utils.getNameFromPath( filePath );

    return camelCase( kebab );
}

function getImportStatement( filePath ){
    var name = getFunctionName( filePath );
    var mutatedPath = filePath.replace( /\.js$/, "" );

    return `import ${name} from "${mutatedPath}";`;
}

function makeTmpDirectory(){
    var tmpPath = path.resolve( "./tmp" );

    return new Promise(
        ( resolve, reject ) => fs.mkdir(
            tmpPath,
            Utils.getPromiseErrorHandler( resolve, reject, tmpPath )
        )
    );
}

function writeEntryPoint( content ){
    return new Promise(
        ( resolve, reject ) => makeTmpDirectory()
            .then(
                ( tmpPath ) => {
                    var entryPath = path.resolve( tmpPath, "./entry.js" );

                    fs.writeFile(
                        entryPath,
                        content,
                        Utils.getPromiseErrorHandler( resolve, reject, entryPath )
                    );
                }
            )
            .catch( reject )
    );
}

function bundleComponents( js ){
    var imports = js
        .map( getImportStatement )
        .join( "\n" );

    /* eslint-disable no-console */
    writeEntryPoint( imports ).catch( console.log );
}

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
    bundleComponents( js );

    return function curriedRender( componentsObject ){
        var reducer = Utils.getReducer( resolver );

        return js.reduce(
            reducer,
            componentsObject
        );
    };
};
