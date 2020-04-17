var metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var handlebars = require('handlebars');
var collections = require('metalsmith-collections');
var discoverPartials = require('metalsmith-discover-partials');
var permalinks = require('metalsmith-permalinks');
var dateFormatter = require('metalsmith-date-formatter');
var writemetadata = require('metalsmith-writemetadata');
var watch = require('metalsmith-watch');
var filename = require("metalsmith-file-titles");
var inplace = require("metalsmith-in-place")
var inspect = require("metalsmith-inspect")

var repeat = require('handlebars-helper-repeat');

handlebars.registerHelper('repeat', repeat);

handlebars.registerHelper('slugify', function (str) {
  if(str && typeof str === "string") {
    return str.split(' ').join('-').toLowerCase();
  }
  return '';
});

handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

handlebars.registerHelper('limit', function (arr, limit) {
  if (!Array.isArray(arr)) { return []; }
  return arr.slice(0, limit);
});

metalsmith(__dirname)
  .metadata({
    site: {
      name: 'inform-studio-site',
      description: "Portfolio of Sean Kelley."
    }
  })
  .source('./src')
  .destination('./public')
  .use(discoverPartials({}))
  .use(inplace({
    engine: 'handlebars',
    pattern: ["*/*/*.hbs","*/*.hbs","*.hbs"]
  }))
  .use(collections({
      blog: {
        pattern: 'blog/*.md',
        sortBy: 'published',
        reverse: true
        },
      work: {
        pattern: 'work/**/*.md',
        sortBy: 'date',
        reverse: true
        }
  }))
.use(function(files, metalsmith, done) {
    const groupBy = key => array =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        value.forEach(function(item){
          objectsByKeyValue[item] = (objectsByKeyValue[item] || []).concat(obj);
        })
        return objectsByKeyValue;
      }, {});
    const groupByTag = groupBy('tag');
    var tagList = groupByTag(metalsmith.metadata().collections.blog);
    metalsmith.metadata().tags = tagList;
    done();
  })
  .use(filename())
  .use(markdown())
  .use(dateFormatter({
    dates: [
          {
              key: 'date',
              format: 'MMMM YYYY'
          },
          {
              key: 'published',
              format: 'MMMM DD, YYYY'
          }
      ]
    }
  ))
  .use(permalinks({
    relative: "folder",
    linksets: [
        {
          match: { collection: 'work' },
          pattern: 'work/:filename',
        },
        {
          match: { collection: 'blog' },
          pattern: 'blog/:filename',
        }
      ]
  }))
  .use(layouts({
            engine: 'handlebars',
            directory: './layouts',
            default: 'article.hbs',
            pattern: ["*/*/*.html","*/*.html","*.html"]
        }))
//  .use(writemetadata({            // write the JS object
//      pattern: ['**/*'],            // for each file into .json
//      ignorekeys: ['next', 'previous'],
//      bufferencoding: 'utf8'        // also put 'content' into .json
//    }))
//  .use(
//      watch({
//        paths: {
//          "style.css": true,
//          "src/**/*": true,
//          "layouts/**/*": true,
//          "partials/**/*": true,
//        },
//        livereload: true,
//      })
//    )
//.use(function(files, metalsmith, done) {
//  console.log(metalsmith.metadata())
//  done();
//})
//  .use(inspect())
  .build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site built.');
    }
  });