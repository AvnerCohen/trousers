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
	var cont = $(".names_and_faces").eq(0);
	cont.append("<h3>Followers: " + data.length+"</h3>");
	for (var i = 0; i < data.length; i++) {
		cont.append(troursers.getProfileEntry(data[i]));
		}
	}

	troursers.getProfileEntry = function(body) {
		var str = "<div class='entry'><img src='" + body.profile_image_url + "'/>";
		str += "&nbsp;<label>@" + body.screen_name + "</label>";
	//	str += "<b>id:</b>" + body.id;
		str += "<p><b>Following/Followers</b>:" + body.friends_count + "/" + body.followers_count+"</p>";

		return str;
	}
