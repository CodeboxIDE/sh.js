module.exports = function (grunt) {
    var path = require("path");

    var NW_VERSION = "0.8.4";

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Init GRUNT configuraton
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                src: 'src/index.js',
                dest: 'build/sh.js',
                options: {
                    standalone: "Terminal"
                }
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    'build/sh.min.js': ['build/sh.js']
                }
            }
        },

        exec: {
            nwbuild: {
                command: "./scripts/nwbuild.sh "+NW_VERSION,
                cwd: '.tmp/',
                stdout: true,
                stderr: true
            }
        },

        nodewebkit: {
            mac: {
                options: {
                    build_dir: './apps',
                    mac: true,
                    win: false,
                    linux32: false,
                    linux64: false,
                    mac_icns: "./public/icon.icns",
                    credits: "./public/credits.html",
                    version: NW_VERSION,
                    zip: false
                },
                src: [
                    ".tmp/**",
                    
                    // Don't want useless node_modules in app
                    "!./node_modules/nw-gyp/**",
                ]
            }
        },

        copy: {
            // Copy most files over
            tmp: {
                expand: true,
                dot: false,
                cwd: './',
                dest: '.tmp/',
                src: [
                    // Most files except the ones below
                    "./**",

                    // Ignore gitignore
                    "!.gitignore",

                    // Ignore dev related things
                    "!./.tmp/**",
                    "!./.git/**",
                    
                    // App builds
                    "!./apps/**",

                    // Ignore some build time only modules
                    "./node_modules/.bin/**",
                    "!./node_modules/grunt/**",
                    "!./node_modules/grunt-*/**",
                    "!./node_modules/browserify/**",

                    // Exclude test directories from node modules
                    "!./node_modules/**/test/**",
                ],

                // Preserve permissions
                options: {
                    mode: true
                }
            }
        },
        clean: {
            tmp: ['.tmp/']
        }
    });

    // Build
    grunt.registerTask('build', [
        'browserify',
        'uglify'
    ]);

    // Build app
    grunt.registerTask('build-app', [
        'build',
        'copy:tmp',
        'exec:nwbuild',
        'nodewebkit:mac',
        'clean:tmp'
    ]);



    grunt.registerTask('default', [
        'build'
    ]);
};