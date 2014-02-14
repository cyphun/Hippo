// installation

function getCapabilitiesObject(selfURL) {

	return {
	  "name": "Hippo Bot",
	  "description": "",
	  "key": "org.coonrod.hippo",
	  "links": {
	    "homepage": selfURL,
	    "self": selfURL + "/capabilities"
	  },
	  "capabilities": {
	    "hipchatApiConsumer": {
	      "scopes": [
	        "send_notification"
	      ]
	    },
	    "installable": {
		  "callbackUrl": selfURL + "/installable"
		}
	  }
	};

};

function installable() {

};

module.exports = function (app) {
	app.get('/capabilities', function (req, res) {
		res.json(getCapabilitiesObject(app.get('selfURL')));
	});
	app.post('/installable', function (req, res) {
		var installData = req.body;
		console.log(installData);
	});
};