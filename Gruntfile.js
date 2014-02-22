module.exports = function (grunt) {
    var path = require("path");

    // Path to the client src
    var clientPath = path.resolve(__dirname, "client");

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Init GRUNT configuraton
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                banner: "(function (exports, global) {",
                footer: "})('object' === typeof module ? module.exports : (this.terminal = {}), this);"
            },
            build: {
                src: [
                    'src/event.js',
                    'src/utils.js',
                    'src/index.js'
                ],
                dest: 'public/terminal.js',
            },
        }
    });

    // Build
    grunt.registerTask('build', [
        'concat:build'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};