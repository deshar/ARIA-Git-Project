

$(document).ready(function(){
	loadScript();
		// enable button click
	$('#go').click(function(){
			// test geo location
		if (navigator && navigator.geolocation){
			navigator.geolocation.getCurrentPosition(geo_success, geo_error);
		} else {
			error('Geolocation not supported.');
		}
	});
});

function initmap() {
	var myOptions = {	
		center: new google.maps.LatLng(53.348867, -6.243162),
		zoom: 6,
		mapTypeId: google.maps.MapTypeId.ROADMAP
		};
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
}

function loadScript() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyD5E9Ye-fS53sT-nDswlma6P0ZRu7t-oNc&sensor=false&callback=initmap";
	document.body.appendChild(script);
}
				
function geo_error(err){
	if (err.code == 1){
		error('The user denied the request for location information')
	} else if (err.code == 2){
		error('Your location information is unavailable')
	} else if (err.code == 3){
		error('The location request timed out')
	} else {
		error('An unknown error occurred')
	}
}

function error(msg){
	alert(msg);
}

function geo_success(position){
	printAddress(position.coords.latitude, position.coords.longitude);
}

function printAddress(latitude, longitude){
	var geocoder = new google.maps.Geocoder();
	var yourLocation = new google.maps.LatLng(latitude, longitude);
	geocoder.geocode({'latLng': yourLocation}, function (results, status){
		if (status == google.maps.GeocoderStatus.OK){
			if (results[0]){
				$('#local').html('Your Address:<br/>' +
					results[0].formatted_address);

					var newOptions = {
						center: new google.maps.LatLng(latitude, longitude),
						zoom: 16,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};

					map = new google.maps.Map(document.getElementById("map"), newOptions);

					var marker = new google.maps.Marker({
						position: yourLocation,
						title: "Hello World!"
					});

					marker.setMap(map);

			} else {
				error('Google did not return any results.');
			}
		} else {
			error("Reverse Geocoding failed due to: " + status);
		}
	});
}
