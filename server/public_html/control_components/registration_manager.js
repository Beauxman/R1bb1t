var current_menu = 0;
var checked_handle = "";

function checkFormInputs() {
	if(!$("#r_email").val() 
		|| !$("#r_name").val()
		|| !$("#r_birthday").val()) {
		
		$("#register-next-1").attr("disabled","disabled");
		$("#register-next-1").css('background-color', 'gray');
	} else {
		$("#register-next-1").removeAttr("disabled");
		$("#register-next-1").css('background-color', '#00ffcc');
	}
	//
	if ($('#r_handle').val() != checked_handle) {
		$('#handle-check-note').html('');
		$("#register-next-2").attr("disabled","disabled");
		$("#register-next-2").css('background-color', 'gray');
	}
	//
	var rgx = /[A-Z]/;
	var rgx2 = /[^0-9a-z-]/;
	if (rgx.test($('#r_handle').val())) {
		$('#handle-check-note').html('Must be lowercase.');
		$("#register-next-2").attr("disabled","disabled");
		$("#register-next-2").css('background-color', 'gray');
		
		$("#handle-check").attr("disabled","disabled");
	} else if (rgx2.test($('#r_handle').val())) {
		$('#handle-check-note').html('Contains invalid character.');
		$("#register-next-2").attr("disabled","disabled");
		$("#register-next-2").css('background-color', 'gray');
		
		$("#handle-check").attr("disabled","disabled");
	} else {
		$('#handle-check-note').html('');
		$("#handle-check").removeAttr("disabled");
	}

	if(!$("#r_password").val()
		|| !$("#r_password2").val()) {
		$("#r_submit").attr("disabled","disabled");
		$("#r_submit").css('background-color', 'gray');
	} else {
		$("#r_submit").removeAttr("disabled");
		$("#r_submit").css('background-color', '#00ffcc');
	}
}

function registerMenu1() {
	$(".gray-background").show();
	$(".login-form").hide();
	$(".register-form").show();
	
	$("#register-page-1").show();
	$("#register-page-2").hide();
	$("#register-page-3").hide();
	$("#register-page-4").hide();
	
	$("#avatar-form").hide();	
	$("#back-menu").hide();
	
	$("#register-next-2").attr("disabled","disabled");
	$("#register-next-2").css('background-color', 'gray');
	
	current_menu = 1;
}

function registerMenu2() {
	$("#register-page-1").hide();
	$("#register-page-2").show();
	$("#register-page-3").hide();
	$("#register-page-4").hide();
	
	$("#avatar-form").hide();
	$("#back-menu").show();
	current_menu = 2;
}

function registerMenu3() {
	$("#register-page-1").hide();
	$("#register-page-2").hide();
	$("#register-page-3").show();
	$("#register-page-4").hide();
	
	$("#avatar-form").show();
	$("#back-menu").show();
	
	current_menu = 3;
}

function registerMenu4() {
	$("#register-page-1").hide();
	$("#register-page-2").hide();
	$("#register-page-3").hide();
	$("#register-page-4").show();
	
	$("#avatar-form").hide();
	$("#back-menu").show();
	
	current_menu = 4;
}

function handleCheckPos() {
	$('#handle-check-note').html('Available');
	checked_handle = $('#r_handle').val();
	
	$("#register-next-2").removeAttr("disabled");
	$("#register-next-2").css('background-color', '#00ffcc');
}

function handleCheckNeg() {
	$('#handle-check-note').html('Not available');
	
	$("#register-next-2").attr("disabled","disabled");
	$("#register-next-2").css('background-color', 'gray');
}

$('#r_form input').blur(function() {
	checkFormInputs();
});


$("#register-btn").click(registerMenu1);
$("#register-next-1").click(registerMenu2);
$("#register-next-2").click(registerMenu3);
$("#register-next-3").click(registerMenu4);

$("#back-menu").click(function(){
	if (current_menu == 2) {
		registerMenu1();
	} else if (current_menu == 3) {
		registerMenu2();
	} else if (current_menu == 4) {
		registerMenu3();
	}
});

$("#login-btn").click(function(){
	$(".gray-background").show();
	$(".register-form").hide();
	$(".login-form").show();
	
	$("#back-menu").hide();
});

$("#exit-menu").click(function(){
	$("#avatar-form").hide();
	$(".gray-background").hide();
	current_menu = 0;
	
});

$("#r_file_submit").click(function(){
	$("#r_file_submit").attr("disabled","disabled");
	setTimeout(() => {
		$("#r_file_submit").removeAttr("disabled");
	}, "4000");
});

$('#r_password, #r_password2').on('keyup', function () {
  if ($('#r_password').val() == $('#r_password2').val()) {
	$('#password_err').html('');
  } else 
	$('#password_err').html('Passwords do not match');
});

$('#guest-login-btn').click(function() {
	guestLogin();
})

function registerManagerMain() {
	checkFormInputs();
	
	$(".gray-background").css("height", document.body.scrollHeight); 
	addEventListener('resize', (event) => {});
	function sizecheck() { $(".gray-background").css("height", document.body.scrollHeight) };
	onresize = (event) => {sizecheck()};
}

registerManagerMain()