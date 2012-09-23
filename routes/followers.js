var request = require("request");
var _ = require('lodash');
var twitter = require('ntwitter');

var twit = new twitter({
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	access_token_key: process.env.access_token_key,
	access_token_secret: process.env.access_token_secret
});

console.log("Log consumer_key:[" + process.env.consumer_key + "]");
console.log("Log consumer_secret:[" + process.env.consumer_secret + "]");
console.log("Log access_token_key:[" + process.env.access_token_key + "]");
console.log("Log access_token_secret:[" + process.env.access_token_secret + "]");


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
	if (whiteList) {
		whiteList = JSON.parse(whiteList);
		ids = manageWhiteListed(ids, whiteList, true);
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


exports.followback_ratio = function(req, res) {
	var name = req.body.username;
	var followers = [];
	//Create a complete list of all followers
	twit.getFollowersIds(name, function(error, response) {
		//Body is now the full list of this user's friends
		//To complete and calculate ratio, we need to check, on each of this user's list
		//We now have followback relations
		if (!error) {
			followers = response;
			twit.getFriendsIds(name, function(error, friends) {
				var diff = _.intersection(followers, friends);

				var calc = (diff.length / followers.length) * 100;
				console.log("diff:" + (diff.length));
				//Number of users friends this guy but not followed by him
				var ratio = calc.toFixed(2);

				//Calculate ratio as non-followedback / followers;
				res.send("Followback ratio for <b>" + name + "</b> is: <u>%" + ratio + "</u>, Of : " + followers.length + " Followers, " + diff.length + " are followed back.");
				});
			} else { //Some error occured
				res.send("Error occured, try again in a week or so.");
				console.log(error);
			}
		});
	};
	//Utility method to clean up ids of whiteListed users;
	//Ids - Array of All non followers
	//WhiteList - industry leaders?

	function manageWhiteListed(ids, whiteList) {
		return _.filter(ids, function(value, key) {
			var exist = (whiteList[value]);
			return !exist;
		});
	}