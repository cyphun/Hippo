var util = require('util');

var _ = require('underscore'),
	Entities = require('html-entities').AllHtmlEntities;


var entities = new Entities();

var template = {
	'opened': function(body) {
		var pr = body['pull_request'],
			avatarUrl = pr.user['avatar_url'];

		if (avatarUrl.indexOf('gravatar') > -1) {
			avatarUrl += "&s=24";
		}

		var title = entities.encode(pr.title);

		var tpl = '<img src="%s" height="24px" /> Pull Request #%d <a href="%s">%s</a>';

		return util.format(tpl, pr.user['avatar_url'], pr.number, pr.html_url, title);
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