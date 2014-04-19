function init() {
	s = new sigma({
		container: 'container'
	});
	sigma.utils.pkg('sigma.parsers');

	var data = null;
	var request = $.ajax({
		type: "POST",
		url: "faculty2.php",
		data: { displayConnections: true},
		dataType: 'json',
		async: false,
		success: function(result){
			data = result;
		}
	});

	console.log(data);

	if (s instanceof sigma) {
		s.graph.clear();
		var m = JSON.parse(data);
		s.graph.read(m);
	}
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', init, false);
} else {
	window.onload = init;
}