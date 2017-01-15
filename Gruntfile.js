var grunt = require( "grunt" );

module.exports = () => {
    require( "load-grunt-tasks" )( grunt );

    grunt.initConfig( {
        "pkg": grunt.file.readJSON( "package.json" ),
        "sass": {
            "options": {
                "sourceMap": true,
                "outputStyle": "compressed"
            },
            "dist": {
                "files": {
                    "lib/css/style.css": "src/scss/style.scss"
                }
            }
        }
    } );

    grunt.registerTask( "default", [ "sass" ] );
};
