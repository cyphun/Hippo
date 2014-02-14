
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var Hipchatter = require('hipchatter');
var hipchatInstall = require('./routes/hipchat-install.js');

var botManager = require('./botManager.js');
global.config = require('./config.js');

var hipchatter = new Hipchatter(global.config.hipchat.authcode);

var app = express();

var i;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('abricadalifornia 5535929929184182'));
//app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.set('selfURL', config.selfURL);

// update the selfURL value when a request comes in
app.all('*', function (req, res, next) {
	var selfURL = req.protocol + '://' + req.headers.host;
	app.set('selfURL', selfURL);
	next();
});

// set up hipchat addon routes
// not yet functional
//hipchatInstall(app);

var bots = [
	require('./bots/kesey/index.js'),
	require('./bots/github/index.js'),
	require('./bots/jira-issues.js'),
	require('./bots/lunch.js')
];

// this registers webhooks with hipchat with an alternate URL if necessary
app.get('/registerhooks', function (req, res) {
	botManager.setUpBots(app, hipchatter, config.hipchat.roomId, bots);
	res.send(200);
});

// automatically set up webhooks with default URL
botManager.setUpBots(app, hipchatter, config.hipchat.roomId, bots);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
