var webhookKey = "hippo";

var _ = require('underscore'),
	async = require('async'),
	Hipchatter = require('hipchatter');

function getWebhookName(bot) {
	return [webhookKey, bot.name].join('.');
};

function isOurWebhook(webhookName) {
	return (webhookName.indexOf(webhookKey) === 0);
};

function getWebhookPath(bot, roomId, selfURL) {
	var path = "";
	if (selfURL) {
		path = selfURL;
	}
	path += "/webhook/hipchat/" + roomId + '/' + bot.name;
	return path;
};

function unregisterBots (cb) {
	// get list of webhooks
	async.concat(global.config.hipchat.rooms, function (roomConfig, concatCallback) {

		var hipchat = new Hipchatter(roomConfig.authCode);
		hipchat.webhooks(roomConfig.roomId, function (err, hooks) {
			// we don't know what room it's on
			_.each(hooks.items, function (hook) {
				hook.room = roomConfig;
			});
			concatCallback(err, hooks.items);
		});

	}, function (err, hooks) {
		// run callback - we have the rooms to delete already so who cares if they change		
		cb();

		// Delete all webhooks we previously registered
		_.each(hooks, function (hook) {
			var hipchat = new Hipchatter(hook.room.authCode);
			if (isOurWebhook(hook.name)) {
				hipchat.delete_webhook(hook.room.roomId, hook.id, function (err, err_response) {
					console.log(err ? 'delete error- ' +  err_response : ('Deleted old webhook ' + hook.name));
				});
			}
		});

	});

};

function registerBots(app, selfURL, bots) {
	// loop through list of bots
	var bot;

	// set up webhooks for each room
	_.each(global.config.hipchat.rooms, function (room) {

		var hipchat = new Hipchatter(room.authCode);

		_.each(bots, function (bot) {
			// register each bot

			var notification = _.extend({
				token: room.roomToken
			}, bot.notification);

			var cb = function (response) {

				if (_.isString(response)) {
					notification.message = response;
				} else if (_.isObject(response)) {
					notification = _.defaults(response, notification);
				}

				hipchat.notify(room.roomId, notification, function () {
					console.log('sent notification');
				});
			}; 

			// listen for a webhook
			app.post(getWebhookPath(bot, room.roomId), function (req, res) {
				bot.execute(req.body, cb);
			});

			if (_.isFunction(bot.registration)) {
				bot.registration(app, selfURL, cb);
			}

			if (bot.event && selfURL) {
				// register hipchat webhook
				hipchat.create_webhook(room.roomId, {
					url: getWebhookPath(bot, room.roomId, selfURL),
					pattern: bot.pattern || undefined,
					event: bot.event,
					name: getWebhookName(bot)
				}, function (err, err_response) {
					console.log(err ? err_response : ('Registered webhook ' + getWebhookName(bot)));
				});
			}
		});

	});

};


module.exports = {
	setUpBots: function (app, bots) {

		var selfURL = app.get('selfURL');

		unregisterBots(function () {
			// register bots
			registerBots(app, selfURL, bots);
		});
	}
};


