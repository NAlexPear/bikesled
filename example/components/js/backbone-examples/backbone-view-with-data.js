// Libraries
import Backbone from "backbone";

// Lodash Methods
import map from "lodash/fp/map";

// Internal Components
import TestCollection from "collection/TestCollection";

var testCollectionData = [
    { "name": "TestModel1" },
    { "name": "TestModel2" }
];

var TestViewWithCollection = Backbone.View.extend( {
    initialize(){
        this.collection = new TestCollection( testCollectionData );

        this.collection.add( { "name": "TestModel3" } );

        this.render();
    },
    render(){
        var listItems = map(
            ( model ) => `<li>${model.get( "name" )}</li>`
        )( this.collection.models );

        this.$el
            .html( "<h2>This is a Backbone View</h2>" )
            .append( `<ul>${listItems.join( "" )}</ul>` );

        return this.$el;
    }
} );

export default TestViewWithCollection;
