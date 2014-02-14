var _ = require('underscore');

var lunchOptions = [
	"The Davis",
	"McMeniman's (High Street)",
	"McMeniman's (North Bank)",
	"Rye",
	"Ta Ra Rin",
	"Sixth Street Grill",
	"Sushi Station",
	"Steelhead",
	"International Cafes at 5th Street Market",
	"Sweet Basil",
	"Bill & Tim's",
	"Sizzle Pie"	
];

module.exports = {
	name: 'lunch',
	pattern: 'Hippo lunch?',
	event: 'room_message',
	notification: {
		message: 'message not found',
		notify: true,
		color: 'gray',
		'message_format': 'text'
	},
	execute: function (body, cb) {
		var lunch = _.shuffle(lunchOptions)[0];
		cb("Might I humbly suggest: " + lunch);
	}
};