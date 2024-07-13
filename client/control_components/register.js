$("#r_form").submit(function(){
	var r_email = document.getElementById("r_email").value
	var r_password = document.getElementById("r_password").value
	
	const API_request = new XMLHttpRequest()
	API_request.open('POST', 'http://localhost:3000/api/accounts')
	API_request.setRequestHeader('Content-Type', 'application/json')
	
	const request_content = JSON.stringify({email: r_email, password: r_password});
	
	API_request.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			alert('registered')
		}
	}
	
	API_request.send(request_content)
});