function timeOffset(time) {
	var offset = new Date().getTimezoneOffset();
	
	time = time.replace("T", " ");
	time = time.replace("Z", "");
	offset = offset / 60;
	time = moment(time).subtract(offset, 'hours');
	
	return time.fromNow();
}

function retrieve_posts() {	
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/api/posts')
		API_request.setRequestHeader('Content-Type', 'application/json')

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				//console.log(response_content[0]);
				const post_feed = document.getElementById("post-feed");
				post_feed.innerHTML = "";
				for (let i = response_content.length - 1; i >= 0; i--) { 
					response_content[i].created = timeOffset(response_content[i].created);
					post_feed.innerHTML += 
						`
						<div class="post">
							<div class="post-profile">
								<img src="profile.jpg">
								<b>${response_content[i].name}</b>
								<p>@${response_content[i].handle} - ${response_content[i].created}</p>
							</div>
							<div class="post-body">
								<p>${response_content[i].content}</p>
							</div>
						</div>
						`
				}
			}
		}
		API_request.send(null)
	});
}

$("#p_form").submit(function(){
	var s_content = document.getElementById("make-post-content").value
	
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('POST', '/api/posts')
		API_request.setRequestHeader('Content-Type', 'application/json')
		
		const request_content = JSON.stringify({email: s_email, content: s_content})

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				retrieve_posts();
			}
			document.getElementById("p_form").reset();
		}
		API_request.send(request_content)
	});
});

retrieve_posts();