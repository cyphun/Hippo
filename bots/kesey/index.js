var s3 = require('s3');

var fs = require('fs'),
	util = require('util');

var request = require('request'),
	shortId = require('shortid'),
	im = require('imagemagick'),
	chrono = require('chrono-node'),
	async = require('async');

	shortId.seed(859393852956);

	var width = 400;
	var frames = 15;

// returns an array of URLs to get from dropcam API
var getURLs = function (uuid, width, start, end) {

	var startSeconds = Math.floor(start.getTime() / 1000),
		endSeconds = Math.floor(end.getTime() / 1000),
		diff = (endSeconds - startSeconds),
		step = Math.floor(diff / (frames - 1));

	var urls = [];

	var url = "https://nexusapi.dropcam.com/get_image?width=%d&uuid=%s&time=%d";

	for (var i = 0; i < frames; i++) {
		urls.push(util.format(url, width, uuid, startSeconds + (i * step)));
	}

	return urls;
};

function download (localFile, remotePath, callback) {
	var localStream = fs.createWriteStream(localFile);

	var out = request({ uri: remotePath });
	out.on('response', function (resp) {
	    if (resp.statusCode === 200){
	        out.pipe(localStream);
	        localStream.on('close', function () {
	            callback(null, localFile);
	        });
	    }
	    else
	        callback(new Error("No file found at given url."),null);
	});
};

var execute = function (body, cb) {

	var reqID = shortId.generate();

	var command = body.item.message.message;

	// interpret date
	var start, end, parsed = chrono.parse(command);
	if (parsed.length) {
		parsed = parsed[0];
		if (parsed.endDate) {
			start = parsed.startDate;
			end = parsed.endDate;
		} else {
			start = new Date(parsed.startDate.getTime() - .5 * 60 * 1000);
			end = new Date(parsed.startDate.getTime() + .5 * 60 * 1000);
		}
	} else {
		throw ("unable to parse time");
	}

	var now = new Date();

	while (start > now || end > now) {
		var week = 7 * 24 * 60 * 60 * 1000;
		start = new Date(start.getTime() - week);
		end = new Date(end.getTime() - week);
	}

	var urls = getURLs(global.dropcam.uuid, width, start, end);

	// figure out what images to get

	// make a directory for these images
	var path = './bots/kesey/images/' + reqID,
		animationFilename = path + '/' + reqID + '.gif';

	fs.mkdir(path, function () {

		// fetch images
		var i = 0;
		async.each(urls, function (item, callback) {
			download(path + '/' + i + '.png', item, function (error, localFile) {
				callback(error);
			});
			i++;
		}, function (err) {
			
			// get images in directory
			fs.readdir(path, function (err, files) {
				var filePaths = [];

				if (err) {
					console.log(err);
					return;
				}

				for (var i = 0; i < files.length; i++) {
					filePaths.push(path + '/' + files[i]);
				};

				// turn images into .gif
				im.convert(['-delay', 10, '-loop', 0].concat(filePaths, animationFilename), function (err) {

					if (err) {
						console.log(err);
					}
					
					var client = s3.createClient(global.config.aws);
					var headers = {
						'Content-Type' : 'image/gif',
						'x-amz-acl'    : 'public-read'
					};

					var localPath = animationFilename;
					var remotePath = '/kesey/' + reqID + '.gif';

					var uploader = client.upload(localPath, remotePath, headers);
					uploader.on('end', function (url) {
						var message = '<img src="' + url + '" />';
						
						// clean up local files
						filePaths.push(animationFilename);
						async.each(filePaths, function (item, callback) {
							fs.unlink(item, function (err) {
								if (err) console.log(err);
								callback(err);
							});
						}, function (err) {
							if (err) console.log(err);
							fs.rmdir(path);
						});


						cb(message);
					});

					
				});

			});

		});

	});

	
	// upload gif to S3

	// callback with URL to gif

};

module.exports = {
	name: 'kesey',
	pattern: 'Kesey',
	event: 'room_message',
	notification: {
		notify: true,
		color: 'gray',
		'message_format': 'html'
	},
	execute: execute
};