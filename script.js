document.addEventListener("DOMContentLoaded", function () {
    let currentState = 0;
    let surgeryData = {};
    let cancerData = {};
    let genderData = {};
    let svgElements = {};
    let width = 150, height = 150, radius = Math.min(width, height) / 2;

    const dots = document.querySelectorAll(".dot");
    const previousButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");
    const arrowSvg = d3.select("#arrow-svg");

    d3.csv("sugeries.csv").then(function (data) {
        processData(data);
        createPieCharts();
        updateLegend();
        updateDots();
        updateArrows();
    });


  
  function processData(data) {
    let totalSurgeries = data.length;
    data.forEach(d => {
        let optype = d.optype.replace(/\//g, "-");
        surgeryData[optype] = (surgeryData[optype] || 0) + 1;
        let isCancer = /(cancer|tumor|carcinoma|sarcoma|malignant|lymphoma)/i.test(d.dx);
        let gender = d.sex;

        
        if (isCancer) {
          cancerData[optype] = (cancerData[optype] || 0) + 1;
          if (!genderData[optype]) {
              genderData[optype] = { M: 0, F: 0 };
          }
          if (gender === "M") {
            genderData[optype].M++;
        } else if (gender === "F") {
            genderData[optype].F++;
        }

          // Map "M" to "male" and "F" to "female"
      }
  });
}
  
  function createPieCharts() {
    let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);
    
    Object.keys(surgeryData).forEach(optype => { 
        let container = d3.select(`#chart-${optype}`);

        if (container.empty()) {
            console.warn(`Missing container: chart-${optype}`);
            return;
        }

        container.selectAll("svg").remove(); // Remove previous SVGs

        let svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("display", "block")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);


        svgElements[optype] = svg;
        updatePieChart(optype, totalSurgeries);
    });
    updateArrows();
  }

  function updatePieChart(optype, totalSurgeries) {
    let total = surgeryData[optype];
    let totalCancer = cancerData[optype] || 0;
    let maleCases = genderData[optype]?.M || 0;
    let femaleCases = genderData[optype]?.F || 0;
    let nonCancerCases = total - totalCancer;
    let textContent = "";
    let color = "black";

    let data;
    if (currentState === 0) {
        let percent = Math.round((total / totalSurgeries) * 100);
        data = [
            { label: optype, value: surgeryData[optype], color: "red" },
            { label: "Other Surgeries", value: totalSurgeries - surgeryData[optype], color: "lightgrey" }
        ];
        color = "red";
        textContent = `Out of all surgeries, <b style="color:${color}"> ${optype}</b> constituted <b style="color:${color}">${percent}%</b>.`;
    } else if (currentState === 1) {
        let total = surgeryData[optype];
        let cancerCases = cancerData[optype] || 0;
        let percent = total === 0 ? 0 : Math.round((totalCancer / total) * 100);
        data = [
            { label: "Cancer", value: cancerCases, color: "orange" },
            { label: "Other", value: total - cancerCases, color: "lightgrey" }];
        color = "orange";
        textContent = `Out of all <b style="color:${color}">${optype}</b> surgeries, <b style="color:${color}">${percent}%</b> were cancer diagnoses.`;
      } else {
        // Third toggle state: Split Cancer into Male/Female directly
        let percentMale = totalCancer === 0 ? 0 : Math.round((maleCases / totalCancer) * 100);
        let percentFemale = totalCancer === 0 ? 0 : Math.round((femaleCases / totalCancer) * 100);
        data = [
            { label: "Non-Cancer", value: nonCancerCases, color: "lightgrey" },
            { label: "Male Cancer", value: maleCases, color: "lightblue" },
            { label: "Female Cancer", value: femaleCases, color: "pink" }
        ];
        textContent = `Women made up <b style="color:pink">${percentFemale}%</b> and men <b style="color:lightblue">${percentMale}%</b> of the cancer diagnoses.`;
      }
      d3.select(`#chart-${optype} .chart-text`).html(textContent);
        
  
    let pie = d3.pie().value(d => d.value);
    let arc = d3.arc().innerRadius(0).outerRadius(radius);
    
    let svg = svgElements[optype];
    let paths = svg.selectAll("path").data(pie(data.filter(d => d.value > 0)));
    
    paths.enter().append("path")
        .merge(paths)
        .attr("d", arc)
        .attr("fill", d => d.data.color);
    
    paths.exit().remove();
    
    let text = svg.selectAll("text").data(pie(data));
    
    text.enter().append("text")
        .merge(text)
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "black")
        .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);
        
    text.exit().remove();
    d3.select(`#chart-${optype} .chart-text`).html(textContent);
    updateLegend();
    updateArrows();
  }
  
  function updateLegend() {
    d3.select("#legend").remove();

    let legend = d3.select("body").append("div")
        .attr("id", "legend")
        .style("position", "absolute")
        .style("top", "10px")
        .style("right", "10px")
        .style("background", "white")
        .style("padding", "10px")

    let legendData;
    if (currentState === 0) {
        legendData = [
            { label: "All Other Surgeries", color: "lightgrey" },
            { label: "Surgery", color: "red" }
        ];
    } else if (currentState === 1) {
        legendData = [
            { label: "Cancer", color: "orange" },
            { label: "Non-Cancer", color: "lightgrey" }
        ];
    } else {
        legendData = [
            { label: "Non-Cancer", color: "lightgrey" },
            { label: "Male Cancer", color: "lightblue" },
            { label: "Female Cancer", color: "pink" }
        ];
    }
    console.log("Legend Data:", legendData);
    
    let legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin", "5px");

    // Add color swatch
    legendItems.append("span")
        .style("display", "inline-block")
        .style("width", "16px")
        .style("height", "16px")
        .style("margin-right", "5px")
        .style("border-radius", "50%")
        .style("background-color", d => d.color);

    // Add legend text
    legendItems.append("span")
        .text(d => d.label)
        .style("font-size", "18px")
        .style("color", "#333");
    }


    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentState);
        });
    }

    function updateAll() {
        updateDots();
        let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);
        Object.keys(surgeryData).forEach(optype => updatePieChart(optype, totalSurgeries));
    }

    nextButton.addEventListener("click", function () {
        if (currentState < dots.length - 1) {
            currentState++;
            updateAll();
        }
    });

    previousButton.addEventListener("click", function () {
        if (currentState > 0) {
            currentState--;
            updateAll();
        }
    });

    updateDots();
    function updateArrows() {
        arrowSvg.selectAll("*").remove();

        document.querySelectorAll(".organ").forEach(organ => {
            let chartId = organ.dataset.chart;
            let chart = document.getElementById(chartId);
            if (!chart) return;

            let organRect = organ.getBoundingClientRect();
            let chartRect = chart.getBoundingClientRect();

            let organX = organRect.left + organRect.width / 2;
            let organY = organRect.top + organRect.height / 2;
            let chartX = chartRect.left + chartRect.width / 2;
            let chartY = chartRect.top + chartRect.height / 2;

            arrowSvg.append("line")
                .attr("x1", organX)
                .attr("y1", organY)
                .attr("x2", chartX)
                .attr("y2", chartY)
                .attr("stroke", "black")
                .attr("stroke-width", "2")
                .attr("marker-end", "url(#arrowhead)");
        });

        arrowSvg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", "8")
            .attr("refY", "5")
            .attr("markerWidth", "6")
            .attr("markerHeight", "6")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "black");
    }
});