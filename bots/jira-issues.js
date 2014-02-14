// look up a jira case

var JiraApi = require('jira').JiraApi,
	_ = require('underscore'),
	Entities = require('html-entities').AllHtmlEntities;

var entities = new Entities();

var jiraConf = global.config.jira;

var getJira = function () {
	return new JiraApi(jiraConf.protocol, jiraConf.host, jiraConf.port, jiraConf.user, jiraConf.password, jiraConf.version);
};

var execute = function (body, cb) {

	var message = body.item.message.message;

	var issueRegex = new RegExp(jiraConf.prefix + '-([\\d]{1,6})', 'gi');

	var issueMentions = message.match(issueRegex);

	_.chain(issueMentions).uniq().each(function (issueKey) {

		// Jira API wants uppercase
		var issueKey = issueKey.toUpperCase();

		// fetch information about this from jira
		getJira().findIssue(issueKey, function (error, issue) {

			var fields = issue.fields;
			var chat = "";
			chat += '<img src="' + fields.priority.iconUrl + '" /> ';

			// if someone's assigned, show their icon
			if (fields.assignee && fields.assignee.name !== "closed") {
				chat += '<img src="' + fields.assignee.avatarUrls['16x16'] + '" /> ';
			}

			// show the issue key, linked to the issue
			chat += '<a href="' + global.config.jira.issueUrl + issue.key + '"> ' + issue.key + '</a> ';

			// Show the summary field
			chat += entities.encode(fields.summary);

			var priorityColor = 'gray';
			var priority = fields.priority.name;
			if (priority.indexOf('P1') === 0 || priority.indexOf('P0') === 0) {
				priorityColor = 'red';
			} else if (priority.indexOf('P2') === 0) {
				priorityColor = 'yellow';
			}

			cb({
				color: priorityColor,
				message: chat
			});

		});
	});
}

var pattern = '/' + jiraConf.prefix;

module.exports = {
	name: 'JIRA',
	pattern: pattern,
	event: 'room_message',
	notification: {
		notify: true,
		color: 'gray',
		'message_format': 'html'
	},
	execute: execute
};