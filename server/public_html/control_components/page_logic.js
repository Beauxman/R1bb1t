var back_stack = [];

function makePostsInteractive(postIDs) {
	for (let i = 0; i < postIDs.length; i++) {
		$('[data-post-id="' + postIDs[i] + '"]').click(function() {
			$('#center-screen-1').hide();
			$('#center-screen-2').show();

			retrieve_focus_post("post-view-container", postIDs[i]);
			back_stack.push(postIDs[i]);
		})
	}
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