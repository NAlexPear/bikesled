import _ from "underscore";

var template = "<h4><%= title %></h4><p><%= prompt %></p>";

function complexExample( data ){
    var { title, prompt } = data;

    this.template = _.template( template );

    this.el = this.template( {
        "title": title || "placeholder title",
        "prompt": prompt || "placeholder prompt"
    } );
}

export default complexExample;
