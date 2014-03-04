var searchConf = global.config.customSearch;

for(var i = 0; i < searchConf.requires.length; i++){
	require(seachConf.requires[i]);
}

//
// At this point you should have any dependencies and your main search object
// included. Your search object should be named CustomSearch and have the
// following functions:
// CustomSearch.search(arguments)
//	Arguments
//		searchTerm: the term for the search
//	Returns
//		boolean: true if it searched, false if it did not search
// CustomSearch.isResults()
//	Arguments
//		none
//	Returns
//		boolean: true if there are 1 or more results
// CustomSearch.display()
//	Arguments
//		none
//	Returns
//		string: a string of the HTML results
//

module.exports = {
	name: 'CustomSearch',
	pattern: searchConf.hipChatPattern,
	event: 'room_message',
	notification: {
		notify: true,
		color: 'gray',
		'message_format': 'html'
	},
	execute: function(body, cb){
		var message = body.item.message.message,
			searchResults = [],
			i;

		var tokens = searchConf.messageRegex.exec(message);

		// currently this bot expects to have one group in the RegEx, which will return
		// 2 tokens from the regex exec function
		if(tokens !== null && tokens.length === 2 && tokens[1].length > 0){
			CustomSearch.search(tokens[1]);
		}

		if(CustomSearch.isResults()){
			cb(CustomSearch.display());
		}
	}
};