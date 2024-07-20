function request_session(session_email, on_success) {
	const session_request = new XMLHttpRequest()
	session_request.open('POST', '/login')
	session_request.setRequestHeader('Content-Type', 'application/json')
	
	const session_content = JSON.stringify({email: session_email});
	
	session_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			on_success();
		}
	}
	
	session_request.send(session_content)
}

function access_session(on_success) {
	const session_request = new XMLHttpRequest()
	session_request.open('GET', '/session')
	session_request.setRequestHeader('Content-Type', 'application/json')
		
	session_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			on_success(this.response);
		}
	}
	
	session_request.send(null)
}