$("#p_form").submit(function(){
	var s_content = document.getElementById("make-post-content").value
	
	access_session(function (response) {
		var s_email = response;
		console.log(response);
		
		const API_request = new XMLHttpRequest()
		API_request.open('POST', '/api/posts')
		API_request.setRequestHeader('Content-Type', 'application/json')
		
		const request_content = JSON.stringify({email: s_email, content: s_content})

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				alert('posted')
			}
			document.getElementById("p_form").reset();
		}
		API_request.send(request_content)
	});
});