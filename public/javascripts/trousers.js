$(document).ready(function() {

	trousers.setAjaxSpinner();

	$("#trousers_form").on("submit", function() {

		var followers, friends; //Globals, need to find a cleaner way though.
		var username = $("#username").val();
		var username = username.replace("@", ""); //Clean up, for safety;
		$.get("/followers/" + username, function(data) {
			followers = trousers.showReturnedList(data, ".followers");
		}).then(function() {
			$.get("/friends/" + username, function(data) {
				friends = trousers.showReturnedList(data, ".friends");
			}).then(function() {
				var both = _.intersection(followers, friends);
				$.post("/union/", {
					union: both.join(","),
					username: username
				}, function(data) {
					var throwaway = trousers.showReturnedList(data, ".both_f_and_f");
				})
			}).done(function() {
				var non_followers = _.difference(friends, followers);
				$.post("/union/", {
					union: non_followers.join(","),
					username: username
				}, function(data) {
					var throwaway = trousers.showReturnedList(data, ".non_followers");
				})
			})
		});
		return false;
	})
}); //end ondocumentready
var trousers = {};

trousers.showReturnedList = function(str, classNameOfTarget) {
	var data = JSON.parse(str);
	var cont = $(classNameOfTarget).eq(0);
	cont.html(""); // clean up
	$(classNameOfTarget + "_label").html(data.length);
	for (var i = 0; i < data.length; i++) {
		cont.append(trousers.getProfileEntry(data[i]));
	}
	return trousers.getIds(data);
}

trousers.getProfileEntry = function(body) {
	var str = "<div class='entry'><img src='" + body.profile_image_url + "'/>";
	str += "<p><label>@" + body.screen_name + "</label><br/><b>Following/Followers</b>:<span class='counter'>" + body.friends_count + "/" + body.followers_count + "</span></p>";

	return str;
}

trousers.getIds = function(data) {
	var ids = [];
	for (var i = 0; i < data.length; i++) {
		ids.push(data[i].id);
	}
	return ids;
}

trousers.setAjaxSpinner = function() {
	$('#spinAjax').hide().ajaxStart(function() {
		$(this).show();
	}).ajaxStop(function() {
		$(this).hide();
	});
};

var pLayer = {};


pLayer.get = function(key) {
	var str = localStorage.getItem(key);
	return (str) ? JSON.parse(str) : null;
}
pLayer.set = function(key, data) {
	return localStorage.setItem(key, JSON.stringify(data));
}