var postHasFile = false;

document.getElementById('p_file').addEventListener('change', function(event) {
    var file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			document.getElementById('p_display_container').innerHTML = '<img src="' + e.target.result + '" id="p_display" style="margin-top: 20px; margin-left: 10%; display: block; width: 80%; border-radius: 5%;">';
			postHasFile = true;
		};
		reader.readAsDataURL(file);
	}
});

document.getElementById('p_form').addEventListener('submit', async (event) => {
	event.preventDefault();
	
	const form = document.getElementById('p_form');
	const formData = new FormData(form);

	try {
		const response = await fetch('/files', {
			method: 'POST',
			body: formData
		});

		if (response) {
			const data = await response.json();
			const imageURL = data.url;
			
			var s_content = document.getElementById("make-post-content").value
			makePost(s_content, retrieve_posts("post-feed"), imageURL);
			document.getElementById('p_display_container').innerHTML = "";
			document.getElementById("p_form").reset();
			postHasFile = false;
		} else {
			alert('Failed to upload image.');
		}
	} catch (error) {
		//alert('Upload error. No file chosen or file is too large.');
	}
});

function addPostViewFileListener(postID) {
	document.getElementById('p_file2').addEventListener('change', function(event) {
		var file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function(e) {
				document.getElementById('p_display_container2').innerHTML = '<img src="' + e.target.result + '" id="p_display2" style="margin-top: 20px; margin-left: 10%; display: block; width: 80%; border-radius: 5%;">';
				postHasFile = true;
			};
			reader.readAsDataURL(file);
		}
	});

	document.getElementById('p_form2').addEventListener('submit', async (event) => {
		event.preventDefault();
		
		const form = document.getElementById('p_form2');
		const formData = new FormData(form);

		try {
			const response = await fetch('/files', {
				method: 'POST',
				body: formData
			});

			if (response) {
				const data = await response.json();
				const imageURL = data.url;
				var s_content = document.getElementById("make-post-content2").value
				makePost(s_content, retrieve_posts("post-view-comments", postID), imageURL, postID);
				document.getElementById('p_display_container2').innerHTML = "";
				document.getElementById("p_form2").reset();
				postHasFile = false;
			} else {
				alert('Failed to upload image.');
			}
		} catch (error) {
			//alert('Upload error. No file chosen or file is too large.');
		}
	});
}