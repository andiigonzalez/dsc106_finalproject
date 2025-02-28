document.addEventListener("DOMContentLoaded", function () {
  let currentState = 0; // 0: Surgery percentage, 1: Cancer percentage, 2: Cancer gender breakdown
  let surgeryData = {};
  let cancerData = {};
  let genderData = {};
  let svgElements = {};
  let width = 200, height = 200, radius = Math.min(width, height) / 2;
  
  d3.csv("sugeries.csv").then(function (data) {
      processData(data);
      createPieCharts();
  });
  
  function processData(data) {
    let totalSurgeries = data.length;
    data.forEach(d => {
        let optype = d.optype;
        let isCancer = d.diagnosis === "cancer";
        let gender = d.gender;
        
        surgeryData[optype] = (surgeryData[optype] || 0) + 1;
        
        if (isCancer) {
            cancerData[optype] = (cancerData[optype] || 0) + 1;
            if (!genderData[optype]) {
                genderData[optype] = { male: 0, female: 0 };
            }
            genderData[optype][gender]++;
        }
    });
}
  
  function createPieCharts() {
    let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);
    Object.keys(surgeryData).forEach(optype => {
        let container = d3.select("#charts-container")
            .append("div").attr("class", "chart-container")
            .style("display", "inline-block")
            .style("margin", "10px")
            .attr("id", `chart-${optype}`);
        
        container.append("h3").text(optype).style("text-align", "center");
        
        let svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);
        
        svgElements[optype] = svg;
        updatePieChart(optype, totalSurgeries);
    });
  }

  function updatePieChart(optype, totalSurgeries) {
    let data;
    if (currentState === 0) {
        data = [
            { label: optype, value: surgeryData[optype] },
            { label: "Other Surgeries", value: totalSurgeries - surgeryData[optype] }
        ];
    } else if (currentState === 1) {
        let total = surgeryData[optype];
        let cancerCases = cancerData[optype] || 0;
        data = [
            { label: "Cancer", value: cancerCases },
            { label: "Other", value: total - cancerCases }
        ];
    } else {
        let totalCancer = cancerData[optype] || 0;
        let maleCases = genderData[optype]?.male || 0;
        let femaleCases = genderData[optype]?.female || 0;
        data = [
            { label: "Male", value: maleCases, color: "blue" },
            { label: "Female", value: femaleCases, color: "pink" }
        ];
    }
    
    let pie = d3.pie().value(d => d.value);
    let arc = d3.arc().innerRadius(0).outerRadius(radius);
    
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    
    let svg = svgElements[optype];
    let paths = svg.selectAll("path").data(pie(data));
    
    paths.enter().append("path")
        .merge(paths)
        .attr("d", arc)
        .attr("fill", d => d.data.color || color(d.data.label));
    
    paths.exit().remove();
    
    let text = svg.selectAll("text").data(pie(data));
    
    text.enter().append("text")
        .merge(text)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "white")
        .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);
    
    text.exit().remove();
}

document.getElementById("toggle-button").addEventListener("click", function () {
    currentState = (currentState + 1) % 3;
    let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);
    Object.keys(surgeryData).forEach(optype => updatePieChart(optype, totalSurgeries));
});
});
