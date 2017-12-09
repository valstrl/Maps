var m_width = $("#map").width(),
    width = 938,
    height = 500,
    kantone, // Alle Kantone der Schweiz
    bezirke, // Alle Bezirke der Schweiz
    gemeinden, // Alle Gemeinden der Scheiz
    kanton, // Ausgewählter Kanton
    bezirk, // Ausgewählter Bezitk
    dataset;

var highlight = function() {
    d3.select(this)
    .classed("highlighted", false);
}

var color = d3.scale.quantize()
.range(["#74c476","#41ab5d","#238b45"]);

var projection = d3.geo.conicConformal()
    .scale(150)
    .translate([width / 2, height / 1.5]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", m_width)
    .attr("height", m_width * height / width);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", move_up)
    .on("mouseover", function() {
        if (!kanton) {
            d3.select("#title").text("Wählen Sie einen Kanton");
                    //d3.select("#value").text("Klicken Sie, um auf eine tiefere Ebene zu gelangen");
        }
        else if (!bezirk)
        {
            d3.select("#title").text("Wählen Sie einen Bezirk");
            //d3.select("#value").text("Klicken sie auf die weisse Fläche, um auf eine höhere Ebene zu gelangen");
        }
        else {
            d3.select("#title").text("");
           //d3.select("#value").text("Klicken sie auf die weisse Fläche, um auf eine höhere Ebene zu gelangen");
        }
    });

var g = svg.append("g");

var get_place_color = function(d) {
    //Get data value
    if (d.entries) {
                            var value = d.entry.Visitors;
                        }
                        else {
                            var value = 0;
                        }

    if (value ) {
            //If value exists…
            return color(value);
    } else {
            //If value is undefined…
            return "#a1d99b";
    }
};

var update_info = function(d) {

    if (d.entries) {
        var value = d.entry.Visitors;
    }
    else {
        var value = 0;
    }

  d3.select(this).classed("highlighted", true);

var name;
  if(d.properties.KTNAME) {
    name = d.properties.KTNAME;
  }
  else if(d.properties.BZNAME) {
    name = d.properties.BZNAME;
  }
  else if(d.properties.GMDNAME) {
    name = d.properties.GMDNAME;
  }
  d3.select("#title").text(name);
  //d3.select("#value").text(value + " Besucher");

}

function set_colordomain(d) {
    color.domain([
                    d3.min(d, function(d) {
                        if (d.entries) {
                            return d.entry.Visitors;
                        }
                        else {
                            return 0;
                        }
                    }),
                    d3.max(d, function(d) {
                        if (d.entries) {
                            return d.entry.Visitors;
                        }
                        else {
                            return 0;
                        }
                    })
    ]);
    d3.select("#range0").text("0");
    d3.select("#range1").text("0 - "+Math.round(color.invertExtent("#74c476")[1]));
    d3.select("#range2").text(Math.round(color.invertExtent("#41ab5d")[1])+" - "+Math.round(color.invertExtent("#41ab5d")[1]));
    d3.select("#range3").text(Math.round(color.invertExtent("#238b45")[1])+" - "+Math.round(color.invertExtent("#238b45")[1]));
}

function move_up() {
  if (bezirk) {
    kanton_clicked(kanton);
    bezirk = null;
        g.selectAll("#gemeinden").remove();
  }
  else if(kanton) {
    start_demo();
    kanton = null;
        g.selectAll("#bezirke").remove();
  }

    if (!kanton) {
            d3.select("#title").text("Wählen Sie einen Kanton");
                    //d3.select("#value").text("Klicken Sie, um auf eine tiefere Ebene zu gelangen");
        }
        else if (!bezirk)
        {
            d3.select("#title").text("Wählen Sie einen Bezirk");
            //d3.select("#value").text("Klicken sie auf die weisse Fläche, um auf eine höhere Ebene zu gelangen");
        }
        else {
            d3.select("#title").text("");
           //d3.select("#value").text("Klicken sie auf die weisse Fläche, um auf eine höhere Ebene zu gelangen");
        }
}

function zoom(xyz) {
g.selectAll(["#kantone", "#bezirke", "#gemeinden"])
    .style("stroke-width", 1.0 / xyz[2] + "px");

  g.transition()
    .duration(750)
    .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
    .selectAll(["#kantone", "#bezirke", "#gemeinden"])
    .style("stroke-width", 1.0 / xyz[2] + "px")
    .selectAll(".gemeinde")
    .attr("d", path.pointRadius(20.0 / xyz[2]));
}

function get_xyz(d) {
  var bounds = path.bounds(d);
  var w_scale = (bounds[1][0] - bounds[0][0]) / width;
  var h_scale = (bounds[1][1] - bounds[0][1]) / height;
  var z = .96 / Math.max(w_scale, h_scale);
  var x = (bounds[1][0] + bounds[0][0]) / 2;
  var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
  return [x, y, z];
}

function get_sum_of_entries(all_entries) {

    var entries = {Visitors:0};
    all_entries.forEach(function(entry) {
        entries.Visitors += parseInt(entry.Visitors);
    })
    return entries;
}

function kanton_clicked(d) {

    var xyz = get_xyz(d);
    kanton = d;

      var contained_bezirke = bezirke.filter( function(bezirk) {
        return bezirk.properties.KTNR == d.properties.KTNR;
      });

        contained_bezirke.forEach(function(d) {
            d.entries = dataset.filter( function(data) {
                return data.Bezirk == d.properties.BZNAME;
            });
        d.entry = get_sum_of_entries(d.entries);
      });

      set_colordomain(contained_bezirke);

        g.append("g")
          .attr("id", "bezirke")
          .selectAll("path")
          .data(contained_bezirke)
          .enter()
          .append("path")
          .attr("id", function(d) { return "bezirke"; })
          .attr("class", "active")
          .attr("d", path)
          .attr("fill", get_place_color)
          .on("click", bezirk_clicked)
          .on("mouseover", update_info)
          .on("mouseout", function() {
            d3.select(this).classed("highlighted", false);
          });

        zoom(xyz);
        g.selectAll("#kantone").remove();
}

function bezirk_clicked(d) {

    var xyz = get_xyz(d);
    bezirk = d;

    var contained_gemeinden = gemeinden.filter( function(gemeinde) {
    return gemeinde.properties.BZNR == d.properties.BZNR;
  });

    contained_gemeinden.forEach(function(d) {
    d.entries = dataset.filter( function(data) {
        return data.Gemeinde == d.properties.GMDNAME;
          });
        d.entry = get_sum_of_entries(d.entries);
  });

    set_colordomain(contained_gemeinden);

      g.append("g")
        .attr("id", "gemeinden")
        .selectAll("path")
        .data(contained_gemeinden)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.properties.name; })
        .attr("class", "gemeinde")
        .attr("d", path.pointRadius(20 / xyz[2]))
        .attr("fill", get_place_color)
        .on("mouseover", update_info)
        .on("mouseout", highlight);

      zoom(xyz);

      g.selectAll("#bezirke").remove();
}

