// var states = states_json2()
// states[0].features[0].properties.density
var counties = counties_json2()
var criteria = ["Unemployment", "Per capita income"]


$(document).ready(function(){

	// var states = states_json2()
	console.log(criteria)

	var map = L.map('map').setView([37.8, -96], 4)
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
		attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
		// maxZoom: 17,
		// minZoom: 9
		}).addTo(map)
	L.geoJson(counties).addTo(map);

	// make dropdown menu to select distress criteria
	// function buildStateSelect() {
	// 	// var criteria = ["Unemployment", "Per capita income"]
	// 	_.each(criteria, function(criteria_string) { 
	// 		$(".criteria").append($("<option value='" + criteria_string "'>" + criteria_string + "</option>"))
	// 	})
	// }

	// buildStateSelect()

	// make choropleth of state overlays
	function getColor(d) {
		return d > 0 ? "#ff3300" :
			"#0000ff";
	    	// return d > 1000 ? '#800026' :
	     //       d > 500  ? '#BD0026' :
	     //       d > 200  ? '#E31A1C' :
	     //       d > 100  ? '#FC4E2A' :
	     //       d > 50   ? '#FD8D3C' :
	     //       d > 20   ? '#FEB24C' :
	     //       d > 10   ? '#FED976' :
	     //                  '#FFEDA0';
	}

	function style(feature) {
		return {
			fillColor: getColor(Number(feature.properties.unemp_distress)),
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7
		};
	}

	L.geoJson(counties, {style: style}).addTo(map)

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

	geojson = L.geoJson(counties, {
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
	    this._div.innerHTML = '<h4>County Economic Indicators</h4>' +  (props ?
	        '<b>' + props.NAME + '</b><br />' + "County per capita income: " + props.pc_inc + "</b><br />" +
	        "National per capita income: " + props.pc_inc_nat + "</b><br />" + "Per capita income distressed: " +
	        props.pc_inc_distress + "</b><br />" + "County unemployment rate: " + props.unemp_rate + "</b><br />" +
	        "National unemployment rate: " + props.unemp_rate_nat + "</b><br />" + "Unemployment distressed: " + 
	        props.unemp_distress : 'Hover over a state');
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

