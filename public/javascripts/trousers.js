$(document).ready(function() {

	trousers.setAjaxSpinner();

	$("#trousers_form").on("submit", function() {

		var type = $("input:radio[name=behavior]:checked").val();
		if(type === "white_listing") {
			trousers.handleWhiteListingSubmit();
		} else {
			//manage followback ratio calculation
			trousers.handleFollowBackRatioSubmit();
		}

		return false;
	});

	$("div.non_followers").on("click", ".entry label", trousers.whiteList.add);
}); //end ondocumentready
var trousers = {};

trousers.handleWhiteListingSubmit = function() {
	var followers, friends; //Globals, need to find a cleaner way though.
	var username = $("#username").val();
	username = username.replace("@", ""); //Clean up, for safety;
	$.post("/followers", {
		username: username,
		whiteList: trousers.whiteList.getWhiteListParam()
	}, function(data) {
		console.log("back from /followers");
		followers = trousers.showReturnedList(data, ".followers");
		trousers.timeline.saveLog(data);
	}).then(function() {
		$.post("/friends/", {
			username: username,
			whiteList: trousers.whiteList.getWhiteListParam()
		}, function(data) {
			console.log("back from /friends");
			friends = trousers.showReturnedList(data, ".friends");
		}).then(function() {
			var both = _.intersection(followers, friends);
			$.post("/union/", {
				union: both.join(","),
				username: username
			}, function(data) {
				console.log("back from /union");
				var throwaway = trousers.showReturnedList(data, ".both_f_and_f");
			});
		}).done(function() {
			var non_followers = _.difference(friends, followers);
			$.post("/union/", {
				union: non_followers.join(","),
				username: username,
				whiteList: trousers.whiteList.getWhiteListParam()
			}, function(data) {
				console.log("back from /union2");
				var throwaway = trousers.showReturnedList(data, ".non_followers");

			});
		}, function() {
			var whiteList = extractArray(pLayer.get("whiteList"));
			$.post("/union/", {
				union: whiteList.join(","),
				username: username
			}, function(data) {
				var throwaway = trousers.showReturnedList(data, ".white_list");
				console.log("back from /union3");
			});
		});
	});

};

trousers.handleFollowBackRatioSubmit = function() {
	var username = $("#username").val();
	username = username.replace("@", ""); //Clean up, for safety;
	$.post("followback_ratio", {
		username: username
	}, function(data) {
		$(".ratio").html(data);
	});
};


trousers.showReturnedList = function(data, classNameOfTarget) {
	window.setTimeout(function(){
		var cont = $(classNameOfTarget).eq(0);
		cont.html(""); // clean up
		var totalLength = 0;
		for(var i in data) {
			totalLength++;
			cont.append(trousers.getProfileEntry(data[i]));
		}

		$(classNameOfTarget + "_label").html(totalLength);
	}, 10);

	return trousers.getIds(data);
};

trousers.getProfileEntry = function(body) {
	var str = "<div class='entry'><img src='" + body.profile_image_url + "'/>";
	str += "<p><label data-id='" + body.id + "'>@" + body.screen_name + "</label><br/><b>Follows</b>: <span class='counter'>" + body.friends_count + "<br/><b>Following:</b> " + body.followers_count + "</span></p>";

	return str;
};

trousers.getIds = function(data) {
	var ids = [];
	for(var i in data) {
		ids.push(data[i].id);
	}
	return ids;
};

trousers.setAjaxSpinner = function() {
	$('.spin_ajax').hide().ajaxStart(function() {
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

trousers.timeline = {}; //Keep log of changes in followers from one check to another
trousers.timeline.localStoragePrefix = "trousers_";
trousers.timeline.changesToLog = ""; //String to be injected later, if needed.
//Keep a log of current followers and indicatetimeline changes.

trousers.timeline.saveLog = function(followers){

	var rel_user_name = $("#username").val() + "_";
	var lastLocalStorageEntry = 0;
	var previousLog = {};
	while (previousLog !== null){
		previousLog = pLayer.get(trousers.timeline.localStoragePrefix + rel_user_name + (++lastLocalStorageEntry));
	}

	previousLog = pLayer.get(trousers.timeline.localStoragePrefix + rel_user_name + (lastLocalStorageEntry-1)); //Go back one step to get actual data
	var lastData = previousLog ? previousLog.split(",") : [];
	var prevKey = lastData.sort();
	var currentKey = trousers.timeline.getTimeLineKey(followers);

	//console.log("prevKey:"+prevKey.join(","));
	//console.log("currentKey:"+currentKey.join(","));

	//Save new key if differnt
	if (prevKey.join(",") !== currentKey.join(",")){
		pLayer.set(trousers.timeline.localStoragePrefix + rel_user_name + (lastLocalStorageEntry), currentKey.join(","));
		trousers.timeline.logToTimeLine("Direction one: " + _.difference(prevKey, currentKey));
		trousers.timeline.logToTimeLine("Direction two: " + _.difference(currentKey, prevKey));
		console.log("Difference, logged: " + trousers.timeline.localStoragePrefix + rel_user_name + (lastLocalStorageEntry));
	}else{
		trousers.timeline.logToTimeLine("No Change!")
	}

};

trousers.timeline.getTimeLineKey = function(json){
	var array = [];
	for (var t in json){
		array.push(json[t].screen_name);
	}
	
	return array.sort();
};

trousers.timeline.logToTimeLine = function(str){
	console.log(str);
	$(".time_line_details").append("<li>" + str + "</li>");
}

function extractArray(json) {
	var arr = [];

	for(var i in json) {
		arr.push(i);
	}
	return arr.sort();
}