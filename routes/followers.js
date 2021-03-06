var request = require("request");
var _ = require('lodash');
var twitter = require('ntwitter');

var async = require('async');


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
	//Logic:
	//Get followers
	//Get data for each follower using showUser
	twit.getFollowersIds(name, function(error, response) {
		var followerIds = response;
		twit.showUser(followerIds, function(error, response) {
			//Replyng with:
			res.send(response);
		});
	});
};

exports.friends = function(req, res) {
	//Logic:
	//Get friends -getFriendsIds
	//Lookup all friends
	var name = req.body.username;
	var dataArray = [];
	twit.getFriendsIds(name, function(error, response) {
		var calls = 0;
		var friends_ids = response;
		var arrIdsChunks = [];
		do {
			arrIdsChunks.push(friends_ids.splice(0, 99));
		} while (friends_ids.length > 0);


		var func = function(friends_ids) {
				console.log("before " + friends_ids.length);

				twit.showUser(friends_ids, function(error, response) {
					calls++;
					dataArray.push(response);
					if(calls < arrIdsChunks.length) {
						func(arrIdsChunks[calls]);
					} else {
						complete();
					}
				});
			};

		var complete = function() {
				var combined = {};
				var delta = 0;

				for(var t = 0; t < dataArray.length; t++) {
					var updated = (delta > 0) ? increase(dataArray[t], delta) : dataArray[t];
					combined = _.extend(combined, updated);

					delta+=dataArray[t].length;
				}

				res.send(combined);
				console.log("after Callback" + dataArray.length);
			};


		func(arrIdsChunks[calls]); //Invoke asynch work

	});
};

function increase(json, delta){

for (var t in json)
		json[t+delta] = json[t];

return json;
};


exports.union = function(req, res) {
	var name = req.body.username;
	var whiteList = req.body.whiteList;
	var ids = req.body.union.split(",");
	ids = ids.sort();
	if(whiteList) {
		whiteList = JSON.parse(whiteList);
		ids = manageWhiteListed(ids, whiteList, true);
	}
	twit.showUser(ids, function(error, response) {
		//Replyng with:
		res.send(response);
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
		if(!error) {
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