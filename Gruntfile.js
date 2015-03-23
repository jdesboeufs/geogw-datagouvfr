module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        jshint: {
            server: {
                files: {
                    src: ['*.js', 'lib/**/*.js']
                },
                options: {
                    node: true
                }
            },
            browser: {
                files: {
                    src: ['app/**/*.js']
                },
                options: {
                    browser: true,
                    node: true,
                    devel: true,
                    globals: {
                        angular: true,
                        _: true,
                        mainApp: true
                    }
                }
            },
            options: {
                bitwise: true,
                eqeqeq: true,
                freeze: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                trailing: true,
            }
        }//,

        // clean: ['.tmp', 'dist'],

        // browserify: {
        //     app: {
        //         src: 'app/scripts/main.js',
        //         dest: '.tmp/scripts/bundle.js'
        //     }
        // }

    });

    grunt.registerTask('default', [
        'jshint'//,
        //'browserify:app'
    ]);

    grunt.registerTask('test', ['jshint']);
};