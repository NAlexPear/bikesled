// Libraries
import Backbone from "backbone";

// Lodash Methods
import template from "lodash/fp/template";
import tmpl from "./backbone-view.html";

var TestView = Backbone.View.extend( {
    "template": template( tmpl ),
    "events": {
        "click button.counter": function clickCounter(){
            var $count = this.$( ".count" );
            var value = Number( $count.text() );

            $count.text( ++value );
        }
    },

    initialize( data ){
        this.render( data );
    },
    render( data ){
        this.$el.html( this.template( data ) );

        return this.$el;
    }
} );

export default TestView;
