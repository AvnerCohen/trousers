$(document).ready(function() {

	$("#trousers_form").on("submit", function() {

		var username = $("#username").val();
		var username = username.replace("@", ""); //Clean up, for safety;
		$.get("/followers/" + username, function(data) {
			troursers.showCurrentFollowers(data);
		});

		return false;
	})

});

var troursers = {};

troursers.showCurrentFollowers = function(str) {
	var data = JSON.parse(str);
	var ul = $(".names_and_faces").eq(0).append("<ul>");
	for (var i = 0; i < data.length; i++) {
		ul.append(troursers.getProfileEntry(data[i]));
		}
	}

	troursers.getProfileEntry = function(body) {
		var str = "<li><b>" + body.screen_name + "</b>";
		str += "<img src='" + body.profile_image_url + "'/>&nbsp;";
		str += "<b>id:</b>" + body.id;
		str += ", <b>Following/Followers</b>:" + body.friends_count + "/" + body.followers_count;

		return str;
	}