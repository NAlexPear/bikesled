import _ from "underscore";

var template = "<h4><%= title %></h4><p><%= prompt %></p>";

function complexExample( title = "placeholder title", prompt = "placeholder prompt" ){
    var html = _.template( template )( {
        "title": title,
        "prompt": prompt
    } );

    return html;
}

export default complexExample;
