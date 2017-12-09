

var width = 960,
    height = 500;

/*var path = d3.geoPath()
  .projection(null);*/

var projection = d3.geo.conicConformal()
  .scale(150)
  .translate([width / 2, height / 1.5]);
  
var path = d3.geo.path()
  .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


topojson_path = "topojson/kantone.json";
d3.json(topojson_path, function(error, ch) {
  /*svg.append("path")
    .datum(topojson.feature(ch, ch.objects.country))
    .attr("class", "country")
    .attr("d", path);*/

  /*svg.append("path")
    .datum(topojson.mesh(ch, ch.objects.municipalities, function(a, b) { return a !== b; }))
    .attr("class", "municipality-boundaries")
    .attr("d", path);*/
    console.log(error)
    console.log(ch)

  svg.append("path")
    .datum(topojson.mesh(ch, ch.objects.kantone, function(a, b) { return a !== b; }))
    .attr("class", "canton-boundaries")
    .attr("d", path);
});
