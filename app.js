
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , expressLayouts = require('express-ejs-layouts')
  , gzippo = require('gzippo');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//Replace the default connect or express static provider with gzippo's
//app.use(express.static(__dirname + '/public'));
app.use(gzippo.staticGzip(__dirname + '/public'));
app.use(gzippo.staticGzip(__dirname + '/public'));
app.use(gzippo.compress());

app.get('/', routes.index);
//app.get('/events', routes.get_events);
app.get('/event/:id',routes.get_event);

app.get('/articles/list/:event_id',routes.list_event_articles);

app.get('/event/:event_id/articles',routes.event_article)

app.get('/events',routes.get_events);
app.get('/articles', routes.articles);
app.get('/panel', routes.panel);
app.get('/timeaxis', routes.timeaxis);

app.get('/image/:id', routes.image);

app.get('/timeline/:event_id',routes.timeline);

app.get('/concept/:concept_title',routes.concept);

app.get('/panel2', routes.panel2);

app.set('view options', {
  layout: true
});

app.get("/article/:id",routes.article);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