function start_demo() {

  set_colordomain(kantone);

  g.append("g")
    .attr("id", "kantone")
    .selectAll("path")
    .data(kantone)
    .enter()
    .append("path")
    .attr("id", function(d) { return d.id; })
    .attr("d", path)
    .attr("fill", get_place_color)
    .on("click", kanton_clicked)
  .on("mouseover", update_info)
  .on("mouseout", highlight);

  d3.json("topojson/start.json", function(error, json) {
  start = get_xyz((json.features)[0]);
  zoom(start);
    g.selectAll("#bezirke", "#gemeinden").remove();
    });

};

$(window).resize(function() {
  var w = $("#map").width();
  svg.attr("width", w);
  svg.attr("height", w * height / width);
});

d3.csv("csv/data.csv", function(data) {

dataset = data;

        //d3.select("#value").text("Lade Kantone");

    d3.json("topojson/kantone.topo.json", function(error, json) {
        kantone = topojson.feature(json, json.objects.kantone).features;

      kantone.forEach(function(d) {
          d.entries = dataset.filter( function(data) {
                return data.Kanton == d.properties.KTNAME;
                });
                d.entry = get_sum_of_entries(d.entries);
        });

      //d3.select("#value").text("Lade Bezirke");

        //Lade Bezirke
        d3.json("topojson/bezirke.topo.json", function(error, json) {
            bezirke = topojson.feature(json, json.objects.bezirke).features;

            //d3.select("#value").text("Lade Gemeinden");

            // Lade Gemeinden
            d3.json("topojson/gemeinden.topo.json", function(error, json) {
                  gemeinden = topojson.feature(json, json.objects.gemeinden).features;

                  d3.select("#title").text("Wählen Sie einen Kanton");
                  //d3.select("#value").text("Klicken um zu den Bezirken zu gelangen");

                  //Starte die Demonstration
                  start_demo();
              });
    });
  });

});
