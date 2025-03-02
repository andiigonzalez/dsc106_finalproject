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


    let title = d3.select("#title").append("h2")
        .attr("id", "status-title")
        .style("text-align", "center")
        .style("margin-bottom", "18px");


    d3.csv("sugeries.csv").then(function (data) {
        processData(data);
        createPieCharts();
        updateAll();
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
        let container = d3.select(`#chart-${optype}`)
            .style("min-height", "250px")  // More space
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("justify-content", "center");

        if (container.empty()) {
            console.warn(`Missing container: chart-${optype}`);
            return;
        }

        if (!svgElements[optype]) {
            let svg = container.append("svg")
                .attr("width", width + 50)  // Increase width
                .attr("height", height + 50)  // Increase height
                .style("overflow", "visible")  // Ensure nothing gets cut off
                .append("g")
                .attr("transform", `translate(${(width + 50) / 2}, ${(height + 50) / 2})`);
        
            svgElements[optype] = svg;
        }

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

    paths.transition()
            .duration(500)
            .attrTween("d", function(d) {
                let interpolator = d3.interpolate(this._current || d, d);
                this._current = interpolator(1);
                return function(t) {
                    return arc(interpolator(t));
                };
            })
            .attr("fill", d => d.data.color);

    
    paths.enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .each(function(d) { this._current = d; }) // Store current state for transitions
        .transition()
        .duration(500)
        .attrTween("d", function(d) {
            let interpolator = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
                return arc(interpolator(t));
            };
        });

    paths.exit().remove();

    let text = svg.selectAll("text").data(pie(data));

    text.enter().append("text")
        .merge(text)
        .transition()
        .duration(500)
        .attr("transform", d => {
        
            let angle = (d.startAngle + d.endAngle) / 2 -Math.PI/2; // Midpoint of slice
            let isLargest = d.data.value === d3.max(data, d => d.value);

            let offset = isLargest ? -radius * 0.2 : radius +45; 
            let x = Math.cos(angle) * offset;
            let y = Math.sin(angle) * offset + radius * 0.5

            return `translate(${x}, ${y})`;
        })
        .attr("text-anchor", "middle") // Ensures proper centering
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);




        text.exit().remove();
    }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
        updateDots();

        if (currentState === 3) {
            showComparisonLayout(totalSurgeries);
        } else {
            Object.keys(surgeryData).forEach(optype => updatePieChart(optype, totalSurgeries));
        }
    }

    function updateTitle() {
        const titles = [
            "An analysis of the Distribution of Surgeries by Organs and Systems",
            "The Distribution of Surgeries with Cancer vs Non-Cancer Diagnoses",
            "A Comparison of Female vs Male Cancer Diagnoses by Organs and Organ Systems"
        ];
        title.text(titles[currentState]);
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


    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentState);
        });
    }

    function updateLegend() {
        d3.select("#legend").remove();
        let legend = d3.select("body").append("div")
            .attr("id", "legend")
            .style("position", "absolute")
            .style("top", "10px")
            .style("right", "10px")
            .style("background", "white")
            .style("padding", "10px");

        let legendData = [
            { label: "All Other Surgeries", color: "lightgrey" },
            { label: "Surgery", color: "red" }
        ];

        if (currentState === 1) {
            legendData = [
                { label: "Cancer", color: "orange" },
                { label: "Non-Cancer", color: "lightgrey" }
            ];
        } else if (currentState === 2) {
            legendData = [
                { label: "Non-Cancer", color: "lightgrey" },
                { label: "Male Cancer", color: "lightblue" },
                { label: "Female Cancer", color: "pink" }
            ];
        }

        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .html(d => `<span style="background-color:${d.color}; width:16px; height:16px; margin-right:5px; border-radius:50%;"></span>${d.label}`);
    }

    nextButton.addEventListener("click", function () {
        currentState = (currentState + 1) % 4;
        updateAll();
    });

    previousButton.addEventListener("click", function () {
        currentState = (currentState - 1 + 4) % 4;
        updateAll();
    });

    updateAll();
});