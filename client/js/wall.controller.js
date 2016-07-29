var app = angular.module('wall', []);

app.controller('wall-controller', function ($scope, $http) {
	$scope.busy = false;
	$scope.message = "";
	angular.element(document).find(".hidden-xs-up").removeClass("hidden-xs-up");


	$scope.findme = function () {
		if ($scope.busy !== true) {
			if (navigator.geolocation) {
				$scope.message = "";
				$scope.busy = true;
				angular.element(document).find("#findmebutton").addClass("disabled");
				var startPos;

				var geoOptions = {
					maximumAge: 5 * 60 * 1000,
					timeout: 10 * 1000,
					enableHighAccuracy: true
				}

				var geoSuccess = function (position) {
					startPos = position;
					let coords = {
						latitude: startPos.coords.latitude,
						longitude: startPos.coords.longitude
					}

					$http.post('/search', coords).then(function (response) {
						$scope.businesses = parseBusinesses(response.data);
						$scope.busy = false;
						angular.element(document).find("#findmebutton").removeClass("disabled");
					}, function (response) {
						$scope.message = (response.data)
						$scope.busy = false;
						angular.element(document).find("#findmebutton").removeClass("disabled");
					});
				};

				var geoError = function (error) {
					// error.code can be:   0: unknown error   1: permission denied   2: position unavailable (error response from location provider)   3: timed out
					console.log('Error occurred with geolocation. Error code: ' + error.code);

					switch (error.code) {
					case 0:
						$scope.message = "Unknown error.";
						break;
					case 1:
						$scope.message = "Permission denied.";
						break;
					case 2:
						$scope.message = "Position unavailable (error response from location provider)";
						break;
					case 3:
						$scope.message = "Geolocation timed out.";
						break;
					default:
						$scope.message = error.message;
						break;
					}

					$scope.$digest();
					$scope.busy = false;
					angular.element(document).find("#findmebutton").removeClass("disabled");
				};

				navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
			} else {
				$scope.message = "Geolocation is not supported for this Browser/OS version yet.";
				$scope.$digest();
				$scope.busy = false;
				angular.element(document).find("#findmebutton").removeClass("disabled");
			}
		}
	}

	$scope.searchlocation = function () {
		if ($scope.busy !== true) {
			if ($scope.locale !== undefined) {
				$scope.message = "";
				$scope.busy = true;
				angular.element(document).find("#searchform").addClass("disabled");
				angular.element(document).find("#searchbutton").addClass("disabled");

				var location = {
					location: $scope.locale
				}

				$http.post('/search', location).then(function (response) {
					$scope.businesses = parseBusinesses(response.data);

					$scope.busy = false;
					angular.element(document).find("#searchform").removeClass("disabled");
					angular.element(document).find("#searchbutton").removeClass("disabled");
				}, function (err) {
					$scope.message = err.data;

					$scope.busy = false;
					angular.element(document).find("#searchform").removeClass("disabled");
					angular.element(document).find("#searchbutton").removeClass("disabled");
				});
			}
		}
	}

	$scope.dismissAlert = function () {
		$scope.message = "";
	}

	function parseBusinesses(data) {
		var aux = [];

		data.businesses.forEach(elem => {
			aux.push({
				name: elem.name || undefined,
				phone: elem.display_phone || undefined,
				image: elem.image_url || undefined,
				ratingImage: elem.rating_img_url_large || undefined,
				url: elem.url || undefined,
				location: elem.location.display_address || undefined,
				categories: elem.categories || undefined
			});
		});

		return aux;
	}
});
