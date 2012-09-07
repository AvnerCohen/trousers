var request = require("request"),
  _ = require('lodash');

exports.followers = function(req, res) {
	var name = req.body.username;
	request.get("https://api.twitter.com/1/followers/ids.json?cursor=-1&screen_name=" + name, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var ids = JSON.parse(body).ids;
			ids = ids.sort();
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

exports.friends = function(req, res) {
	var name = req.body.username;
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
	var whiteList = req.body.whiteList;
	var ids = req.body.union.split(",");
	ids = ids.sort();
	if (whiteList){
		whiteList = JSON.parse(whiteList);
		ids = manageWhiteListed (ids, whiteList, true);
	}
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
};

//Utility method to clean up ids of whiteListed users;
//Ids - Array of All non followers
//WhiteList - industry leaders?
function manageWhiteListed (ids, whiteList){
	return _.filter(ids, function (value, key){
		var exist = (whiteList[value]);
		return !exist;
	});
}