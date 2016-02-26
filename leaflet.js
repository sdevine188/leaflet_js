var states = states_json()
var states2 = states_json2()

$(document).ready(function(){

	// var map = L.map('map').setView([51.505, -0.09], 13)

	// var mapbox_token = "pk.eyJ1Ijoic2RldmluZTE4OCIsImEiOiJjaWwyajdnbjEzY3hydW1rc3N4bG53ZmFsIn0.hEUxop8-gAN5kBUeVgk5hw"

	// // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
	// // 	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	// // 	maxZoom: 18,
	// // 	id: 'mapbox.light'
	// // }).addTo(map);

	// L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	// 	{
	// 	attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
	// 	maxZoom: 17,
	// 	minZoom: 9
	// 	}).addTo(map)

	// var marker = L.marker([51.5, -0.09]).addTo(map)

	// var circle = L.circle([51.508, -0.11], 500, {
	// 	color: 'red',
	// 	fillColor: '#f03',
	// 	fillOpacity: 0.5
	// }).addTo(map);

	// var polygon = L.polygon([
	// 	[51.509, -0.08],
	// 	[51.503, -0.06],
	// 	[51.51, -0.047]
	// ]).addTo(map);

	// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	// circle.bindPopup("I am a circle.");
	// polygon.bindPopup("I am a polygon.");

	// var popup = L.popup()
	// 	.setLatLng([51.5, -0.09])
	// 	.setContent("I am a standalone popup.")
	// 	.openOn(map);

	// var popup = L.popup();

	// function onMapClick(e) {
	// 	popup
	// 		.setLatLng(e.latlng)
	// 		.setContent("You clicked the map at " + e.latlng.toString())
	// 		.openOn(map);
	// }

	// map.on('click', onMapClick);

	// create us states overlay
	//http://leafletjs.com/examples/choropleth.html
	var states = states_json2()
	console.log(states)

	var map = L.map('map').setView([37.8, -96], 4)
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
		attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
		// maxZoom: 17,
		// minZoom: 9
		}).addTo(map)
	L.geoJson(states).addTo(map);

	// make choropleth of state overlays
	function getColor(d) {
	    	return d > 1000 ? '#800026' :
	           d > 500  ? '#BD0026' :
	           d > 200  ? '#E31A1C' :
	           d > 100  ? '#FC4E2A' :
	           d > 50   ? '#FD8D3C' :
	           d > 20   ? '#FEB24C' :
	           d > 10   ? '#FED976' :
	                      '#FFEDA0';
	}

	function style(feature) {
		return {
			fillColor: getColor(Number(feature.properties.density)),
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7
		};
	}

	L.geoJson(states, {style: style}).addTo(map)

	// highlight on mouseover
	var geojson

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties)
	}

	function resetHighlight(e) {
		geojson.resetStyle(e.target)
		info.update()
	}

	function zoomToFeature(e) {
    		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		})
	}

	geojson = L.geoJson(states, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map)

	// create custom control box when hovering over state
	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
	    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
	        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
	        : 'Hover over a state');
	};

	info.addTo(map);

	// create legend
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend'),
	        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
	        labels = [];

	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
	            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	        console.log(div.innerHTML)
	    }

	    return div;
	};

	legend.addTo(map);

})

