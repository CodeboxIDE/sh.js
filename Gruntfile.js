module.exports = function (grunt) {
    var path = require("path");

    // Path to the client src
    var clientPath = path.resolve(__dirname, "client");

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-browserify');

    // Init GRUNT configuraton
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            dist: {
                src: 'src/index.js',
                dest: 'public/sh.js',
                options: {
                    standalone: "Terminal"
                }
            }
        }
    });

    // Build
    grunt.registerTask('build', [
        'browserify'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};