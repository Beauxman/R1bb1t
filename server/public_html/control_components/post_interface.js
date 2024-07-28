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
				document.getElementById("my-post-profile").setAttribute('data-user-id', response_content[0].UserID)
			}
		}
		API_request.send(request_content)
	});
}

function retrieve_posts(insertionElementID, parentPostID) {
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/api/posts?currentuseremail=' + s_email + '&parentpostid=' + parentPostID)
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
					
					if (response_content[i].UserHasLiked == 1) var likeClass = "post-option-true";
					else var likeClass = "";	
					if (response_content[i].UserHasCommented == 1) var commentClass = "post-option-true";
					else var commentClass = "";
					
					insertionElement.innerHTML += 
						`
						<div class="post">
							<div data-post-id="${response_content[i].PostID}">
								<div class="post-profile" style="width: fit-content;" data-user-id="${response_content[i].UserID}">
									<img src="${response_content[i].ImageURL}">
									<b>${response_content[i].Name}</b>
									<p>@${response_content[i].Handle} - ${response_content[i].Created}</p>
								</div>
								<div class="post-body">
									<p>${response_content[i].Content}</p>
								</div>
							</div>
							<div class="post-actions">
								<button type="button" class="btn left-btn ${commentClass}"  data-comment-id="${response_content[i].PostID}"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[i].Comments}</span></button>
								<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[i].Reposts}</span></button>
								<button type="button" class="btn left-btn ${likeClass}" data-like-id="${response_content[i].PostID}"><span class="glyphicon glyphicon-heart"></span><span class="post-action-text">${response_content[i].Likes}</span></button>
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
		API_request.open('GET', '/api/posts?currentuseremail=' + s_email + '&postid=' + postID)
		API_request.setRequestHeader('Content-Type', 'application/json')

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				const insertionElement = document.getElementById(insertionElementID);
				insertionElement.innerHTML = "";
				response_content[0].Created = timeOffset(response_content[0].Created);
	
				if (response_content[0].UserHasLiked == 1) var likeClass = "post-option-true";
				else var likeClass = "";			
				if (response_content[0].UserHasCommented == 1) var commentClass = "post-option-true";
				else var commentClass = "";	
	
				insertionElement.innerHTML = 
					`
					<div class="post-focus" data-post-id="${response_content[0].PostID}">
						<div class="post-profile" data-user-id="${response_content[0].UserID}">
							<img src="${response_content[0].ImageURL}">
							<b>${response_content[0].Name}</b>
							<p>@${response_content[0].Handle} - ${response_content[0].Created}</p>
						</div>
						<div class="post-body">
							<p style="font-size: 18px;">${response_content[0].Content}</p>
						</div>
						<div class="post-actions">
								<button type="button" class="btn left-btn ${commentClass}"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[0].Comments}</span></button>
								<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[0].Reposts}</span></button>
								<button type="button" class="btn left-btn ${likeClass}" data-focus-like-id="${response_content[0].PostID}"><span class="glyphicon glyphicon-heart"></span><span class="post-action-text">${response_content[0].Likes}</span></button>
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
				makeFocusPostInteractive(response_content[0].PostID);
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

function addLike(PostID, on_success) {
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('POST', '/api/posts/likes')
		API_request.setRequestHeader('Content-Type', 'application/json')
		
		const request_content = JSON.stringify({email: s_email, postid: PostID})

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(request_content)
	})
}

function removeLike(PostID, on_success) {
	access_session(function (response) {
		var s_email = response;
		
		const API_request = new XMLHttpRequest()
		API_request.open('DELETE', '/api/posts/likes?currentuseremail=' + s_email + '&postid=' + PostID)
		API_request.setRequestHeader('Content-Type', 'application/json')

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(null)
	})
}

function postMain() {
	$("#p_form").submit(function(){
		var s_content = document.getElementById("make-post-content").value
		makePost(s_content, retrieve_posts("post-feed"));
		document.getElementById("p_form").reset();
	});


	retrieve_user();
	retrieve_posts("post-feed");
}

postMain();