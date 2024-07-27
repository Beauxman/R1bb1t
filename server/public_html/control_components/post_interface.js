function timeOffset(time) {
	var offset = new Date().getTimezoneOffset();
	
	time = time.replace("T", " ");
	time = time.replace("Z", "");
	offset = offset / 60;
	time = moment(time).subtract(offset, 'hours');
	
	return time.fromNow();
}

function retrieve_user() {	
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('POST', '/api/accounts/retrieve')
		API_request.setRequestHeader('Content-Type', 'application/json')
		
		const request_content = JSON.stringify({email: s_email})

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
					document.getElementById("my-profile-icon-1").src = response_content[0].ImageURL;
					document.getElementById("my-profile-icon-2").src = response_content[0].ImageURL;
					document.getElementById("my-profile-name").innerHTML = response_content[0].Name;
					document.getElementById("my-profile-handle").innerHTML = "@" + response_content[0].Handle;
			}
		}
		API_request.send(request_content)
	});
}

function retrieve_posts(insertionElementID, parentPostID) {
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		if (parentPostID === undefined) API_request.open('GET', '/api/posts');
		else API_request.open('GET', '/api/posts?parentpostid=' + parentPostID)
		API_request.setRequestHeader('Content-Type', 'application/json')

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				const insertionElement = document.getElementById(insertionElementID);
				var postIDs = [];
				insertionElement.innerHTML = "";
				for (let i = response_content.length - 1; i >= 0; i--) { 
					response_content[i].Created = timeOffset(response_content[i].Created);
					postIDs.push(response_content[i].PostID);
					insertionElement.innerHTML += 
						`
						<div class="post" data-post-id="${response_content[i].PostID}" data-user-id="${response_content[i].UserID}">
							<div class="post-profile">
								<img src="${response_content[i].ImageURL}">
								<b>${response_content[i].Name}</b>
								<p>@${response_content[i].Handle} - ${response_content[i].Created}</p>
							</div>
							<div class="post-body">
								<p>${response_content[i].Content}</p>
							</div>
							<div class="post-actions">
								<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[i].Comments}</span></button>
								<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[i].Reposts}</span></button>
								<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-heart"></span><span class="post-action-text">${response_content[i].Likes}</span></button>
							</div>
						</div>
						`
				}
				makePostsInteractive(postIDs);
			}
		}
		API_request.send(null)
	});
}

function retrieve_focus_post(insertionElementID, postID) {	
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/api/posts?postid=' + postID)
		API_request.setRequestHeader('Content-Type', 'application/json')

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				const insertionElement = document.getElementById(insertionElementID);
				insertionElement.innerHTML = "";
				response_content[0].Created = timeOffset(response_content[0].Created);
				insertionElement.innerHTML = 
					`
					<div class="post-focus" data-post-id="${response_content[0].PostID}" data-user-id="${response_content[0].UserID}">
						<div class="post-profile">
							<img src="${response_content[0].ImageURL}">
							<b>${response_content[0].Name}</b>
							<p>@${response_content[0].Handle} - ${response_content[0].Created}</p>
						</div>
						<div class="post-body">
							<p style="font-size: 18px;">${response_content[0].Content}</p>
						</div>
						<div class="post-actions">
							<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[0].Comments}</span></button>
							<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[0].Reposts}</span></button>
							<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-heart"></span><span class="post-action-text">${response_content[0].Likes}</span></button>
						</div>
					</div>
					<div class="make-post">
						<form id="p_form2" onsubmit="return false">
							<textarea class="form-control" id="make-post-content2" placeholder="Post your reply" rows="3"></textarea>
							<div class="post-options">
								<button type="submit" class="btn make-post-btn">Post</button>
							</div>
						</form>
					</div>
					`
				$("#p_form2").submit(function(){
					var s_content = document.getElementById("make-post-content2").value
					makePost(s_content, retrieve_posts("post-view-comments", response_content[0].PostID), response_content[0].PostID);
					document.getElementById("p_form2").reset();
				});
				retrieve_posts("post-view-comments", response_content[0].PostID);
			}
		}
		API_request.send(null)
	});
}

function makePost(content, on_success, parentPostID) {
	if (content == "") return;
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('POST', '/api/posts')
		API_request.setRequestHeader('Content-Type', 'application/json')
		
		const request_content = JSON.stringify({email: s_email, content: content, parentpostid: parentPostID})

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(request_content)
	})
}

$("#p_form").submit(function(){
	var s_content = document.getElementById("make-post-content").value
	makePost(s_content, retrieve_posts("post-feed"));
	document.getElementById("p_form").reset();
});

retrieve_user();
retrieve_posts("post-feed");