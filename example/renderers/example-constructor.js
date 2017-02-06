// Lodash Methods
var camelCase = require( "lodash/fp/camelCase" );

function RenderVanillaConstructor( name, data ){
    return `document.getElementById( "${name}" ).innerHTML= new ${camelCase( name )}( ${data} ).el;`;
}

module.exports = RenderVanillaConstructor;
