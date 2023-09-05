var svg = d3.select("svg");
const g = svg.append("g");

const county_map_url = './COUNTY_MOI_1090820.json';
const town_map_url = './TOWN_MOI_1120317.json';

const temp_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0038-003.json';
const rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0040-004.json';

const qpesums_rain_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-B0045-001.json';
const qpesums_radar_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0059-001.json';

const auto_sta_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0001-001.json';
const auto_rain_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0002-001.json';
const sta_data_url = 'https://cwbopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0003-001.json';

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

function element_to_list(data) {
	out = {};
	data.forEach(function(ele){
		out[ele['elementName']] = ele['elementValue']['value'];
	});
	return out
}

function temp_data_proc(data, nan_value) {
	console.log(new Date().toLocaleString(), 'temp_data_proc start');
	data_out = [];
	data = data['cwbopendata']['location'];
	data.forEach(function(sta){
		lon = parseFloat(sta['lon']);
		lat = parseFloat(sta['lat']);
		x_y = projection([lon, lat]);
		weather = element_to_list(sta['weatherElement']);

		font_cmap = (x) => isNaN(x)?"black":x>=39.5?"#8520a0":x>=37.5?"#845194":x>=35.5?"#780101":x>=34.5?"#ad053a":x>=32.5?"#ed5138":x>=19.5?"":x>=13.5?"#96d07c":x>=11.5?"#2fa257":x>=9.5?"#0c924b":x>=7.5?"#a4dfec":x>=5.5?"#87cad8":"#69b4c4";
		
		data = parseFloat(weather['TEMP'].replace(nan_value, NaN));
		t_high = parseFloat(weather['D_TX'].replace(nan_value, NaN));
		t_low = parseFloat(weather['D_TN'].replace(nan_value, NaN));
		rh = parseFloat(weather['HUMD'].replace(nan_value, NaN)).toFixed(0)*100;
		
		t = '<b><font color="'+font_cmap(data)+'">' + data + '</font></b>';
		t_high = '<b><font color="'+font_cmap(t_high)+'">' + t_high + '</font></b>';
		t_low = '<b><font color="'+font_cmap(t_low)+'">' + t_low + '</font></b>';
		rh = '<b>' + rh + '</b>';
		t_high_t = (weather['D_TXT'].indexOf('T') == -1) ? weather['D_TXT'] : weather['D_TXT'].substr(11, 2) + weather['D_TXT'].substr(14, 2)
		t_low_t = (weather['D_TNT'].indexOf('T') == -1) ? weather['D_TNT'] : weather['D_TNT'].substr(11, 2) + weather['D_TNT'].substr(14, 2)
		
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'data': data,
				'tooltip': sta['lon'] + ', ' + sta['lat'] + '<br>' + sta['stationId'] + '_' + sta['locationName'] + '<br>' + weather['ELEV'] + ' m' + '<hr>溫度: ' + t + ' ℃' + '<br>高溫：' + t_high + ' ℃ (' + t_high_t + ')<br>低溫：' + t_low + ' ℃ (' + t_low_t + ')<br>濕度: <b>' + rh + '</b> %',
			});
		}
	});
	console.log(new Date().toLocaleString(), 'temp_data_proc end');
	return data_out
}

