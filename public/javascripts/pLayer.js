var pLayer = {};


pLayer.get = function(key) {
	var str = localStorage.getItem(key);
	return (str) ? JSON.parse(str) : null;
};
pLayer.set = function(key, data) {
	return localStorage.setItem(key, JSON.stringify(data));
};