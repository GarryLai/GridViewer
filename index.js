var svg = d3.select("svg");
const g = svg.append("g");

const county_map_url = './COUNTY_MOI_1090820.json';
const town_map_url = './TOWN_MOI_1120317.json';

const temp_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0038-003.json';
const rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-004.json';
const qpesums_rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-B0045-001.json';
const qpesums_radar_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-A0059-001.json';

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

function data_proc(data, nan_value, fix=0, offset=0) {
	data_out = [];
	
	parameter = data['cwbopendata']['dataset']['datasetInfo']['parameterSet']['parameter'];
	
	lon0_lat0 = parameter[0+offset]['parameterValue'].split(',');
	lon0 = parseFloat(lon0_lat0[0]);
	lat0 = parseFloat(lon0_lat0[1]);
	
	dx = parseFloat(parameter[1+offset]['parameterValue']);
	
	valid_time = parameter[2+offset]['parameterValue'];
	
	nx_ny = parameter[3+offset]['parameterValue'].split('*');
	nx = parseInt(nx_ny[0], 10)+fix;
	ny = parseInt(nx_ny[1], 10);
	
	unit = parameter[4+offset]['parameterValue'].replace('攝氏', '℃');
	
	data_content = data['cwbopendata']['dataset']['contents']['content'].split(',');
	x = 0;
	y = 0;
	data_content.forEach(function(value){
		lon = lon0 + (x * dx) - 0.01; //HACK: TWD64 to TWD97
		lat = lat0 + (y * dx) + 0.02; //HACK: TWD64 to TWD97
		cx_cy = projection([lon, lat]);
		
		if (parseFloat(value) > nan_value) {
			data_out.push({
				'cx': cx_cy[0],
				'cy': cx_cy[1],
				'lon': lon.toFixed(2),
				'lat': lat.toFixed(2),
				'data': parseFloat(value),
				'size': dx*200,
				'unit': unit,
			});
		}
		
		x++;
		if (x >= nx) {
			x = 0;
			y++;
		}
	});
	
	document.getElementById("info").innerHTML = "<b>" + valid_time + '</b>';
	return data_out;
}

function cmap(cmap, value) {
	for (const [key, color] of Object.entries(cmap)) {
		if (value < parseFloat(key)) {
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
}

async function draw() {
	document.body.style.cursor = 'wait'
	
	option = document.getElementById("product").value
	
	//Temp Data
	if (option == '雨量GT') {
		[rawdata] = await Promise.all([d3.json(rain_url)]);
		data = data_proc(rawdata, -1, -1);
		cb = raincb;
	} else if (option == '溫度GT') {
		[rawdata] = await Promise.all([d3.json(temp_url)]);
		data = data_proc(rawdata, -999, -1);
		cb = tempcb;
	} else if (option == 'QPESUMS雨量') {
		[rawdata] = await Promise.all([d3.json(qpesums_rain_url)]);
		data = data_proc(rawdata, -1);
		cb = raincb;
	} else if (option == 'QPESUMS回波') {
		[rawdata] = await Promise.all([d3.json(qpesums_radar_url)]);
		data = data_proc(rawdata, -99, 0, 1);
		cb = radarcb;
	}
	
	d3.selectAll("rect").remove();
	
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
		.attr('width', function(d) {return d['size']})
		.attr('height', function(d) {return d['size']+1})
		.style('fill', function(d) {return cmap(cb, d['data'])})
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
	document.body.style.cursor = 'default'
}

draw_map();
draw();