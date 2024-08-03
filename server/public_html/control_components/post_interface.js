function timeOffset(time) {
	var offset = new Date().getTimezoneOffset();
	
	time = time.replace("T", " ");
	time = time.replace("Z", "");
	offset = offset / 60;
	time = moment(time).subtract(offset, 'hours');
	
	return time.fromNow();
}

function retrieve_posts(insertionElementID, parentPostID = "undefined", userID = "undefined") {
	access_session(function (response) {
		
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/posts?parentpostid=' + parentPostID + '&userid=' + userID);
		API_request.setRequestHeader('Content-Type', 'application/json');

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

					if (response_content[i].PostImage != null) var postImage = '<img src="' + response_content[i].PostImage + '" id="p_display" style="margin-bottom: 5px; margin-left: 10%; width: 80%; border-radius: 5%;">'
					else postImage = "";
					
					insertionElement.innerHTML += 
						`
						<div class="post">
							<div data-post-id="${response_content[i].PostID}">
								<div class="post-profile" style="width: fit-content;" data-user-id="${response_content[i].UserID}">
									<img src="${response_content[i].ImageURL}">
									<b>${response_content[i].Name}</b>
									<p><span class="handle-link">@${response_content[i].Handle}</span> - ${response_content[i].Created}</p>
								</div>
								<div class="post-body">
									<p>${response_content[i].Content}</p>
									${postImage}
								</div>
							</div>
							<div class="post-actions">
								<button type="button" class="btn left-btn ${commentClass}"  data-comment-id="${response_content[i].PostID}"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[i].Comments}</span></button>
								<!--<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[i].Reposts}</span></button>-->
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
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/posts?postid=' + postID)
		API_request.setRequestHeader('Content-Type', 'application/json');

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
				
				if (response_content[0].PostImage != null) var postImage = '<img src="' + response_content[0].PostImage + '" id="p_display" style="margin-bottom: 5px; margin-left: 10%; width: 80%; border-radius: 5%;">'
				else postImage = "";
	
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
							${postImage}
						</div>
						<div class="post-actions">
								<button type="button" class="btn left-btn ${commentClass}"><span class="glyphicon glyphicon-comment"></span><span class="post-action-text">${response_content[0].Comments}</span></button>
								<!--<button type="button" class="btn left-btn"><span class="glyphicon glyphicon-retweet"></span><span class="post-action-text">${response_content[0].Reposts}</span></button>-->
								<button type="button" class="btn left-btn ${likeClass}" data-focus-like-id="${response_content[0].PostID}"><span class="glyphicon glyphicon-heart"></span><span class="post-action-text">${response_content[0].Likes}</span></button>
						</div>
					</div>
					<div class="make-post" style="border-width: 0px; border-bottom-style: solid; border-bottom-width: 1px;">
						<form id="p_form2" onsubmit="return false" method="POST">
							<textarea class="form-control" id="make-post-content2" placeholder="Post your reply" rows="3"></textarea>
							<div id="p_display_container2"></div>
							<div class="post-options">
								<input class="form-control form-control-sm upload-file" id="p_file2" type="file" name="file" accept="image/*">
								<button type="submit" class="btn make-post-btn">Post</button>
							</div>
						</form>
					</div>
					`
				$("#p_form2").submit(function(){
					if (document.getElementById('p_display_container2').innerHTML.length <= 0) {
						var s_content = document.getElementById("make-post-content2").value
						makePost(s_content, null, response_content[0].PostID);
						document.getElementById("p_form2").reset();
					}
					setTimeout(() => {
						retrieve_posts("post-view-comments", response_content[0].PostID);
					}, "2000");
				});
				addPostViewFileListener(response_content[0].PostID);
				makeFocusPostInteractive(response_content[0].PostID);
				retrieve_posts("post-view-comments", response_content[0].PostID);
			}
		}
		API_request.send(null)
	});
}

function makePost(content, imageURL, parentPostID) {
	if (content == "" && imageURL == null) return;
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('POST', '/posts');
		API_request.setRequestHeader('Content-Type', 'application/json');
		
		const request_content = JSON.stringify({content: content, parentpostid: parentPostID, imageurl: imageURL});
		
		API_request.send(request_content)
	})
}

function addLike(PostID, on_success) {
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('POST', '/posts/likes');
		API_request.setRequestHeader('Content-Type', 'application/json');
		
		const request_content = JSON.stringify({postid: PostID});

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(request_content);
	})
}

