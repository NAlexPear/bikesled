import _ from "underscore";

import template from "../templates/vanilla.html";

export default function testConstructor( title ){
    this.el = _.template( template )( {
        "title": title
    } );
}
