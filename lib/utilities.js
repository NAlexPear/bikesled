"use strict";

// Node Modules
var fs = require( "fs" );

// Lodash Methods
var isEmpty = require( "lodash/fp/isEmpty" );
var reduce = require( "lodash/fp/reduce" );

function reduceRenderPath( filePath, renderers ){
    return reduce(
        ( acc, renderObject ) => {
            var testString = renderObject.test;
            var testExp = new RegExp( testString );

            if( !acc && filePath.match( testExp ) ){
                acc = renderObject.src;
            }

            return acc;
        }
    )( "" )( renderers );
}

function getComponentConfigPath( filePath, filter ){
    var fileName = filePath
        .split( "/" )
        .pop();

    var configTest = new RegExp( `\.${filter}$` );

    var configName;
    var configPath;

    if( !fileName.match( configTest ) ){
        configName = fileName
            .split( "." )
            .shift();

        configPath = filePath.replace( /[^/]*$/, `.${configName}.json` );
    }

    return configPath;
}

module.exports = {
    getNameFromPath( filePath ){
        return filePath
            .split( "/" )
            .pop()
            .split( "." )
            .shift();
    },
    getPromiseErrorHandler( resolve, reject, resolvedValue = "" ){
        return function errorHandler( err ){
            if( err ){
                reject( err );
            }
            else{
                resolve( resolvedValue );
            }
        };
    },
    checkResource( resourcePath ){
        return new Promise(
            ( resolve, reject ) => fs.access(
                resourcePath,
                fs.constants.R_OK | fs.constants.W_OK,
                this.getPromiseErrorHandler( resolve, reject, resourcePath )
            )
        );
    },
    getReducer( resolver, nameParser = this.getNameFromPath ){
        return ( acc, component ) => {
            var name = nameParser( component );
            var definition = acc[ name ] || Promise.resolve( {} );
            var config = this.getComponentConfig( component, "md" );

            acc[ name ] = new Promise(
                ( resolve, reject ) => {
                    var raw = config.hideInput ? "" : fs.readFileSync( component, "utf8" );

                    definition.then(
                        ( oldDefinition ) => resolve(
                            resolver( oldDefinition, raw, name, component )
                        )
                    )
                    .catch( reject );
                }
            );

            return acc;
        };
    },
    getRenderer( filePath, renderers ){
        var renderer = "";

        if( renderers && !isEmpty( renderers ) ){
            renderer = reduceRenderPath( filePath, renderers );
        }

        return renderer;
    },
    getComponentConfig( ...args ){
        var configPath = getComponentConfigPath( ...args );
        var config;

        try{
            config = require( configPath );
        }
        catch( err ){
            config = {};
        }

        return config;
    }
};
