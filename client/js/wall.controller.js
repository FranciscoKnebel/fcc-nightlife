var app = angular.module('wall', []);

app.controller('wall-controller', function ($scope, $http) {
	$scope.findme = function () {
		if (navigator.geolocation) {
			var startPos;

			var geoOptions = {
				maximumAge: 5 * 60 * 1000,
				timeout: 10 * 1000,
				enableHighAccuracy: false
			}

			var geoSuccess = function (position) {
				startPos = position;
				let coords = {
					latitude: startPos.coords.latitude,
					longitude: startPos.coords.longitude
				}

				$http.post('/search', coords).then(function (response) {
					console.log(data);
					showBusiness(response.data);
				});
			};

			var geoError = function (error) {
				// error.code can be:   0: unknown error   1: permission denied   2: position unavailable (error response from location provider)   3: timed out
				console.log('Error occurred with geolocation. Error code: ' + error.code);

				switch (error.code) {
				case 0:
					console.error('Unknown error.');
					break;
				case 1:
					console.error("Permission denied.");
					break;
				case 2:
					console.error("Position unavailable (error response from location provider)");
					break;
				case 3:
					console.log('Geolocation timed out.');
					break;
				}
			};

			navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
		} else {
			console.log('Geolocation is not supported for this Browser/OS version yet.');
		}
	}

	function showBusiness(data) {

	}
});
