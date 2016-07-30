$("#loginButton").click(function () {
	$('#loginModal').modal('show');
});

$("#signupButton").click(function () {
	$('#signupModal').modal('show');
});

$('#authModal').on('show.bs.modal', function (event) {
	var button = $(event.relatedTarget) // Button that triggered the modal
	var recipient = button.data('action');

	var modal = $(this);
	if (recipient === "login") {
		modal.find('.modal-title').text('Login');
		modal.find('#authForm').attr('action', "/login");
	} else { //signup
		modal.find('.modal-title').text('Signup');
		modal.find('#authForm').attr('action', "/signup");
	}
});
