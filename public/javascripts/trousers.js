$(document).ready(function() {

	$("#trousers_form").on("submit", function() {

		var username = $("#username").val();
		var username = username.replace("@", ""); //Clean up, for safety;
		var followers, friends;
		$.get("/followers/" + username, function(data) {
			followrs = 	troursers.showReturnedList(data, ".followers", "Followers");
		});
		$.get("/friends/" + username, function(data) {
			friends = troursers.showReturnedList(data, ".friends", "Following");
		});

		var both = _.union(followers, friends);
		$.post("/union/",{union : both.join(","), username: username} , function(data) {
			var throwaway = troursers.showReturnedList(data, ".both_f_and_f", "Following/Followers");
		});

		return false;
	})

});

var troursers = {};

troursers.showReturnedList = function(str, classNameOfTarget, title) {
	var data = JSON.parse(str);
	var cont = $(classNameOfTarget).eq(0);
	cont.html(""); // clean up
	cont.append("<h3>"+title+": " + data.length + "</h3>");
	for (var i = 0; i < data.length; i++) {
		cont.append(troursers.getProfileEntry(data[i]));
	}
	return troursers.getIds(data);
}

troursers.getProfileEntry = function(body) {
	var str = "<div class='entry'><img src='" + body.profile_image_url + "'/>";
	str += "<p><label>@" + body.screen_name + "</label><br/><b>Following/Followers</b>:" + body.friends_count + "/" + body.followers_count + "</p>";

	return str;
}

troursers.getIds = function(data) {
	var ids = [];
	for (var i = 0; i < data.length; i++) {
		ids.push(data[i].id);
	}
/*	var content = {
		ids: ids,
		totalCount: data.length
	};
	pLayer.set(new Date().getTime(), content);*/
	return ids;
}

var pLayer = {};


pLayer.get = function(key) {
	var str = localStorage.getItem(key);
	return (str) ? JSON.parse(str) : null;
}
pLayer.set = function(key, data) {
	return localStorage.setItem(key, JSON.stringify(data));
}