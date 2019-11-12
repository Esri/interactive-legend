module.exports = function (grunt) {

  function loadPostCssPlugin(name) {
    var plugin;

    try {
      plugin = require(name);
      return plugin;
    }
    catch (error) {
      plugin = Function.prototype; // no-op
      console.log(error.message + ' used by task postcss');
    }

    return plugin;
  }

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    sass: {
      options: {
        outputStyle: "compressed"
      },
      // dist: {
      //   files: [{
      //     expand: true,
      //     src: ['src/app/Main.scss', '**/**/**/**/*.scss', "!node_modules/**"],
      //     ext: ".css"
      //   }]
      // }
      dist: {
        files: {
          'dist/styles/Main.css': 'src/styles/Main.scss',
          'dist/Components/Header/css/Header.css': 'src/app/Components/Header/css/Header.scss',
          'dist/Components/InteractiveLegend/css/InteractiveLegend.css': 'src/app/Components/InteractiveLegend/css/InteractiveLegend.scss',
          'dist/Components/Screenshot/css/Screenshot.css': 'src/app/Components/Screenshot/css/Screenshot.scss',
          'dist/Components/Info/css/Info.css': 'src/app/Components/Info/css/Info.scss'
        }
      }
    },
    postcss: {
      options: {
        processors: [
          loadPostCssPlugin('autoprefixer')(),
          loadPostCssPlugin('postcss-normalize-charset')()
        ]
      },
      dist: {
        src: ["dist/styles/Main.css", 'dist/Components/InteractiveLegend/css/InteractiveLegend.css', 'dist/Components/Screenshot/css/Screenshot.css', 'dist/Components/Header/css/Header.css', "!node_modules/**"]
      }
    },
    watch: {
      styles: {
        files: ['src/styles/Main.scss', 'src/app/Components/InteractiveLegend/css/InteractiveLegend.scss', 'src/app/Components/Screenshot/css/Screenshot.scss', 'src/app/Components/Header/css/Header.scss', 'src/app/Components/Info/css/Info.scss'],
        tasks: ['styles']
      }
    },
    tslint: {
      options: {
        configuration: 'tslint.json',
        fix: false
      },
      files: {
        src: ['application/**/*.ts']
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'hub-auth-js/**/*.js'],
      ignores: ['**/node_modules/', 'tsrules/**/*.js']
    }
  });

  grunt.registerTask('styles', 'compile & autoprefix CSS', ['sass', 'postcss']);
  grunt.registerTask("default", ["watch"]);
  grunt.registerTask('lint:ts', ['tslint']);
  grunt.registerTask('lint:js', ['jshint:all']);
  grunt.registerTask('lint', ['lint:js', 'lint:ts']);
};
