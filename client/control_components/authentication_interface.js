function request_session(session_email) {
	const API_request2 = new XMLHttpRequest()
	API_request2.open('POST', '/login')
	API_request2.setRequestHeader('Content-Type', 'application/json')
	
	const request_content2 = JSON.stringify({email: session_email});
	
	API_request2.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			return true
		} else {
			return false
		}
	}
	
	API_request2.send(request_content2)
}

$("#r_form").submit(function(){
	var r_email = document.getElementById("r_email").value
	var r_password = document.getElementById("r_password").value
	
	const API_request = new XMLHttpRequest()
	API_request.open('POST', 'http://localhost:3000/api/accounts')
	API_request.setRequestHeader('Content-Type', 'application/json')
	
	const request_content = JSON.stringify({email: r_email, password: r_password});
	
	API_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			alert('Registered.')
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
	API_request.open('POST', 'http://localhost:3000/api/accounts/authenticate')
	API_request.setRequestHeader('Content-Type', 'application/json')
	
	const request_content = JSON.stringify({email: l_email, password: l_password});
	
	API_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
				
			console.log(request_session(s_email))
			//
			alert('Authenticated.')
		} else if (this.readyState == 4 && this.status == 401) {
			alert('Invalid login information.')
		}
		document.getElementById("l_form").reset();
	}
	API_request.send(request_content);
});