function removeLike(PostID, on_success) {
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('DELETE', '/posts/likes?postid=' + PostID);
		API_request.setRequestHeader('Content-Type', 'application/json');

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(null);
	})
}

function addFollower(FollowingID, on_success) {
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('POST', '/accounts/followers');
		API_request.setRequestHeader('Content-Type', 'application/json');
		
		const request_content = JSON.stringify({followingid: FollowingID});

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(request_content);
	})
}

function removeFollower(FollowingID, on_success) {
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('DELETE', '/accounts/followers?followingid=' + FollowingID);
		API_request.setRequestHeader('Content-Type', 'application/json');

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				on_success();
			}
		}
		API_request.send(null);
	})
}


function retrieve_user() {	
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('POST', '/accounts/retrieve');
		API_request.setRequestHeader('Content-Type', 'application/json');

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				document.getElementById("my-profile-icon-1").src = response_content[0].ImageURL;
				document.getElementById("my-profile-icon-2").src = response_content[0].ImageURL;
				document.getElementById("my-profile-name").innerHTML = response_content[0].Name;
				document.getElementById("my-profile-handle").innerHTML = "@" + response_content[0].Handle;
				document.getElementById("my-post-profile").setAttribute('data-user-id', response_content[0].UserID);
			}
		}
		API_request.send(null);
	});
}

function retrieve_profile(userID) {	
	access_session(function (response) {
		const API_request = new XMLHttpRequest();
		API_request.open('POST', '/accounts/retrieve');
		API_request.setRequestHeader('Content-Type', 'application/json');
		
		const request_content = JSON.stringify({userid: userID});

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				
				let created = response_content[0].Created;
				created = moment(created).format("MMMM, YYYY");
				
				document.getElementById("profile-title").innerHTML = response_content[0].Name;
				document.getElementById("profile-title2").innerHTML = response_content[0].Name;
				document.getElementById("profile-avatar").src = response_content[0].ImageURL;
				document.getElementById("profile-handle").innerHTML = "@" + response_content[0].Handle;
				document.getElementById("profile-created").innerHTML = created;
				document.getElementById("profile").setAttribute('data-profile-id', response_content[0].UserID);
				
				document.getElementById("profile-following").innerHTML = response_content[0].FollowingCount;
				document.getElementById("profile-followers").innerHTML = response_content[0].FollowersCount;
				
				if (response_content[0].IsFollowing == 1) {
					$('#profile-follow-button').addClass("follow-option-true");
					$('#profile-follow-button').text('Following');
				} else {
					$('#profile-follow-button').removeClass("follow-option-true");
					$('#profile-follow-button').text('Follow');
				}					
				
				retrieve_posts("profile-post-feed", "undefined", userID);
			}
		}
		API_request.send(request_content);
	});
}

function retrieve_trending() {
	access_session(function (response) {
		
		const API_request = new XMLHttpRequest()
		API_request.open('GET', '/posts?trending=true');
		API_request.setRequestHeader('Content-Type', 'application/json');

		API_request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				const response_content = JSON.parse(this.response);
				const insertionElement = document.getElementById("trending-feed");
				var postIDs = [];
				insertionElement.innerHTML = "";
				for (let i = response_content.length - 1; i >= 0; i--) {
					postIDs.push(response_content[i].PostID);
					
					insertionElement.innerHTML += `
					<div class="post-trending" data-post-id="${response_content[i].PostID}">
						<b class="post-trending-title">Trending</b>
						<b style="font-size: 16px;">${response_content[i].Name}</b>
						<i class="gray-text" style="font-size: 12px;">${response_content[i].Content}</i>
						<span class="gray-text">${response_content[0].Likes} Likes</span>
					</div>
					`
				}
				makeTrendingInteractive(postIDs);
			}
		}
		API_request.send(null);
	})
}

function postMain() {
	$("#for-you-btn").click(function() {
		$("#for-you-btn").addClass('center-button-selected');
		$("#following-btn").removeClass('center-button-selected');
		retrieve_posts("post-feed");
	});
	
	$("#following-btn").click(function() {
		$("#for-you-btn").removeClass('center-button-selected');
		$("#following-btn").addClass('center-button-selected');
	});
	
	$("#p_form").submit(function(){
		if (document.getElementById('p_display_container').innerHTML.length <= 0) {
			var s_content = document.getElementById("make-post-content").value
			makePost(s_content);
			document.getElementById("p_form").reset();
		}
		setTimeout(() => {
				retrieve_posts("post-feed");
		}, "2000");
	});
	
	retrieve_user();
	retrieve_posts("post-feed");
	retrieve_trending();
}

postMain();