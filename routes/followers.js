var request = require("request");

exports.followers = function(req, res) {
	var name = req.params.username;
	request.get("https://api.twitter.com/1/followers/ids.json?cursor=-1&screen_name=" + name, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var ids = JSON.parse(body).ids;
			console.log("For:" + name+"\n" + ids.join(","));
			request.get("http://api.twitter.com/1/users/lookup.json?user_id=" + ids.join(","), 
				function(error, response, body) {
				if (!error && response.statusCode == 200) {
					res.send(body);
				} else {
					res.send("Error occured, api result:" + response.statusCode);
					console.log("##########!!!!###\n" + response);
				}
			});
		}
	 else {
		res.send("Error occured, api result:" + response.statusCode);
		console.log("##########!!!!###\n" + response);
	}
	});

};