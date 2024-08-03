let clicked_profile = false;
let clicked_like = false;
let clicked_follow = false;
let pages = [];

function pushPageStack(pageType, ID) {
	if (pages.length > 0) {
		let currentPage = pages[pages.length - 1];
		if (currentPage[0] != pageType || currentPage[1] != ID) {
			pages.push([pageType, ID]);
		}
	} else {
		pages.push([pageType, ID]);
		document.getElementById("post-feed").innerHTML = "";
	}
}

function showProfilePage(userID) {
	retrieve_profile(userID);
	let profileID = document.getElementById('my-post-profile').getAttribute('data-user-id');
	$('#post-container').hide();
	$('#profile-container').show();
	
	if (Number(profileID) == Number(userID)) {
		$('#profile-follow-button').hide();
	} else {
		$('#profile-follow-button').show();
		$('#profile-follow-button').click(function() {
			if (!clicked_follow) {
				clicked_follow = true;
				if ($('#profile-follow-button').hasClass("follow-option-true")) {
					removeFollower(userID, function() {
						$('#profile-follow-button').removeClass("follow-option-true");
						$('#profile-follow-button').text('Follow');
						
						$('#profile-followers').text(
							Number($('#profile-followers').text()) - 1
						)
					})
				} else {
					addFollower(userID, function() {
						$('#profile-follow-button').addClass("follow-option-true");
						$('#profile-follow-button').text('Following');
						
						$('#profile-followers').text(
							Number($('#profile-followers').text()) + 1
						)
					})
				}
			}
			setTimeout(() => {
				clicked_follow = false;
			}, "200");
		})
	}
	$("#my-posts").click(function() {
		$("#my-posts").addClass('profile-thread-selected');
		$("#my-replies").removeClass('profile-thread-selected');
		$("#my-media").removeClass('profile-thread-selected');
	});
	
	$("#my-replies").click(function() {
		$("#my-posts").removeClass('profile-thread-selected');
		$("#my-replies").addClass('profile-thread-selected');
		$("#my-media").removeClass('profile-thread-selected');
	});
	
	$("#my-media").click(function() {
		$("#my-posts").removeClass('profile-thread-selected');
		$("#my-replies").removeClass('profile-thread-selected');
		$("#my-media").addClass('profile-thread-selected');
	});
}

function closeProfilePage() {
	$('#post-container').show();
	$('#profile-container').hide();
	document.getElementById("profile-title").innerHTML = "";
	document.getElementById("profile-title2").innerHTML = "";
	document.getElementById("profile-avatar").src = "";
	document.getElementById("profile-handle").innerHTML = "@";
	document.getElementById("profile-created").innerHTML = "";
	document.getElementById("profile-post-feed").innerHTML = "";
	
	document.getElementById("profile-post-feed").innerHTML = "";
	$('#profile-follow-button').unbind('click');
	$('#profile-follow-button').removeClass("follow-option-true");
	$('#profile-follow-button').text('Follow');
}

function showPostPage(postID) {
	$('#center-screen-1').hide();
	$('#center-screen-2').show();
	retrieve_focus_post("post-view-container", postID);
	closeProfilePage();
}

function closePostPage() {
	$('#center-screen-1').show();
	$('#center-screen-2').hide();
	
	document.getElementById("post-view-container").innerHTML = "";
}

function popPageStack() {
	let currentPage = pages[pages.length - 1];
	if (currentPage[0] == "post") {
		closePostPage();
	} else if (currentPage[0] == "profile") {
		closeProfilePage();
	}
	
	if (pages.length > 1) {
		let lastPage = pages[pages.length - 2];
		if (lastPage[0] == "post") {
			showPostPage(lastPage[1]);
		} else if (lastPage[0] == "profile") {
			showProfilePage(lastPage[1]);
		}
	} else {
		retrieve_posts("post-feed");
	}
	pages.pop();
}

function makeTrendingInteractive(postIDs) {
	for (let i = 0; i < postIDs.length; i++) {
		function postViewer() {
			showPostPage(postIDs[i]);
			pushPageStack("post", postIDs[i])
		}
		
		$('[data-post-id="' + postIDs[i] + '"]').click(function() {
			if (!clicked_profile) {
				postViewer();
			}
		})
	}
}

