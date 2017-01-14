import Backbone from "backbone";
import _ from "underscore";

import template from "../templates/backbone.html";

var testView = Backbone.View.extend( {
    "template": _.template( template ),

    initialize( title ){
        this.title = title;
        this.render();
    },
    render(){
        this.$el.html( this.template( {
            "title": this.title
        } ) );

        return this;
    }
} );

export default testView;
