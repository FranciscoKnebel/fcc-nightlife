var app = angular.module('wall', []);
angular.element(document).find('#busyModal').modal({
	backdrop: false,
	keyboard: false,
	show: false
});

app.controller('wall-controller', function ($scope, $http, $filter) {
	$scope.busy = false;
	angular.element(document).find('#busyModal').modal('hide');
	$scope.message = "";
	angular.element(document).find(".hidden-xs-up").removeClass("hidden-xs-up");

	$scope.findme = function () {
		if ($scope.busy !== true) {
			if (navigator.geolocation) {
				$scope.message = "";
				$scope.busy = true;
				angular.element(document).find('#busyModal').modal('show');
				angular.element(document).find(".disable-buttons").addClass("disabled");

				var startPos;

				var geoOptions = {
					maximumAge: 60 * 1000,
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
						$scope.businesses = response.data;
						$scope.busy = false;
						angular.element(document).find('#busyModal').modal('hide');

						angular.element(document).find(".disable-buttons").removeClass("disabled");
					}, function (response) {
						$scope.message = (response.data);
						$scope.busy = false;
						angular.element(document).find('#busyModal').modal('hide');

						angular.element(document).find(".disable-buttons").removeClass("disabled");
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
					angular.element(document).find('#busyModal').modal('hide');

					angular.element(document).find(".disable-buttons").removeClass("disabled");
				};

				navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
			} else {
				$scope.message = "Geolocation is not supported for this Browser/OS version yet.";
				$scope.$digest();
				$scope.busy = false;
				angular.element(document).find('#busyModal').modal('hide');

				angular.element(document).find(".disable-buttons").removeClass("disabled");
			}
		}
	}

	$scope.searchlocation = function () {
		if ($scope.busy !== true) {
			if ($scope.locale !== undefined) {
				$scope.message = "";
				$scope.busy = true;
				angular.element(document).find('#busyModal').modal('show');

				angular.element(document).find(".disable-buttons").addClass("disabled");

				var location = {
					location: $scope.locale
				}

				$http.post('/search', location).then(function (response) {
					$scope.businesses = response.data;
					$scope.busy = false;
					angular.element(document).find('#busyModal').modal('hide');

					angular.element(document).find(".disable-buttons").removeClass("disabled");
				}, function (err) {
					$scope.message = err.data;
					$scope.busy = false;
					angular.element(document).find('#busyModal').modal('hide');

					angular.element(document).find(".disable-buttons").removeClass("disabled");
				});
			}
		}
	}

	$scope.goingTo = function (businessID) {
		if ($scope.busy !== true) {
			$scope.message = "";
			$scope.busy = true;
			angular.element(document).find('#busyModal').modal('show');

			angular.element(document).find(".disable-buttons").addClass("disabled");

			var obj = {
				id: businessID
			}

			$http.post('/going', obj).then(function (res) {
					var isAuthenticated = res.data.authenticated;
					var isAlreadyGoing = res.data.alreadyGoing;

					if (isAuthenticated) {
						var found = $filter('filter')($scope.businesses, {
							id: businessID
						}, true);

						if (found.length) {
							if (isAlreadyGoing)
								found[0].goingTo--;
							else
								found[0].goingTo++;
						} else
							$scope.message = "Business was not found. Contact me with details on how you even got here?";

					} else {
						$scope.message = "User not logged in. Redirecting...";
						window.location.replace("/login");
					}

					$scope.busy = false;
					angular.element(document).find('#busyModal').modal('hide');
					angular.element(document).find(".disable-buttons").removeClass("disabled");
				},
				function (err) {
					$scope.message = err.data;
					$scope.busy = false;
					angular.element(document).find('#busyModal').modal('hide');
					angular.element(document).find(".disable-buttons").removeClass("disabled");
				});
		}
	}


	$scope.dismissAlert = function () {
		$scope.message = "";
	}
});
