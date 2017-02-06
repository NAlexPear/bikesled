// Node Modules
var fs = require( "fs" );
var path = require( "path" );
var hljs = require( "highlightjs" );

// Lodash Methods
var camelCase = require( "lodash/fp/camelCase" );
var startCase = require( "lodash/fp/startCase" );

// Internal Modules
var Utils = require( "../utilities" );


function getFunctionName( filePath ){
    var kebab = Utils.getNameFromPath( filePath );

    return camelCase( kebab );
}

function getData( filePath ){
    var dataPath = filePath += "on";

    return fs.readFileSync( dataPath, "utf8" );
}

function getImportStatement( filePath ){
    var name = getFunctionName( filePath );
    var mutatedPath = filePath.replace( /\.js$/, "" );

    return `import ${name} from "${mutatedPath}";`;
}

function getDomInjection( renderers ){
    return ( filePath ) => {
        var name = Utils.getNameFromPath( filePath );
        var data = getData( filePath );
        var defaultRenderer = `document.getElementById( "${name}" ).innerHTML = ${camelCase( name )}( ${data} );`;
        var rendererPath = Utils.getRenderer( filePath, renderers );
        var renderer = rendererPath ? require( rendererPath )( name, data ) : "";

        return renderer || defaultRenderer;
    };
}

function makeTmpDirectory( targetDirectory ){
    var tmpPath = path.resolve( targetDirectory, "./tmp" );

    return new Promise(
        ( resolve, reject ) => fs.mkdir(
            tmpPath,
            Utils.getPromiseErrorHandler( resolve, reject, tmpPath )
        )
    );
}

function writeEntryPoint( content, targetDirectory ){
    return new Promise(
        ( resolve, reject ) => makeTmpDirectory( targetDirectory )
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

function bundleComponents( js, targetDirectory, renderers ){
    var injector = getDomInjection( renderers );

    var imports = js
        .map( getImportStatement )
        .join( "\n" );

    var invokers = js
        .map( injector )
        .join( "\n" );

    var content = imports + invokers;

    /* eslint-disable no-console */
    writeEntryPoint( content, targetDirectory ).catch( console.log );
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
            "input": highlightContent( js ),
            "output": `<div id="${name}"></div>`
        }
    );
}

module.exports = function renderJs( js, targetDirectory, renderers ){
    bundleComponents( js, targetDirectory, renderers );

    return function curriedRender( componentsObject ){
        var reducer = Utils.getReducer( resolver );

        return js.reduce(
            reducer,
            componentsObject
        );
    };
};
