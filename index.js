var svg = d3.select("svg");
const g = svg.append("g");

const county_map_url = './COUNTY_MOI_1090820.json';
const town_map_url = './TOWN_MOI_1120317.json';
const temp_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0038-003.json';
const rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-004.json';
//const qpesums_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-B0045-001.json';

svg.call(d3.zoom().on("zoom",() => {
	g.attr("transform", d3.event.transform);
}));

var projection = d3.geoMercator().center([121, 24.15]).scale(11000);
var pathGenerator = d3.geoPath().projection(projection);

var svg = d3.select("#rect").append("svg")

d3.select('body')
	.append('div')
	.attr('id', 'tooltip')
	.attr('style', 'position: absolute; opacity: 0;');

function print(...data) {
	console.log(data);
}

function data_proc(data, nan_value) {
	data_out = [];
	
	parameter = data['cwbopendata']['dataset']['datasetInfo']['parameterSet']['parameter'];
	
	lon0_lat0 = parameter[0]['parameterValue'].split(',');
	lon0 = parseFloat(lon0_lat0[0]);
	lat0 = parseFloat(lon0_lat0[1]);
	
	dx = parseFloat(parameter[1]['parameterValue']);
	
	valid_time = parameter[2]['parameterValue'];
	
	nx_ny = parameter[3]['parameterValue'].split('*');
	nx = parseInt(nx_ny[0], 10);
	ny = parseInt(nx_ny[1], 10);
	
	unit = parameter[4]['parameterValue'].replace('攝氏', '℃');
	
	data_content = data['cwbopendata']['dataset']['contents']['content'].split(',');
	x = 0;
	y = 0;
	data_content.forEach(function(value){
		lon = lon0 + (x * dx) - 0.01; //HACK: TWD64 to TWD97
		lat = lat0 + (y * dx) + 0.02; //HACK: TWD64 to TWD97
		cx_cy = projection([lon, lat]);
		
		if (parseInt(value, 10) != nan_value) {
			data_out.push({
				'cx': cx_cy[0],
				'cy': cx_cy[1],
				'lon': lon.toFixed(2),
				'lat': lat.toFixed(2),
				'data': parseFloat(value),
				'unit': unit,
			});
		}
		
		x++;
		if (x >= nx-1) {
			x = 0;
			y++;
		}
	});
	
	document.getElementById("info").innerHTML = "<b>" + valid_time + '</b>';
	return data_out;
}

function cmap(cmap, value) {
	for (const [key, color] of Object.entries(cmap)) {
		if (value < key) {
			return color;
		}
	}
}

async function draw_map() {
	[county_map_data, town_map_data] = await Promise.all([
		d3.json(county_map_url),
		d3.json(town_map_url),
	])
	
	//Town Map
	geometries = topojson.feature(town_map_data, town_map_data.objects["TOWN_MOI_1120317"])
	g.append("path1")
	paths1 = g.selectAll("path1").data(geometries.features);
	paths1.enter()
		.append("path")
		.attr("d", pathGenerator)
		.attr("class","town")
		.style('pointer-events', 'none')
		.on("click", function(d) {
			console.log(projection.invert(d3.mouse(this)));
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d.properties["COUNTYNAME"] + '_' + d.properties["TOWNNAME"] + '</div>')
		})
		
	//County Map
	geometries = topojson.feature(county_map_data, county_map_data.objects["COUNTY_MOI_1090820"])
	g.append("path2")
	paths2 = g.selectAll("path2").data(geometries.features);
	paths2.enter()
		.append("path")
		.attr("d", pathGenerator)
		.attr("class","county")
		.style('pointer-events', 'none')
		.on("click", function(d) {
			console.log(projection.invert(d3.mouse(this)));
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d.properties["COUNTYNAME"] + '_' + d.properties["TOWNNAME"] + '</div>')
		})
}

async function draw(option='溫度') {
	d3.selectAll("rect").remove();
	
	[temp_data, rain_data] = await Promise.all([
		d3.json(temp_url),
		d3.json(rain_url),
	])
	
	//Temp Data
	if (option == '雨量') {
		data = data_proc(rain_data, -1);
	} else if (option == '溫度') {
		data = data_proc(temp_data, -999);
	}
	
	g.selectAll("circle")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return d['cx'];
		})
		.attr("y", function(d) {
			return d['cy'];
		})
		.attr('width', 6)
		.attr('height', 6.5)
		.style('fill', function(d) {return cmap(tempcb, d['data'])})
		.on("mouseover", function(d) {
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['lon'] + ', ' + d['lat'] + '<br>' + d['data'] + ' ' + d['unit'] + '</div>')
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px')
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0)
		})
		.lower()
		.lower(); 
}

draw_map();
draw();