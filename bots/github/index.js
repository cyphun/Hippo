var util = require('util');

var _ = require('underscore');

var template = {
	'opened': function(body) {
		var tpl = '<img src="%s&s=24" /> Pull Request #%d <a href="%s">%s</a>';
		var pr = body['pull_request'];
		return util.format(tpl, pr.user['avatar_url'], pr.number, pr.html_url, pr.title);
	}
};

module.exports = {
	name: 'github',
	registration: function (app, selfURL, cb) {
		// listen for webhook
		app.post('/webhook/github', function (req, res) {
			
			var body = req.body;
			
			if (_.has(template, body.action)) {
				var notification = template[body.action](body);
				cb(notification);
			}

			res.send(200);
		});
	},
	notification: {
		message: 'message not found',
		notify: true,
		color: 'gray',
		'message_format': 'html'
	},
	execute: function () {}
};