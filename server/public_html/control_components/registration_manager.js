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
	
	console.log(checked_handle);
	if ($('#r_handle').val != checked_handle) {
		$('#handle-check-note').html('');
		console.log(checked_handle);
		
		$("#register-next-2").attr("disabled","disabled");
		$("#register-next-2").css('background-color', 'gray');
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
	
	$("#back-menu").hide();
	
	$("#register-next-2").attr("disabled","disabled");
	$("#register-next-2").css('background-color', 'gray');
	
	current_menu = 1;
}

function registerMenu2() {
	$("#register-page-1").hide();
	$("#register-page-2").show();
	$("#register-page-3").hide();
	
	$("#back-menu").show();
	current_menu = 2;
}

function registerMenu3() {
	$("#register-page-1").hide();
	$("#register-page-2").hide();
	$("#register-page-3").show();
	
	$("#back-menu").show();

	current_menu = 3;
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

$("#back-menu").click(function(){
	if (current_menu == 2) {
		registerMenu1();
	} else if (current_menu == 3) {
		registerMenu2();
	}
});

$("#login-btn").click(function(){
	$(".gray-background").show();
	$(".register-form").hide();
	$(".login-form").show();
	
	$("#back-menu").hide();
});

$("#exit-menu").click(function(){
	$(".gray-background").hide();
	current_menu = 0;
	
});

$('#r_password, #r_password2').on('keyup', function () {
  if ($('#r_password').val() == $('#r_password2').val()) {
	$('#password_err').html('');
  } else 
	$('#password_err').html('Passwords do not match');
});

function registerManagerMain() {
	checkFormInputs();
}

registerManagerMain()