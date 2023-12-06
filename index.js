var svg = d3.select("svg");
const g = svg.append("g");

const county_map_url = './COUNTY_MOI_1090820.json';
const town_map_url = './TOWN_MOI_1120317.json';

const temp_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0038-003.json';
const rain_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0040-004.json';

const qpesums_rain_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-B0045-001.json';
const qpesums_radar_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0059-001.json';

const auto_sta_data_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0001-001.json';
const auto_rain_data_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0002-001.json';
const sta_data_url = 'https://cwaopendata.s3.ap-northeast-1.amazonaws.com/Observation/O-A0003-001.json';

svg.call(d3.zoom().on("zoom",() => {
	g.attr("transform", d3.event.transform);
}));

var projection = d3.geoMercator().center([121, 24.15]).scale(11000);
var pathGenerator = d3.geoPath().projection(projection);

var svg = d3.select("#rect").append("svg");

var is_shift = false;
var is_ctrl = false;

d3.select('body')
	.append('div')
	.attr('id', 'tooltip')
	.attr('style', 'position: absolute; opacity: 0;');

function print(...data) {
	console.log(data);
}

function wind_data_proc(data, nan_value) {
	console.log(new Date().toLocaleString(), 'wind_data_proc start');
	data_out = [];
	data = data['cwaopendata']['dataset']['Station'];
	data.forEach(function(sta){
		geo = sta['GeoInfo']
		coodr = geo['Coordinates'][0]; //0:TWD97, 1:WGS84
		lon = parseFloat(coodr['StationLongitude']);
		lat = parseFloat(coodr['StationLatitude']);
		x_y = projection([lon, lat]);
		weather = sta['WeatherElement'];

		font_cmap = (x) => isNaN(x)?"black":x>=39.5?"#8520a0":x>=37.5?"#845194":x>=35.5?"#780101":x>=34.5?"#ad053a":x>=32.5?"#ed5138":x>=19.5?"":x>=13.5?"#96d07c":x>=11.5?"#2fa257":x>=9.5?"#0c924b":x>=7.5?"#a4dfec":x>=5.5?"#87cad8":"#69b4c4";
		
		data = parseFloat(weather['WindSpeed'].replace(nan_value, NaN));
		t_high = parseFloat(weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['AirTemperature'].replace(nan_value, NaN));
		t_low = parseFloat(weather['DailyExtreme']['DailyLow']['TemperatureInfo']['AirTemperature'].replace(nan_value, NaN));
		rh = parseFloat(weather['RelativeHumidity'].replace(nan_value, NaN));
		
		t = '<b><font color="'+font_cmap(data)+'">' + data + '</font></b>';
		t_high = '<b><font color="'+font_cmap(t_high)+'">' + t_high + '</font></b>';
		t_low = '<b><font color="'+font_cmap(t_low)+'">' + t_low + '</font></b>';
		rh = '<b>' + rh + '</b>';
		t_high_t = weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['Occurred_at']['DateTime'].substr(11, 2) + weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['Occurred_at']['DateTime'].substr(14, 2)
		t_low_t = weather['DailyExtreme']['DailyLow']['TemperatureInfo']['Occurred_at']['DateTime'].substr(11, 2) + weather['DailyExtreme']['DailyLow']['TemperatureInfo']['Occurred_at']['DateTime'].substr(14, 2)
		
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'sta': sta['stationId'],
				'data': data,
				'tooltip': coodr['StationLongitude'] + ', ' + coodr['StationLatitude'] + '<br>' + sta['StationId'] + '_' + sta['StationName'] + '<br>' + geo['StationAltitude'] + ' m' + '<hr>' + new Date(sta['ObsTime']['DateTime']).toLocaleString() + '<br>溫度: ' + t + ' ℃' + '<br>高溫：' + t_high + ' ℃ (' + t_high_t + ')<br>低溫：' + t_low + ' ℃ (' + t_low_t + ')<br>濕度: <b>' + rh + '</b> %',
			});
		}
	});
	console.log(new Date().toLocaleString(), 'wind_data_proc end');
	return data_out
}


