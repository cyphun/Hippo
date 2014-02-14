module.exports = {
	selfURL: 'http://example.com',
	hipchat: {
		'roomId': '', // Select a room from https://paloalto.hipchat.com/rooms - this is "API ID" from that page
		'authcode': '', // from https://paloalto.hipchat.com/account/api
		'roomToken': '' // from https://paloalto.hipchat.com/rooms/tokens/[roomId]/ 
	},
	aws: {
		key: '',	// for storing images etc.
		secret: '',
		bucket: ''
	},
	dropcam: {
		uuid: '' // Go to your dropcam page and view-source, search for "uuid=" - your UUID is the first result. 32 chars of hex.
	}
}
