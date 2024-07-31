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
	session_request.open('GET', '/sessions')
	session_request.setRequestHeader('Content-Type', 'application/json')
		
	session_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if (this.response != 'Invalid session') {
				on_success(this.response);
			}
		} else {
			return;
		}
	}
	session_request.send(null)
}

function end_session(on_success) {
	const session_request = new XMLHttpRequest()
	session_request.open('GET', '/logout')
	session_request.setRequestHeader('Content-Type', 'application/json')
	
	session_request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			on_success();
		}
	}
	session_request.send(null)
}