function temp_data_proc(data, nan_value) {
	console.log(new Date().toLocaleString(), 'temp_data_proc start');
	data_out = [];
	data = data['cwaopendata']['dataset']['Station'];
	data.forEach(function(sta){
		geo = sta['GeoInfo']
		coodr = geo['Coordinates'][0]; //0:TWD97, 1:WGS84
		lon = parseFloat(coodr['StationLongitude']);
		lat = parseFloat(coodr['StationLatitude']);
		x_y = projection([lon, lat]);
		weather = sta['WeatherElement'];

		font_cmap = (x) => isNaN(x)?"black":x>=39.5?"#8520a0":x>=37.5?"#845194":x>=35.5?"#780101":x>=34.5?"#ad053a":x>=32.5?"#ed5138":x>=19.5?"":x>=13.5?"#96d07c":x>=11.5?"#2fa257":x>=9.5?"#0c924b":x>=7.5?"#a4dfec":x>=5.5?"#87cad8":"#69b4c4";
		
		data = parseFloat(weather['AirTemperature'].replace(nan_value, NaN));
		t_high = parseFloat(weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['AirTemperature'].replace(nan_value, NaN));
		t_low = parseFloat(weather['DailyExtreme']['DailyLow']['TemperatureInfo']['AirTemperature'].replace(nan_value, NaN));
		rh = parseFloat(weather['RelativeHumidity'].replace(nan_value, NaN));
		
		t = '<b><font color="'+font_cmap(data)+'">' + data + '</font></b>';
		t_high = '<b><font color="'+font_cmap(t_high)+'">' + t_high + '</font></b>';
		t_low = '<b><font color="'+font_cmap(t_low)+'">' + t_low + '</font></b>';
		rh = '<b>' + rh + '</b>';
		t_high_t = weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['Occurred_at']['DateTime'].substr(11, 2) + ':' + weather['DailyExtreme']['DailyHigh']['TemperatureInfo']['Occurred_at']['DateTime'].substr(14, 2)
		t_low_t = weather['DailyExtreme']['DailyLow']['TemperatureInfo']['Occurred_at']['DateTime'].substr(11, 2) + ':' + weather['DailyExtreme']['DailyLow']['TemperatureInfo']['Occurred_at']['DateTime'].substr(14, 2)
		
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'sta': sta['stationId'],
				'data': data,
				'tooltip': coodr['StationLongitude'] + ', ' + coodr['StationLatitude'] + '<br>' + sta['StationId'] + '_' + sta['StationName'] + '<br>' + geo['StationAltitude'] + ' m' + '<hr>' + new Date(sta['ObsTime']['DateTime']).toLocaleString() + '<br>溫度: ' + t + ' ℃' + '<br>高溫：' + t_high + ' ℃ (' + t_high_t + ')<br>低溫：' + t_low + ' ℃ (' + t_low_t + ')<br>濕度: <b>' + rh + '</b> %',
			});
		}
	});
	console.log(new Date().toLocaleString(), 'temp_data_proc end');
	return data_out
}

