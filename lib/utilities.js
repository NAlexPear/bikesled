"use strict";

var fs = require( "fs" );

module.exports = {
    getNameFromPath( path ){
        return path
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
    }
};
