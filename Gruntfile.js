module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dev: {
                src: ["src/core_file/main.js"],
                dest: "dist/core.js"
            }
        },

        concat: {
            core: {
                src: [
                    "src/core_file/opening.js",
                    "src/core_file/underscore.js",
                    "src/core_file/underscore_string.js",
                    "src/core_file/underscore_mixin.js",
                    "src/core_file/ajax.js",
                    "src/core_file/dom.js",
                    "src/core_file/events.js",
                    "src/core_file/oop.js",
                    "src/core_file/ending.js"
                ],
                dest: "dist/core.js"
            },
            domElement: {
                src: [
                    "src/domElement_file/opening.js",
                    "src/domElement_file/abstract.js",
                    "src/domElement_file/element.js",
                    "src/domElement_file/elementNS.js",
                    "src/domElement_file/image.js",
                    "src/domElement_file/form.js",
                    "src/domElement_file/form/element.js",
                    "src/domElement_file/body.js",

                    // SVG dom elements
                    "src/domElement_file/svg.js",
                    "src/domElement_file/svg/abstract.js",
                    "src/domElement_file/svg/circle.js",
                    "src/domElement_file/svg/group.js",
                    "src/domElement_file/svg/path.js",
                    "src/domElement_file/svg/polyline.js",
                    "src/domElement_file/svg/polygon.js",
                    "src/domElement_file/svg/rect.js",
                    "src/domElement_file/svg/text.js",
                    "src/domElement_file/svg/defs/ClipPath.js",
                    "src/domElement_file/svg/defs/Filter/Abstract.js",
                    "src/domElement_file/svg/defs/Filter/ColorMatrix.js",
                    "src/domElement_file/svg/defs/Filter/FilterList.js",
                    "src/domElement_file/svg/defs/Filter/GaussianBlur.js",
                    "src/domElement_file/svg/defs/Filter/Merge.js",
                    "src/domElement_file/svg/defs/Filter/Merge/Node.js",

                    // Canvas dom elements
                    "src/domElement_file/Canvas.js",
                    "src/domElement_file/Canvas/DisplayObject.js",
                    "src/domElement_file/Canvas/Image.js",
                    "src/domElement_file/Canvas/Text.js",

                    "src/domElement_file/ending.js"
                ],
                dest: "dist/domElement.js"
            },
            domscript: {
                src: [],
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            core: {
                src: [
                    'dist/core.js'
                ],
                dest: 'dist/core.min.js'
            },
            domElement: {
                src: [
                    'dist/domElement.js'
                ],
                dest: 'dist/domElement.min.js'
            },
            creative: {
                src: [
                    'dist/creative.js'
                ],
                dest: 'dist/creative.min.js'
            },
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');

    // Default task(s).
    //grunt.registerTask('default', ['uglify']);
    grunt.registerTask('release', ['concat:core', 'concat:domElement', 'uglify']);

};