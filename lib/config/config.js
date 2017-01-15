"use strict";

var config = require( "./.bikesledrc" );
var fs = require( "fs" );
var defaultsDeep = require( "lodash/fp/defaultsDeep" );

function validatePath( path ){
    return new Promise(
        ( resolve, reject ) => fs.access(
            path,
            fs.constants.R_OK,
            ( err ) => ( err ? reject( err ) : resolve( path ) )
        )
    );
}

function readConfig( options ){
    var localConfigPath = process.cwd() + "/.bikesledrc.json";
    var configPath = options.configure || localConfigPath;

    return new Promise(
        ( resolve, reject ) => validatePath( configPath )
            .then(
                ( path ) => resolve(
                    fs.readFileSync( path, "utf8" )
                ),
                ( err ) => reject( err )
            )
    );
}

function parseConfig( json ){
    return new Promise(
        ( resolve, reject ) => {
            try{
                let parsedConfig = JSON.parse( json );

                resolve(
                    defaultsDeep( config )( parsedConfig )
                );
            }
            catch( err ){
                reject( err );
            }
        }
    );
}

function getConfig( options ){
    return new Promise(
        ( resolve, reject ) => readConfig( options )
            .then(
                ( localConfig ) => parseConfig( localConfig )
                    .then(
                        ( result ) => resolve( result ),
                        ( err ) => reject( err )
                ),
                () => resolve( config )
            )
    );
}

module.exports = {
    "get": getConfig
};
