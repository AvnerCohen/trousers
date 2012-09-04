var request = require("request");

exports.followers = function(req, res) {
	var name = req.params.username;
	request.get("https://api.twitter.com/1/followers/ids.json?cursor=-1&screen_name=" + name, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var ids = JSON.parse(body).ids;
			ids = ids.sort();
			console.log("For:" + name + "\n" + ids.join(","));
			request.get("http://api.twitter.com/1/users/lookup.json?user_id=" + ids.join(","), function(error, response, body) {
				if (!error && response.statusCode == 200) {
					res.send(body);
				} else {
					res.send("Error occured, api result:" + response.statusCode);
					console.log("##########!!!!###\n" + response);
				}
			});
		} else {
			res.send("Error occured, api result:" + response.statusCode);
			console.log("##########!!!!###\n" + response);
		}
	});

};

exports.friends = function(req, res) {
	var name = req.params.username;
	request.get("https://api.twitter.com/1/friends/ids.json?cursor=-1&screen_name=" + name, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var ids = JSON.parse(body).ids;
			ids = ids.sort();
			if (ids.length > 99) {
				ids = ids.splice(0, 99);
				console.log("#### Temporary fix, number of ids is spliced due to twitter API limit.");
			}
			request.get("http://api.twitter.com/1/users/lookup.json?user_id=" + ids.join(","), function(error, response, body) {
				if (!error && response.statusCode == 200) {
					res.send(body);
				} else {
					res.send("Error occured, api result:" + response.statusCode);
					console.log("##########!!!!###\n" + JSON.stringify(response));
				}
			});
		} else {
			res.send("Error occured, api result:" + response.statusCode);
			console.log("##########!!!!###\n" + JSON.stringify(response));
		}
	});
};

exports.union = function(req, res) {
	var name = req.body.username;
	console.log("Data:" + req.body.union)
	var ids = req.body.union.split(",");
	ids = ids.sort();
	if (ids.length > 99) {
		ids = ids.splice(0, 99);
		console.log("#### Temporary fix, number of ids is spliced due to twitter API limit.");
	}
	console.log("For:" + name + "\n" + ids.join(","));
	request.get("http://api.twitter.com/1/users/lookup.json?user_id=" + ids.join(","), function(error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(body);
		} else {
			res.send("Error occured, api result:" + response.statusCode);
			console.log("##########!!!!###\n" + JSON.stringify(response));
		}
	});
};