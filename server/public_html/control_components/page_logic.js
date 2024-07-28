var back_stack = [];

function makePostsInteractive(postIDs) {
	for (let i = 0; i < postIDs.length; i++) {
		
		function postViewer() {
			$('#center-screen-1').hide();
			$('#center-screen-2').show();

			retrieve_focus_post("post-view-container", postIDs[i]);
			back_stack.push(postIDs[i]);	
		}

		$('[data-post-id="' + postIDs[i] + '"]').click(function() {
			if ($('#post-container').is(":visible"))
				postViewer();
		})
		
		$('[data-comment-id="' + postIDs[i] + '"]').click(function() {
			postViewer();
		})
		
		$('[data-like-id="' + postIDs[i] + '"]').click(function() {		
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
		})
	}
	
	let profile_links = document.getElementsByClassName('post-profile');
	for (let i = 0; i < profile_links.length; i++) {
		let cur_profile = profile_links[i];
		let cur_link_id = cur_profile.getAttribute('data-user-id');
		cur_profile.addEventListener("click", function() {
			console.log(cur_link_id)
			$('#post-container').hide()
			$('#profile-container').show()
		})
		
	}
}



function makeFocusPostInteractive(postID) {
	$('[data-focus-like-id="' + postID + '"]').click(function() {		
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
	})
}

$('#button-back-2').click(function() {
	if (back_stack.length <= 1) {
		$('#center-screen-1').show();
		$('#center-screen-2').hide();
		
		document.getElementById("post-view-container").innerHTML = "";
		back_stack = [];
	} else {
		var lastInStack = back_stack[back_stack.length - 2];
		retrieve_focus_post("post-view-container", lastInStack);
		back_stack.pop();
	}
})

$('#button-back-profile').click(function() {
	$('#post-container').show();
	$('#profile-container').hide();
})