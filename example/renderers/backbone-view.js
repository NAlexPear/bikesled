// Lodash Methods
var camelCase = require( "lodash/fp/camelCase" );

function RenderBackboneView( name, data ){
    var before = `window.bikesled.server.respondWith(
        [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify( ${data} )
        ]
    );`;

    var after = "window.bikesled.server.respond();";

    return `${before}document.getElementById( "${name}" ).appendChild( new ${camelCase( name )}( ${data} ).el );${after}`;
}

module.exports = RenderBackboneView;
