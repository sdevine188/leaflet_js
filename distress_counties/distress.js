// var states = states_json2()
// states[0].features[0].properties.density
var counties = counties_json2()
var criteria = ["Unemployment", "Per capita income"]
var selected_criteria = "Unemployment"

$(document).ready(function(){

	var map = L.map('map').setView([37.8, -96], 4)
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
		attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
		// maxZoom: 17,
		// minZoom: 9
		}).addTo(map)
	// L.geoJson(counties).addTo(map);

	// make dropdown menu to select distress criteria
	function build_criteria_select() {
		for ( i in criteria){
			criteria_string = criteria[i];	
			$(".criteria").append($("<option value='" + criteria_string + "'>" + criteria_string + "</option>"));
		}
	}

	build_criteria_select()

	// update map when criteria drop down is changed
	$('.criteria').on("change", function() {
  		selected_criteria = ($(this).val())
  		style_polygons()
	})

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
		if(selected_criteria == "Unemployment"){
			return {
				fillColor: getColor(Number(feature.properties.unemp_distress)),
				weight: 1,
				opacity: 1,
				color: 'white',
				fillOpacity: 0.7
			}
		}
		if(selected_criteria == "Per capita income"){
			return {
				fillColor: getColor(Number(feature.properties.pc_inc_distress)),
				weight: 1,
				opacity: 1,
				color: 'white',
				fillOpacity: 0.7
			}
		}
	}

	function style_polygons() {
		geojson.eachLayer(function (layer) {
			if(selected_criteria == "Unemployment"){
				layer.setStyle({
					fillColor: getColor(Number(layer.feature.properties.unemp_distress)),
					weight: 1,
					opacity: 1,
					color: 'white',
					fillOpacity: 0.7
				})
			}
			if(selected_criteria == "Per capita income"){
				layer.setStyle({
					fillColor: getColor(Number(layer.feature.properties.pc_inc_distress)),
					weight: 1,
					opacity: 1,
					color: 'white',
					fillOpacity: 0.7
				})
			}
		})	 
	}

	// highlight on mouseover
	var geojson

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 1,
			color: '#666',
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

	// function zoomToFeature(e) {
 //    		map.fitBounds(e.target.getBounds());
	// }

	var popup = L.popup();

	function onMapClick(e) {
		geojson.eachLayer(function (layer) {
			// layer.bindPopup(layer.feature.properties.county_state + "<br>" + "test")
			layer.bindPopup('<h3>' + layer.feature.properties.county_state + '</h3>' +
				"County per capita income: ".bold() + numeral(layer.feature.properties.pc_inc).format("$0,0") + "</b><br />" +
				"National per capita income: ".bold() + numeral(layer.feature.properties.pc_inc_nat).format("$0,0") + "</b><br />" + 
				"Per capita income distressed?: ".bold() +
				layer.feature.properties.pc_inc_distress.replace("0", "No").replace("1", "Yes") + "</b><br /><br />" + "County unemployment rate: ".bold() + 
				numeral(layer.feature.properties.unemp_rate).format("0.00") + "%" + "</b><br />" +
				"National unemployment rate: ".bold() + numeral(layer.feature.properties.unemp_rate_nat).format("0.00") + "%" + "</b><br />" + 
				"Unemployment distressed?: ".bold() + 
				layer.feature.properties.unemp_distress.replace("0", "No").replace("1", "Yes"))
		})
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			// click: zoomToFeature
			click: onMapClick
		})
	}

	geojson = L.geoJson(counties, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map)

	console.log(geojson)

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
			'<b>' + "<h3>" + props.county_state + "</h3>" + "County per capita income: ".bold() + 
			numeral(props.pc_inc).format("$0,0") + "</b><br />" +
			"National per capita income: ".bold() + numeral(props.pc_inc_nat).format("$0,0") + "</b><br />" + 
			"Per capita income distressed?: ".bold() +
			props.pc_inc_distress.replace("0", "No").replace("1", "Yes") + "</b><br /><br />" + "County unemployment rate: ".bold() + 
			numeral(props.unemp_rate).format("0.00") + "%" + "</b><br />" +
			"National unemployment rate: ".bold() + numeral(props.unemp_rate_nat).format("0.00") + "%" + 
			"</b><br />" + "Unemployment distressed?: ".bold() + 
			props.unemp_distress.replace("0", "No").replace("1", "Yes") : 'Hover over a county');
	};

	info.addTo(map);

	// create legend
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend'),
	        grades = [0, 1],
	        labels = ["Not distressed", "Distressed"];

	    // loop through our legend intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
	            labels[i] + (grades[i + 1] ? '<br>' : '');
	    }

	    return div;
	};

	legend.addTo(map);

})

