// Lodash Methods
import map from "lodash/fp/map";
import template from "lodash/fp/template";

// Internal Components
import tmpl from "./swatch.html";

function SwatchConstructor( data ){
    this.el = map(
        ( variable ) => template( tmpl )( variable )
    )( data ).join( "" );
}

export default SwatchConstructor;
