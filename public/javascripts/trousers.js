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
	var ids = data.ids;
	var ul = $(".names_and_faces").eq(0).append("<ul>");
	for (var i = 0; i < ids.length; i++){
		ul.append("<li>Id: " + ids[i]);
	}

}