function rain_data_proc(data, nan_value, type=0) {
	console.log(new Date().toLocaleString(), 'rain_data_proc start');
	data_out = [];
	data = data['cwbopendata']['location'];
	data.forEach(function(sta){
		lon = parseFloat(sta['lon']);
		lat = parseFloat(sta['lat']);
		x_y = projection([lon, lat]);
		weather = element_to_list(sta['weatherElement']);

		data_today = parseFloat(weather['NOW'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data10 = parseFloat(weather['MIN_10'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data1 = parseFloat(weather['RAIN'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data3 = parseFloat(weather['HOUR_3'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data6 = parseFloat(weather['HOUR_6'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data12 = parseFloat(weather['HOUR_12'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data24 = parseFloat(weather['HOUR_24'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		
		data = type ? data1 : data_today;
		
		font_cmap_10m = (x) => isNaN(x)?"black":x>=100.?"red":x>=80.?"orange":x>=40.?"gold":x>=15.?"aquamarine":x>1.?"dimgray":"";
		font_cmap_1h = (x) => isNaN(x)?"black":x>=100.?"red":x>=80.?"orange":x>=40.?"gold":x>1.?"dimgray":"";
		font_cmap_3h = (x) => isNaN(x)?"black":x>=200.?"red":x>=100.?"orange":x>=80.?"gold":x>3.?"dimgray":"";
		font_cmap_24h = (x) => isNaN(x)?"black":x>=500.?"fuchsia":x>=350.?"red":x>=200.?"orange":x>=80.?"gold":x>5.?"dimgray":"";
		
		data10 = '<b><font color="' + font_cmap_10m(data10) + '">' + data10 + '</font></b>';
		data1 = '<b><font color="' + font_cmap_1h(data1) + '">' + data1 + '</font></b>';
		data3 = '<b><font color="' + font_cmap_3h(data3) + '">' + data3 + '</font></b>';
		data6 = '<b><font color="' + font_cmap_24h(data6) + '">' + data6 + '</font></b>';
		data12 = '<b><font color="' + font_cmap_24h(data12) + '">' + data12 + '</font></b>';
		data24 = '<b><font color="' + font_cmap_24h(data24) + '">' + data24 + '</font></b>';
		data_today = '<b><font color="' + font_cmap_24h(data_today) + '">' + data_today + '</font></b>';
		
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'data': data,
				'tooltip': sta['lon'] + ', ' + sta['lat'] + '<br>' + sta['stationId'] + '_' + sta['locationName'] + '<br>' + weather['ELEV'] + ' m<hr>10m: ' + data10 + ' mm<br>1h: ' + data1 + ' mm<br>3h: ' + data3 + ' mm<br>6h: ' + data6 + ' mm<br>12h: ' + data12 + ' mm<br>24h: ' + data24 + ' mm<br>今日: ' + data_today + ' mm',
			});
		}
	});
	console.log(new Date().toLocaleString(), 'rain_data_proc end');
	return data_out
}

function data_proc(data, nan_value, fix=0, offset=0) {
	console.log(new Date().toLocaleString(), 'data_proc start');
	data_out = [];
	
	parameter = data['cwbopendata']['dataset']['datasetInfo']['parameterSet']['parameter'];
	
	lon0_lat0 = parameter[0+offset]['parameterValue'].split(',');
	lon0 = parseFloat(lon0_lat0[0]);
	lat0 = parseFloat(lon0_lat0[1]);
	
	dx = parseFloat(parameter[1+offset]['parameterValue']);
	size = dx*200
	
	valid_time = new Date(parameter[2+offset]['parameterValue']);
	d3.select('#info').html('<b>' + valid_time.toLocaleString() + '</b>');
	
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
		
		data = parseFloat(value);
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'data': data,
				'size': size,
				'tooltip': lon.toFixed(2) + ', ' + lat.toFixed(2) + '<br>' + data + ' ' + unit,
			});
		}
		
		x++;
		if (x >= nx) {
			x = 0;
			y++;
		}
	});
	
	console.log(new Date().toLocaleString(), 'data_proc end');
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
	console.log(new Date().toLocaleString(), 'draw_map start');
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
	console.log(new Date().toLocaleString(), 'draw_map end');
}

function plot_grid_data(data) {
	console.log(new Date().toLocaleString(), 'plot_grid_data start');
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
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['tooltip'] + '</div>');
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		})
		.lower()
		.lower(); 
	console.log(new Date().toLocaleString(), 'plot_grid_data end');
}

function plot_sta_data(data) {
	console.log(new Date().toLocaleString(), 'plot_sta_data start');
	g.selectAll("text")
		.data(data)
		.enter()
		.append("svg:text")
		.attr("x", function(d) {return d['x']})
		.attr("y", function(d) {return d['y']})
		.text(function(d){return d['data']})
		.on("mouseover", function(d) {
			d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['tooltip'] + '</div>');
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
	console.log(new Date().toLocaleString(), 'plot_sta_data end');
}

async function plot_data() {
	d3.selectAll("select").attr('disabled', '1');
	d3.select('#info').html('<font color="red"><b>資料載入中，請稍後...<b></font>');
	
	option = d3.select('#product').property("value");
	
	if (option == '溫度') {
		[rawdata, stadata, autostadata] = await Promise.all([d3.json(temp_url), d3.json(sta_data_url), d3.json(auto_sta_data_url)]);
		data = data_proc(rawdata, -999, -1);
		sta_data = temp_data_proc(stadata, -99);
		auto_sta_data = temp_data_proc(autostadata, -99);
		cb = tempcb;
	} else if (option == '雨量') {
		[rawdata, autoraindata] = await Promise.all([d3.json(rain_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, -1, -1);
		sta_data = [];
		auto_sta_data = rain_data_proc(autoraindata, -99);
		cb = raincb;
	} else if (option == 'QPESUMS雨量') {
		[rawdata, autoraindata] = await Promise.all([d3.json(qpesums_rain_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, -1);
		sta_data = [];
		auto_sta_data = rain_data_proc(autoraindata, -99, 1);
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