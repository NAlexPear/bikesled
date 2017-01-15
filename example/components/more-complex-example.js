import _ from "underscore";

var template = "<h4><%= title %></h4>";

function complexExample( title ){
    var html = _.template( template )( {
        "title": title
    } );

    return html;
}

export default complexExample( "Vanilla JS" );