function makePostsInteractive(postIDs) {
	for (let i = 0; i < postIDs.length; i++) {
		function postViewer() {
			showPostPage(postIDs[i]);
			pushPageStack("post", postIDs[i])
		}

		$('[data-post-id="' + postIDs[i] + '"]').click(function() {
			if (!clicked_profile) {
				postViewer();
			}
		})
		
		$('[data-comment-id="' + postIDs[i] + '"]').click(function() {
				postViewer();
		})
		
		$('[data-like-id="' + postIDs[i] + '"]').click(function() {
			if (!clicked_like) {
				clicked_like = true;
				if ($('[data-like-id="' + postIDs[i] + '"]').hasClass("post-option-true")) {
					removeLike(postIDs[i], function() {
						$('[data-like-id="' + postIDs[i] + '"]').removeClass("post-option-true");
						$('[data-like-id="' + postIDs[i] + '"]').css("color", "#000000");
						
						$('[data-like-id="' + postIDs[i] + '"]').find(".post-action-text").text(
							Number($('[data-like-id="' + postIDs[i] + '"]').find(".post-action-text").text()) - 1
						);
					});		
				} else {
					addLike(postIDs[i], function() {
						$('[data-like-id="' + postIDs[i] + '"]').addClass("post-option-true");
						$('[data-like-id="' + postIDs[i] + '"]').css("color", "#00e6b8");
						
						$('[data-like-id="' + postIDs[i] + '"]').find(".post-action-text").text(
							Number($('[data-like-id="' + postIDs[i] + '"]').find(".post-action-text").text()) + 1
						)
					})
				}
				setTimeout(() => {
					clicked_like = false;
				}, "200");
			}
		})
	}
	
	let profile_links = document.getElementsByClassName('post-profile');
	for (let i = 0; i < profile_links.length; i++) {
		let cur_profile = profile_links[i];
		let cur_link_id = cur_profile.getAttribute('data-user-id');
		cur_profile.addEventListener("click", function() {
			clicked_profile = true;
			showProfilePage(cur_link_id);
			pushPageStack("profile", cur_link_id)
			setTimeout(() => {
				clicked_profile = false;
			}, "200");
		})
		
	}
}

function makeFocusPostInteractive(postID) {
	$('[data-focus-like-id="' + postID + '"]').click(function() {
		if (!clicked_like) {
			clicked_like = true;		
			if ($('[data-focus-like-id="' + postID + '"]').hasClass("post-option-true")) {
				removeLike(postID, function() {
					$('[data-focus-like-id="' + postID + '"]').removeClass("post-option-true");
					$('[data-focus-like-id="' + postID + '"]').css("color", "#000000");
					
					$('[data-focus-like-id="' + postID + '"]').find(".post-action-text").text(
						Number($('[data-focus-like-id="' + postID + '"]').find(".post-action-text").text()) - 1
					);
				});		
			} else {
				addLike(postID, function() {
					$('[data-focus-like-id="' + postID + '"]').addClass("post-option-true");
					$('[data-focus-like-id="' + postID + '"]').css("color", "#00e6b8");
					
					$('[data-focus-like-id="' + postID + '"]').find(".post-action-text").text(
						Number($('[data-focus-like-id="' + postID + '"]').find(".post-action-text").text()) + 1
					)
				})
			}
			setTimeout(() => {
				clicked_like = false;
			}, "200");
		}
	})
}

$('#button-back-2').click(function() {
	popPageStack();
})

$('#button-back-profile').click(function() {
	popPageStack();
})

$('#home-btn').click(function() {
	closeProfilePage();
	closePostPage();
	pages = [];
	retrieve_posts("post-feed");
})

$('#big-post-btn').click(function() {
	closeProfilePage();
	closePostPage();
	pages = [];
	retrieve_posts("post-feed");
})

$('#profile-btn').click(function() {
	let profileID = document.getElementById('my-post-profile').getAttribute('data-user-id');
	clicked_profile = true;
	showProfilePage(profileID);
	pushPageStack("profile", profileID);
	setTimeout(() => {
		clicked_profile = false;
	}, "200");
})

$('#logout-btn').click(function() {
	end_session(function() {
		window.location.replace("/");
	})
})

var mobileMenuHidden = true;
$('#mobile-menu-btn').click(function() {
	if (mobileMenuHidden) $('.left-menu').show();
	else $('.left-menu').hide();
	mobileMenuHidden = !mobileMenuHidden;
})

$('#about-btn').click(function() {
	window.location.replace("/about");
})

$('#support-btn').click(function() {
	window.location.replace("/about#support");
})