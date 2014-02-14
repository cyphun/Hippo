var webhookKey = "hippo";

var _ = require('underscore'),
	async = require('async');

function getWebhookName(bot) {
	return [webhookKey, bot.name].join('.');
};

function isOurWebhook(webhookName) {
	return (webhookName.indexOf(webhookKey) === 0);
};

function getWebhookPath(bot, selfURL) {
	var path = "";
	if (selfURL) {
		path = selfURL;
	}
	path += "/webhook/hipchat/" + bot.name;
	return path;
};

function unregisterBots (hipchat, roomId, cb) {
	// get list of webhooks
	hipchat.webhooks(roomId, function (err, hooks) {

		// run callback - we have the rooms to delete already so who cares if they change
		typeof cb === 'function' && cb();

		// Delete all webhooks we previously registered
		_.each(hooks.items, function (hook) {
			if (isOurWebhook(hook.name)) {
				hipchat.delete_webhook(roomId, hook.id, function (err, err_response) {
					console.log(err ? err_response : ('Deleted old webhook ' + hook.name));
				});
			}
		});
	});
};

function registerBots(app, selfURL, roomId, bots, hipchat) {
	// loop through list of bots
	var bot;

	_.each(bots, function (bot) {
		// register each bot
		//bot = bots[i];

		var notification = _.extend({}, bot.notification);

		var cb = function (response) {

			if (_.isString(response)) {
				notification.message = response;
			} else if (_.isObject(response)) {
				notification = _.defaults(response, notification);
			}

			notification.token = global.config.hipchat.roomToken;

			hipchat.notify(roomId, notification, function () {
				console.log('sent notification');
			});
		};

		// listen for a webhook
		app.post(getWebhookPath(bot), function (req, res) {
			bot.execute(req.body, cb);
		});

		if (_.isFunction(bot.registration)) {
			bot.registration(app, selfURL, cb);
		}

		if (bot.event && selfURL) {
			// register hipchat webhook
			hipchat.create_webhook(roomId, {
				url: getWebhookPath(bot, selfURL),
				pattern: bot.pattern || undefined,
				event: bot.event,
				name: getWebhookName(bot)
			}, function (err, err_response) {
				console.log(err ? err_response : ('Registered webhook ' + getWebhookName(bot)));
			});
		}
	});

};


module.exports = {
	setUpBots: function (app, hipchat, roomId, bots) {

		var selfURL = app.get('selfURL');

		unregisterBots(hipchat, roomId, function () {
			// register bots
			registerBots(app, selfURL, roomId, bots, hipchat, function () {
				console.log('All webhooks successfully registered')
			});
		});
	}
};


