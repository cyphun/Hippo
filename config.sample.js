module.exports = {
	selfURL: 'http://example.com',
	hipchat: {
		rooms: [
			{
				'roomId': '', // Select a room from https://paloalto.hipchat.com/rooms - this is "API ID" from that page
				'authcode': '', // from https://paloalto.hipchat.com/account/api
				'roomToken': '' // from https://paloalto.hipchat.com/rooms/tokens/[roomId]/ 
			},
			{	// as many rooms as you want to control
				'roomId': '', // Select a room from https://paloalto.hipchat.com/rooms - this is "API ID" from that page
				'authcode': '', // from https://paloalto.hipchat.com/account/api
				'roomToken': '' // from https://paloalto.hipchat.com/rooms/tokens/[roomId]/ 
			}
		]
	},
	aws: {
		key: '',	// for storing images etc.
		secret: '',
		bucket: ''
	},
	dropcam: {
		uuid: '' // Go to your dropcam page and view-source, search for "uuid=" - your UUID is the first result. 32 chars of hex.
	},
	customSearch: {
		requires: [
			'dependencies.js', // include any dependencies that your custom search needs
			'custom-search.js' // include your custom JS search, this should include your AppSearch object
		],
		hipChatPattern: '[', // the search pattern that hipchat uses to trigger your custom search
		
		// use a regex to actually find what you are searching off of,
		// in this case anything inside square brackets [searchTerm], with just one group
		messageRegex: new RegExp('\\[(.*?)\\]', 'gi'), 

	}
}
