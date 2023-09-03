var svg = d3.select("svg");
const g = svg.append("g");

const county_map_url = './COUNTY_MOI_1090820.json';
const town_map_url = './TOWN_MOI_1120317.json';

const temp_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0038-003.json';
const rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-004.json';

const qpesums_rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-B0045-001.json';
const qpesums_radar_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-A0059-001.json';

const auto_sta_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0001-001.json';
const auto_rain_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0002-001.json';
const sta_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0003-001.json';

svg.call(d3.zoom().on("zoom",() => {
	g.attr("transform", d3.event.transform);
}));

var projection = d3.geoMercator().center([121, 24.15]).scale(11000);
var pathGenerator = d3.geoPath().projection(projection);

var svg = d3.select("#rect").append("svg");

d3.select('body')
	.append('div')
	.attr('id', 'tooltip')
	.attr('style', 'position: absolute; opacity: 0;');

function print(...data) {
	console.log(data);
}

function temp_data_proc(data, nan_value) {
	data_out = [];
	data = data['cwbopendata']['location'];
	data.forEach(function(sta){
		lon = parseFloat(sta['lon']);
		lat = parseFloat(sta['lat']);
		x_y = projection([lon, lat]);
		weather = sta['weatherElement'];
		
		data = weather[3]['elementValue']['value'];
		if (parseFloat(data) > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'lon': sta['lon'],
				'lat': sta['lat'],
				'name': sta['locationName'],
				'code': sta['stationId'],
				'elev': parseFloat(weather[0]['elementValue']['value']),
				'data': parseFloat(data),
			});
		}
	});
	return data_out
}

function rain_data_proc(data, nan_value) {
	data_out = [];
	data = data['cwbopendata']['location'];
	data.forEach(function(sta){
		lon = parseFloat(sta['lon']);
		lat = parseFloat(sta['lat']);
		x_y = projection([lon, lat]);
		weather = sta['weatherElement'];

		data = parseFloat(weather[7]['elementValue']['value'].replace(/-998.00/g, '0.00'));
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'lon': sta['lon'],
				'lat': sta['lat'],
				'name': sta['locationName'],
				'code': sta['stationId'],
				'elev': parseFloat(weather[0]['elementValue']['value']),
				'data': data,
			});
		}
	});
	return data_out
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
		x_y = projection([lon, lat]);
		
		if (parseFloat(value) > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
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
	
	d3.select('#info').html('<b>' + valid_time + '</b>');
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
	]);
	
	//Town Map
	geometries = topojson.feature(town_map_data, town_map_data.objects["TOWN_MOI_1120317"]);
	g.append("path1");
	paths1 = g.selectAll("path1").data(geometries.features);
	paths1.enter()
		.append("path")
		.attr("d", pathGenerator)
		.attr("class","town")
		.style('pointer-events', 'none')
		.on("mouseover", function(d) {
			lon_lat = projection.invert(d3.mouse(this));
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + lon_lat[0].toFixed(2) + ', ' + lon_lat[1].toFixed(2) + '<br>' + d.properties["COUNTYNAME"] + '_' + d.properties["TOWNNAME"] + '</div>');
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		});
		
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

function plot_grid_data(data) {
	g.selectAll("circle")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function(d) {return d['x']})
		.attr("y", function(d) {return d['y']})
		.attr('width', function(d) {return d['size']})
		.attr('height', function(d) {return d['size']+1})
		.style('fill', function(d) {return cmap(cb, d['data'])})
		.on("mouseover", function(d) {
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['lon'] + ', ' + d['lat'] + '<br>' + d['data'] + ' ' + d['unit'] + '</div>');
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		})
		.lower()
		.lower(); 
}

function plot_sta_data(data) {
	g.selectAll("text")
		.data(data)
		.enter()
		.append("svg:text")
		.attr("x", function(d) {return d['x']})
		.attr("y", function(d) {return d['y']})
		.text(function(d){return d['data']})
		.on("mouseover", function(d) {
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['lon'] + ', ' + d['lat'] + '<br>' + d['code'] + '_' + d['name'] + '<br>' + d['elev'] + ' m</div>');
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		})
		.attr("text-anchor","middle")
		.attr('font-size','3px')
		.style('pointer-events', 'none')
		.attr("class","sta")
		.raise()
		.raise()
		.raise();
}

async function plot_data() {
	d3.selectAll("select").attr('disabled', '1');
	d3.select('#info').html('<font color="red"><b>資料載入中，請稍後...<b></font>');
	
	option = d3.select('#product').property("value");
	
	if (option == '溫度GT') {
		[rawdata, stadata, autostadata] = await Promise.all([d3.json(temp_url), d3.json(sta_data_url), d3.json(auto_sta_data_url)]);
		data = data_proc(rawdata, -999, -1);
		sta_data = temp_data_proc(stadata, -99);
		auto_sta_data = temp_data_proc(autostadata, -99);
		cb = tempcb;
	} else if (option == '雨量GT') {
		[rawdata, stadata, autoraindata] = await Promise.all([d3.json(rain_url), d3.json(sta_data_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, -1, -1);
		sta_data = [];
		auto_sta_data = rain_data_proc(autoraindata, -99);
		cb = raincb;
	} else if (option == 'QPESUMS雨量') {
		[rawdata, stadata, autoraindata] = await Promise.all([d3.json(qpesums_rain_url), d3.json(sta_data_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, -1);
		sta_data = [];
		auto_sta_data = rain_data_proc(autoraindata, -99);
		cb = raincb;
	} else if (option == '雷達整合回波') {
		[rawdata] = await Promise.all([d3.json(qpesums_radar_url)]);
		data = data_proc(rawdata, -99, 0, 1);
		sta_data = [];
		auto_sta_data = null;
		cb = radarcb;
	}

	d3.selectAll("rect").remove();
	d3.selectAll(".sta").remove();
	
	//Grid data
	plot_grid_data(data);
		
	//Station Data
	if (auto_sta_data) {
		plot_sta_data(auto_sta_data.concat(sta_data));
	}
		
	d3.selectAll("select").attr('disabled', null);
}

document.onmousedown = function(e) {
	if (e.which == 3) {
		d3.select('#tooltip').style('opacity', 0);
		d3.selectAll(".sta").style('pointer-events', 'auto');
		d3.selectAll(".town").style('pointer-events', 'none');
		d3.selectAll("rect").style('pointer-events', 'none');
	}
	if (e.which == 2) {
		d3.select('#tooltip').style('opacity', 0);
		d3.selectAll(".town").style('pointer-events', 'auto');
		d3.selectAll(".sta").style('pointer-events', 'none');
		d3.selectAll("rect").style('pointer-events', 'none');
	}
};
document.onmouseup = function(e) {
	if (e.which == 3) {
		d3.select('#tooltip').style('opacity', 0);
		d3.selectAll("rect").style('pointer-events', 'auto');
		d3.selectAll(".sta").style('pointer-events', 'none');
		d3.selectAll(".town").style('pointer-events', 'none');
	}
	if (e.which == 2) {
		d3.select('#tooltip').style('opacity', 0);
		d3.selectAll("rect").style('pointer-events', 'auto');
		d3.selectAll(".sta").style('pointer-events', 'none');
		d3.selectAll(".town").style('pointer-events', 'none');
	}
};
document.addEventListener('contextmenu', function(e) {
	e.preventDefault();
	return false;
}, false); 

draw_map();
plot_data();

window.setInterval(plot_data, 180*1000);