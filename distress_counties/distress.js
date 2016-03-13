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
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			}
		}
		if(selected_criteria == "Per capita income"){
			return {
				fillColor: getColor(Number(feature.properties.pc_inc_distress)),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			}
		}
	}

	function style_polygons() {
		// L.geoJson(counties, {style: style}).addTo(map)
		
		// starts out working perfect for fill, highlighting and dehighlighting
		// this toggles to all green when criteria switched, though still outlined in white bc style function not called
		// but on mouseover, it highlights red/blue based on currently selected criteria
		// toggling criteria again though leaves it unchanged, still green, with correct criteria color change
		// on mouseover
		// on toggle, the fills reset to green, though the outlines of mousedover counties remains
		// geojson.setStyle({fillColor: '#66ff33'}) 
		
		// starts out perfect for fill, highlight and dehighlight
		// on toggle, it does not automatically change fills appropriately, but on mouseover it will
		// interestingly, on mouseover only it will change outline to green if pc_inc criteria selected
		// passing style to setStyle must not be working, and correct updates only come from mouseover
		// geojson.setStyle({style: style})

		// starts out perfect, 
		// on toggle, it changes instantly to green outline, so the if statements for criteria are working
		// but with the fillcolor option commented out, it naturally doesn't change fill color until mouseover
		// if(selected_criteria == "Unemployment"){
		// 	geojson.setStyle({
		// 		// fillColor: getColor(Number(feature.properties.unemp_distress)),
		// 		weight: 2,
		// 		opacity: 1,
		// 		color: 'white',
		// 		dashArray: '3',
		// 		fillOpacity: 0.7
		// 	})
		// }
		// if(selected_criteria == "Per capita income"){
		// 	geojson.setStyle({
		// 		// fillColor: getColor(Number(feature.properties.pc_inc_distress)),
		// 		weight: 2,
		// 		opacity: 1,
		// 		color: 'green',
		// 		dashArray: '3',
		// 		fillOpacity: 0.7
		// 	})
		// }	
	
		// another attempt
		geojson.eachLayer(function (layer) {
			if(selected_criteria == "Unemployment"){
				layer.setStyle({
					fillColor: getColor(Number(layer.feature.properties.unemp_distress)),
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				})
			}
			if(selected_criteria == "Per capita income"){
				layer.setStyle({
					fillColor: getColor(Number(layer.feature.properties.pc_inc_distress)),
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.7
				})
			}
		})	 

		// this works perfect at first
		// on toggling, it overlays colors to get purples, etc
		// does not actually update the style, just adds another overlay
		// above comments are for code without map.removelayer
		// with removelayer, it works, but slight delay
		// map.removeLayer(geojson)
		// geojson = L.geoJson(counties, {
		// 	style: style,
		// 	onEachFeature: onEachFeature
		// }).addTo(map)
	}

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
	        grades = [0, 1],
	        labels = ["Not distressed", "Distressed"];

	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML +=
	            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
	            labels[i] + (grades[i + 1] ? '<br>' : '+');
	        console.log(div.innerHTML)
	    }

	    return div;
	};

	legend.addTo(map);

})

