// Libraries
import Backbone from "backbone";

// Internal Components


var TestViewWithCollection = Backbone.View.extend( {
    initialize(){
        this.render();
    },
    render(){
        this.$el.html( "<h2>This is a Backbone View</h2>" );

        return this.$el;
    }
} );

export default TestViewWithCollection;
