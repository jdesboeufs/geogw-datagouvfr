module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');

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
                        mainApp: true,
                        s: true,
                        moment: true
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
        }

    });

    grunt.registerTask('default', [
        'jshint'
    ]);

    grunt.registerTask('test', ['jshint']);
};
