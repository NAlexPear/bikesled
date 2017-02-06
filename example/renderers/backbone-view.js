// Lodash Methods
var camelCase = require( "lodash/fp/camelCase" );

function RenderBackboneView( name, data ){
    return `document.getElementById( "${name}" ).appendChild( new ${camelCase( name )}( ${data} ).el );`;
}

module.exports = RenderBackboneView;
