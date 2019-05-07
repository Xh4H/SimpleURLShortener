(() => {
	const isValidUrl = (string) => {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return !!pattern.test(string);
	}

	$(window).ready(function() {
		$("#shorten").click(function(event) {
			let url = $("#url").val();

			if (!isValidUrl(url)) return alert("Invalid URL.");
			if (!url.includes("http")) return alert("URL is missing protocol.");
			$.post("/newurl", {url: url}, function (data) {
				navigator.clipboard.writeText(window.location.hostname + "/shorten/" + data); // Copy to clipboard new url
				$("#success").css("display", "block");
			});
			event.preventDefault(); // Prevent refresh
		});
	});
})();
