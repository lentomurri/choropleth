  //=SVG AREA=//
  const height = 800;
  const width = 1200;
  const padding = 60;

  const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  //==JSON DATA==//
  //generic function to get JSON and load counties and states

  function loadJSON(path, success, error) { //generic function to get JSON
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      if (success)
        success(JSON.parse(xhr.responseText));
    } else {
      if (error)
        error(xhr);
    }
  }
  };
  xhr.open("GET", path, true);
  xhr.send();
  }

  loadJSON('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
  dataset,
  function(xhr) {
  console.error(xhr);
  }
  );


  function dataset(data) {
  //Load Instruction level file
  var education = d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json").then(function(data){
  return data;
  });

  var stateNames = d3.json("https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json").then(function(data){
    return data;
  });

  //SAVE COUNTIES AND STATES DATA FROM JSON TO USE LATER

  const counties = topojson.feature(data, data.objects.counties).features;
  const states = topojson.feature(data, data.objects.states).features;

  const map = topojson.feature(data, data.objects.counties);

  //once education file is loaded, start all the operations
  education.then(function(data){

  //creates an array to index fips and recover bachelors' data to associate
  const report = data;
 
  //==LEGEND SCALE==
  //set min and max
  const minEdu = d3.min(data, (d)=> d.bachelorsOrHigher)
  const maxEdu = d3.max(data, (d)=> d.bachelorsOrHigher)

  //create threshold, values will be used on x-axis for the legend
  //set range of thersholdvalues

  var rangeLevel = [3.0,13.0,23.0,33.0,43.0,53.0,63.0,73.0,83.0];

  var scaleColour = d3.scaleThreshold()
  .domain([3.0,13.0,23.0,33.0,43.0,53.0,63.0,73.0,83.0])
  .range(['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a']);

  var xColour = d3.scaleLinear()
  .domain([-7.0,83.0])
  .range([0,270]);
  
  //LEGEND COLOUR X-AXIS==
  var xAxis = d3.axisBottom()
  .scale(xColour)
  .ticks(8)
  .tickValues(scaleColour.domain())
  .tickFormat(function(d,i) {
  if(d === 83.0) {
    return "";
  }
  return rangeLevel[i] + "%"});

  svg
  .append("g")
  .attr("transform", "translate(900,670)")
  .call(xAxis);

  //append g to create legend bar
  svg
  .append("g")
  .attr("transform", "translate(900,650)")
  .attr("id", "legend")
  .selectAll("rect")
  .data(rangeLevel)
  .enter()
  .append("rect")
  .attr("fill", (d) => scaleColour(d))
  .attr("x", (d,i)=> 30 * i)
  .attr("y", 0)
  .attr("width", 30)
  .attr("height", 20);

  //==TOOLTIP==

  var tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("visibility", "hidden");

  //DATA for tooltip

  //create map

  //collect data from previous JSON call

  //append g to add geometry

  var geoPath = d3.geoPath();

  //append G to add map. Add opacity to show both maps.
  //append colours to counties according to bachelor's percentage
  svg
  .append('g')
  .selectAll('path')
  .data(counties)
  .enter()
  .append('path')
  .attr("class", "county")
  .attr("stroke", "blue")
  //fill education level by filtering according to ID and FIPS
  .attr("fill", function(d){
  var id = report.filter(x => x.fips === d.id);
  return scaleColour(id[0].bachelorsOrHigher);
  })
  .attr("stroke-width", 1)
  .attr("data-fips",d => d.id)
  .attr("data-education", function(d){
    var id = report.filter(x => x.fips === d.id);
  return id[0].bachelorsOrHigher;
  })
  .attr("d", geoPath)
  .on("mouseover", function(d,i){
    tooltip
    .style("visibility", "visible")
    .attr("data-education", function(){
      var id = report.filter(x => x.fips === d.id);
      return id[0].bachelorsOrHigher;
    })
    .style("left", (d3.event.pageX - 50) + "px")
    .style("top", (d3.event.pageY - 105) + "px")
    .html(function(){
      var facts = report.filter(x => x.fips === d.id);
      if (facts) {
        return "State: " + facts[0].state + "<br>" + facts[0].area_name + "<br>Percentage: " + facts[0].bachelorsOrHigher + "%"
      }
    });
  })
  .on("mouseout", function(){
    tooltip.style("visibility", "hidden");
  });

  //creates states and leaves only borders visible
  svg
  .append('g')
  .selectAll('path')
  .data(states)
  .enter()
  .append('path')
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 1)
  .attr("opacity", "1")
  .attr("d", geoPath);
  });

  }
