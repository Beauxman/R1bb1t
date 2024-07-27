function redirect_home() {
	window.location.href = "./home";
}

$("#r_form").submit(function(){
	var r_email = document.getElementById("r_email").value
	var r_password = document.getElementById("r_password").value
	var r_name = document.getElementById("r_name").value
	var r_birthday = document.getElementById("r_birthday").value
	var r_handle = document.getElementById("r_handle").value
	var r_photo = document.getElementById("profile-pic").getAttribute("src")
	
	var s_email = r_email;
	
	const API_request = new XMLHttpRequest()
	API_request.open('POST', '/api/accounts')
	API_request.setRequestHeader('Content-Type', 'application/json')
	
	const request_content = JSON.stringify({
		email: r_email,
		password: r_password,
		name: r_name,
		birthday: r_birthday,
		handle: r_handle,
		photo: r_photo
	});
	
	API_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			alert('Registered.')
			request_session(s_email, redirect_home);
		}
		document.getElementById("r_form").reset();
	}
	API_request.send(request_content)
});

$("#l_form").submit(function(){
	var l_email = document.getElementById("l_email").value
	var l_password = document.getElementById("l_password").value
	var s_email = l_email;
	
	const API_request = new XMLHttpRequest()
	API_request.open('POST', '/api/accounts/authenticate')
	API_request.setRequestHeader('Content-Type', 'application/json')
	
	const request_content = JSON.stringify({email: l_email, password: l_password});
	
	API_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {			
			request_session(s_email, redirect_home);
		} else if (this.readyState == 4 && this.status == 401) {
			alert('Invalid login information.')
		}
		document.getElementById("l_form").reset();
	}
	API_request.send(request_content);
});

$("#handle-check").click(function(){ 
	let t_handle = document.getElementById("r_handle").value
	
	if (t_handle == "") return;
	const API_request = new XMLHttpRequest()
	API_request.open('POST', '/api/accounts/namecheck')
	API_request.setRequestHeader('Content-Type', 'application/json')

	const request_content = JSON.stringify({handle: t_handle});
	
	API_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {			
			handleCheckPos();
		} else if (this.readyState == 4 && this.status == 401) {
			handleCheckNeg();
		}
	}
	API_request.send(request_content);
});

document.getElementById('r_file_submit').addEventListener('click', async (event) => {
	event.preventDefault();
	
	const form = document.getElementById('avatar-form');
	const formData = new FormData(form);

	try {
		const response = await fetch('/files', {
			method: 'POST',
			body: formData
		});

		if (response) {
			const data = await response.json();
			const imageUrl = data.url;
			const uploadedImage = document.getElementById('profile-pic');
			uploadedImage.src = imageUrl;
			console.log(imageUrl);
		} else {
			alert('Failed to upload image.');
		}
	} catch (error) {
		alert('Upload error. No file chosen or file is too large.');
	}
});