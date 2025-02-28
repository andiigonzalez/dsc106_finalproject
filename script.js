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

    d3.csv("sugeries.csv").then(function (data) {
        processData(data);
        createPieCharts();
        updateLegend();
        updateDots();
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
  }

  function updatePieChart(optype, totalSurgeries) {
    let total = surgeryData[optype];
    let totalCancer = cancerData[optype] || 0;
    let maleCases = genderData[optype]?.M || 0;
    let femaleCases = genderData[optype]?.F || 0;
    let nonCancerCases = total - totalCancer;
    let data;
    if (currentState === 0) {
        data = [
            { label: optype, value: surgeryData[optype], color: "red" },
            { label: "Other Surgeries", value: totalSurgeries - surgeryData[optype], color: "grey" }
        ];
    } else if (currentState === 1) {
        let total = surgeryData[optype];
        let cancerCases = cancerData[optype] || 0;
        data = [
            { label: "Cancer", value: cancerCases, color: "orange" },
            { label: "Other", value: total - cancerCases, color: "grey" }];
      } else {
        // Third toggle state: Split Cancer into Male/Female directly
        data = [
            { label: "Non-Cancer", value: nonCancerCases, color: "grey" },
            { label: "Male Cancer", value: maleCases, color: "blue" },
            { label: "Female Cancer", value: femaleCases, color: "pink" }
        ];
      }
        
  
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
    updateLegend();
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
            { label: "All Other Surgeries", color: "grey" },
            { label: "Surgery", color: "red" }
        ];
    } else if (currentState === 1) {
        legendData = [
            { label: "Cancer", color: "orange" },
            { label: "Non-Cancer", color: "grey" }
        ];
    } else {
        legendData = [
            { label: "Non-Cancer", color: "grey" },
            { label: "Male Cancer", color: "blue" },
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
});