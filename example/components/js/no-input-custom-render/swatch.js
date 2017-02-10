// Lodash Methods
import map from "lodash/fp/map";
import template from "lodash/fp/template";

var swatchComponent = "<div><div class=\"swatch\"><code><%= variable %></code></div><div class=\"swatch\" style=\"background-color:<%= rgba %>\"></div>";

function SwatchConstructor( data ){
    this.el = map(
        ( variable ) => template( swatchComponent )( variable )
    )( data ).join( "" );
}

export default SwatchConstructor;
