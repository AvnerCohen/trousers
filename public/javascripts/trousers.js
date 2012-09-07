$(document).ready(function() {

	trousers.setAjaxSpinner();

	$("#trousers_form").on("submit", function() {

		var followers, friends; //Globals, need to find a cleaner way though.
		var username = $("#username").val();
		username = username.replace("@", ""); //Clean up, for safety;
		$.post("/followers", {username: username, whiteList: trousers.whiteList.getWhiteListParam()}, function(data) {
			followers = trousers.showReturnedList(data, ".followers");
		}).then(function() {
			$.post("/friends/", {username: username, whiteList: trousers.whiteList.getWhiteListParam()}, function(data) {
				friends = trousers.showReturnedList(data, ".friends");
			}).then(function() {
				var both = _.intersection(followers, friends);
				$.post("/union/", {
					union: both.join(","),
					username: username,
					whiteList : trousers.whiteList.getWhiteListParam()
				}, function(data) {
					var throwaway = trousers.showReturnedList(data, ".both_f_and_f");
				});
			}).done(function() {
				var non_followers = _.difference(friends, followers);
				$.post("/union/", {
					union: non_followers.join(","),
					username: username,
					whiteList : trousers.whiteList.getWhiteListParam()
				}, function(data) {
					var throwaway = trousers.showReturnedList(data, ".non_followers");

				});
			});
		});
		return false;
	});

	$("div.non_followers").on("click", ".entry label", trousers.whiteList.add);
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
};

trousers.getProfileEntry = function(body) {
	var str = "<div class='entry'><img src='" + body.profile_image_url + "'/>";
	str += "<p><label data-id='" + body.id + "'>@" + body.screen_name + "</label><br/><b>Following/Followers</b>:<span class='counter'>" + body.friends_count + "/" + body.followers_count + "</span></p>";

	return str;
};

trousers.getIds = function(data) {
	var ids = [];
	for (var i = 0; i < data.length; i++) {
		ids.push(data[i].id);
	}
	return ids;
};

trousers.setAjaxSpinner = function() {
	$('#spinAjax').hide().ajaxStart(function() {
		$(this).show();
	}).ajaxStop(function() {
		$(this).hide();
	});
};

trousers.whiteList = {};

trousers.whiteList.add = function() {
	var target = $(this);
	var id = target.attr("data-id");
	var name = target.text();

	var whiteList = pLayer.get("whiteList") || {};
	whiteList[id] = name;
	pLayer.set("whiteList", whiteList);

};

trousers.whiteList.getWhiteListParam = function() {

	var obj = pLayer.get("whiteList");

	return obj ? JSON.stringify(obj) : "";
};