function rain_data_proc(data, nan_value, type=0) {
	console.log(new Date().toLocaleString(), 'rain_data_proc start');
	data_out = [];
	data = data['cwaopendata']['dataset']['Station'];
	data.forEach(function(sta){
		geo = sta['GeoInfo']
		coodr = geo['Coordinates']; //TWD67
		lon = parseFloat(coodr['StationLongitude']);
		lat = parseFloat(coodr['StationLatitude']);
		x_y = projection([lon, lat]);
		weather = sta['RainfallElement'];

		data_today = parseFloat(weather['Now']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data10 = parseFloat(weather['Past10Min']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data1 = parseFloat(weather['Past1hr']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data3 = parseFloat(weather['Past3hr']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data6 = parseFloat(weather['Past6hr']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data12 = parseFloat(weather['Past12hr']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data24 = parseFloat(weather['Past24hr']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data2d = parseFloat(weather['Past2days']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		data3d = parseFloat(weather['Past3days']['Precipitation'].replace(/-998.00/g, '0.00').replace(nan_value, NaN));
		
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
		data2d = '<b><font color="' + font_cmap_24h(data2d) + '">' + data2d + '</font></b>';
		data3d = '<b><font color="' + font_cmap_24h(data3d) + '">' + data3d + '</font></b>';
		data_today = '<b><font color="' + font_cmap_24h(data_today) + '">' + data_today + '</font></b>';
		
		if (data > nan_value) {
			data_out.push({
				'x': x_y[0],
				'y': x_y[1],
				'sta': sta['stationId'],
				'data': data,
				'tooltip': coodr['StationLongitude'] + ', ' + coodr['StationLatitude'] + '<br>' + sta['StationId'] + '_' + sta['StationName'] + '<br>' + geo['StationAltitude'] + ' m' + '<hr>' + new Date(sta['ObsTime']['DateTime']).toLocaleString() + '<br>10m: ' + data10 + ' mm<br>1h: ' + data1 + ' mm<br>3h: ' + data3 + ' mm<br>6h: ' + data6 + ' mm<br>12h: ' + data12 + ' mm<br>24h: ' + data24 + ' mm<br>今日: ' + data_today + ' mm<br>兩日: ' + data2d + ' mm<br>三日: ' + data3d + ' mm',
			});
		}
	});
	console.log(new Date().toLocaleString(), 'rain_data_proc end');
	return data_out
}

function data_proc(data, nan_value, type, fix=0) {
	console.log(new Date().toLocaleString(), 'data_proc start');
	data_out = [];
	
	if (type == 1) {
		//舊版格式 For二組
		parameter = data['cwaopendata']['dataset']['datasetInfo']['parameterSet']['parameter'];
		
		lon0_lat0 = parameter[0]['parameterValue'].split(',');
		lon0 = parseFloat(lon0_lat0[0]);
		lat0 = parseFloat(lon0_lat0[1]);
		
		dx = parseFloat(parameter[1]['parameterValue']);
		size = dx*200
		
		valid_time = new Date(parameter[2]['parameterValue']);
		d3.select('#info').html('<b>' + valid_time.toLocaleString() + '</b>');
		
		nx_ny = parameter[3]['parameterValue'].split('*');
		nx = parseInt(nx_ny[0], 10)+fix;
		ny = parseInt(nx_ny[1], 10);
		
		unit = parameter[4]['parameterValue'].replace('攝氏', '℃');
	} else {
		//新版格式 For衛星中心
		parameter = data['cwaopendata']['dataset']['datasetInfo']['parameterSet'];
		
		lon0 = parseFloat(parameter['StartPointLongitude']);
		lat0 = parseFloat(parameter['StartPointLatitude']);
		
		dx = parseFloat(parameter['GridResolution']);
		size = dx*200
		
		valid_time = new Date(parameter['DateTime']);
		d3.select('#info').html('<b>' + valid_time.toLocaleString() + '</b>');
		
		nx = parseInt(parameter['GridDimensionX'])+fix;
		ny = parseInt(parameter['GridDimensionY'], 10);
		
		unit = parameter.hasOwnProperty("Precipitation") ? parameter['Precipitation'] : parameter['Reflectivity'];
	}
	
	data_content = data['cwaopendata']['dataset']['contents']['content'].split(',');
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
	g.selectAll("svg")
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

function plot_wind_data(data) {
	console.log(new Date().toLocaleString(), 'plot_wind_data start');
	WindArrow(10, 30, 'svg', 6);
	g.selectAll("text")
		.data(data)
		.enter()
		.append("svg:text")
		.attr("x", function(d) {return d['x']})
		.attr("y", function(d) {return d['y']})
		.text(function(d){return d['data']})
		.on("mouseover", function(d) {
			if (is_shift) {
				window.open('https://246.swcb.gov.tw/Info/RainGraph?stid=' + d['sta'],'win1','width=1000,height=600');
			} else if (is_ctrl) {
				window.open('https://www.cwb.gov.tw/V8/C/W/OBS_Station.html?ID=' + d['sta'].substr(0, 5),'win2','width=1000,height=800');
			} else {
				d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['tooltip'] + '</div>');
			}
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		})
		.attr("text-anchor", "middle")
		.attr('font-size', '3px')
		.style('pointer-events', 'none')
		.attr("class","sta")
		.raise()
		.raise()
		.raise();
	console.log(new Date().toLocaleString(), 'plot_wind_data end');
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
			if (is_shift) {
				window.open('https://246.swcb.gov.tw/Info/RainGraph?stid=' + d['sta'],'win1','width=1000,height=600');
			} else if (is_ctrl) {
				window.open('https://www.cwb.gov.tw/V8/C/W/OBS_Station.html?ID=' + d['sta'].substr(0, 5),'win2','width=1000,height=800');
			} else {
				d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">' + d['tooltip'] + '</div>');
			}
		})
		.on("mousemove", function(d) {
			d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
		})
		.on("mouseout", function(d) {
			d3.select('#tooltip').style('opacity', 0);
		})
		.attr("text-anchor", "middle")
		.attr('font-size', '3px')
		.style('pointer-events', 'none')
		.attr("class","sta")
		.raise()
		.raise()
		.raise();
	console.log(new Date().toLocaleString(), 'plot_sta_data end');
}

function plot_current_loc() {
	navigator.geolocation.getCurrentPosition(function(d) {
		g.append("circle")
			.attr("cx", function(a) {
					return projection([d.coords.longitude, d.coords.latitude])[0];
			})
			.attr("cy", function(a) {
					return projection([d.coords.longitude, d.coords.latitude])[1];
			})
			.attr("r", 2)
			.style("fill", "red")
			.style('pointer-events', 'none')
			.raise()
			.raise();
	})
}

function clear() {
	document.querySelectorAll('rect').forEach(ele => {
		ele.remove();
	});
	
	document.querySelectorAll('.sta').forEach(ele => {
		ele.remove();
	});
}

async function plot_data() {
	d3.selectAll("select").attr('disabled', '1');
	d3.select('#info').html('<font color="red"><b>資料載入中，請稍後...<b></font>');
	
	option = d3.select('#product').property("value");
	
	if (option == '溫度') {
		[rawdata, stadata, autostadata] = await Promise.all([d3.json(temp_url), d3.json(sta_data_url), d3.json(auto_sta_data_url)]);
		data = data_proc(rawdata, -999, 1, -1);
		sta_data = temp_data_proc(stadata, -99);
		auto_sta_data = temp_data_proc(autostadata, -99);
		cb = tempcb;
		clear();
		plot_grid_data(data);
		plot_sta_data(sta_data.concat(auto_sta_data));
	} else if (option == '雨量') {
		[rawdata, autoraindata] = await Promise.all([d3.json(rain_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, 0, 1, -1);
		sta_data = null;
		auto_sta_data = rain_data_proc(autoraindata, -99);
		cb = raincb;
		clear();
		plot_grid_data(data);
		plot_sta_data(auto_sta_data);
	} else if (option == '風') {
		[stadata, autostadata] = await Promise.all([d3.json(sta_data_url), d3.json(auto_sta_data_url)]);
		data = null;
		sta_data = wind_data_proc(stadata, -99);
		auto_sta_data = wind_data_proc(autostadata, -99);
		d3.select('#info').html('');
		clear();
		plot_wind_data(sta_data.concat(auto_sta_data));
	} else if (option == 'QPESUMS雨量') {
		[rawdata, autoraindata] = await Promise.all([d3.json(qpesums_rain_url), d3.json(auto_rain_data_url)]);
		data = data_proc(rawdata, 0, 0);
		sta_data = null;
		auto_sta_data = rain_data_proc(autoraindata, -99, 1);
		cb = raincb;
		clear();
		plot_grid_data(data);
		plot_sta_data(auto_sta_data);
	} else if (option == '雷達整合回波') {
		[rawdata] = await Promise.all([d3.json(qpesums_radar_url)]);
		data = data_proc(rawdata, -99, 0, 0);
		sta_data = null;
		auto_sta_data = null;
		cb = radarcb;
		clear();
		plot_grid_data(data);
	}
		
	d3.selectAll("select").attr('disabled', null);
}

document.onmousedown = function(e) {
	is_shift = e.shiftKey;
	is_ctrl = e.ctrlKey;
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
plot_current_loc()

window.setInterval(plot_data, 300*1000);