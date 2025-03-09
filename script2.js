
  
document.addEventListener("DOMContentLoaded", function () {
    let currentState = 0;
    let surgeryData = {};
    let cancerData = {};
    let genderData = {};
    let svgElements = {};
    let width = 120, height = 120, radius = Math.min(width, height) / 2;
  
    const dots = document.querySelectorAll(".dot");
    const previousButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");
  
    let title = d3.select("#title").append("h2")
      .attr("id", "status-title")
      .style("text-align", "center")
    
    const mainContainer = d3.select("#main-container")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("width", "100%")
      .style("margin", "0 auto");
  
    // Create the center container for the body image
    const centerContainer = mainContainer.append("div")
      .attr("id", "center-container")
      .attr("position", "relative")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("width", "1100px") // Adjust as needed for your SVG size
      .style("height", "500px"); // Adjust as needed for your SVG size

    // Create a container for all charts that will be positioned around the SVG
    const chartsContainer = mainContainer.append("div")
      .attr("id", "charts-container")
      .style("position", "relative")
      .style("display", "grid")
      .style("grid-template-columns", "7fr 7fr")
      .style("grid-gap", "80px")
      .style("width", "100%")
      .style("max-width", "1200px")
      .style("margin", "20px auto");


    const arrowsSvg = centerContainer.append("svg")
      .attr("id", "arrows-svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "none")
      .style("z-index", "2");
    

    
    const positions = [
        { id: "Lymphatic-Endocrine", x: "-350px", y: "0.5px", label: "Lymphatic/Endocrine System", organId: "Thyroid", organName: "Thyroid" },
        { id: "Cardiovascular", x: "450px", y: "0.5px", label: "Cardiovascular System", organId: "Heart", organName: "Heart" },
        { id: "Digestive", x: "-300px", y: "15px", label: "Digestive System", organId: "Stomach", organName: "Stomach" },
        { id: "Hepatic", x: "350px", y: "15px", label: "Hepatic System", organId: "Liver", organName: "Liver" },
        { id: "Pancreatic-Billiary", x: "-300px", y: "8px", label: "Pancreatic/Billiary System", organId: "Pancreas", organName: "Pancreas" },
        { id: "Colorectal", x: "-350px", y: "8px", label: "Colorectal System", organId: "Intestines", organName: "Intestines" },
        { id: "Urinary", x: "-300px", y: "10px", label: "Urinary System", organId: "Kidneys", organName: "Kidneys" },
        { id: "Reproductive", x: "0px", y: "30px", label: "Reproductive System", organId: "Female_RS", organName: "Reproductive" }
    ];
 
    positions.forEach(pos => {
        const container = chartsContainer.append("div")
            .attr("id", `chart-container-${pos.id}`)
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("width", "240px")
            .style("height", "280px") 
            .style("text-align", "center")
            .style("transform", "translate(-50%, -50%)")
            .style("left", `calc(50% + ${pos.x})`) 
            .style("top", `calc(50% + ${pos.y})`) 
            .style("background", "rgba(255, 255, 255, 0.8)") 
            .style("border-radius", "8px")
            .style("padding", "8px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
  
     
        container.append("h4")
            .text(pos.label)
            .style("margin", "0 0 1px 0");

        container.append("img")
            .attr("src", `Images/${pos.organId}.png`)  
            .attr("width", "60px")
            .attr("height", "60px")
            .style("margin-bottom", "2px");
    
        container.append("div")
            .attr("id", `chart-${pos.id}`)
            .style("text-align", "center")
            .style("align-items", "center")
            .style("width", "170px")
            .style("height", "170px");
    

        container.append("div")
            .attr("class", "chart-text")
            .attr("id", `text-${pos.id}`)
            .style("font-size", "12px")
            .style("margin-bottom", "5px")
            .style("height", "40px");
        });



    d3.csv("sugeries.csv").then(function (data) {
        processData(data);

        d3.xml("Images/only_organs_nobg.png").then(function (xml) {
            let importedNode = document.importNode(xml.documentElement, true);
            centerContainer.node().appendChild(importedNode);
            
            const bodySvg = centerContainer.select("img");
            

            bodySvg.attr("width", "100%").attr("height", "100%")
                .style("position", "relative")
          
            setTimeout(() => {
                
                positions.forEach(pos => {
                    pos.element = document.getElementById(pos.organId);
                    if (!pos.element) {
                        console.warn(`Organ element #${pos.organId} not found`);
                    }
                });
                
                createPieCharts();
                updateAll();
                
              
                positions.forEach(pos => {
                    d3.select(`#chart-container-${pos.id}`)
                        .style("cursor", "pointer")
                        .on("mouseenter", () => {
                            showOrganConnection(pos);
                        })
                        .on("mouseleave", () => {
                            hideOrganConnections();
                        });
                });
            }, 500);
        });
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
          }
        });
      }
    
    function createPieCharts() {
        let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);

        positions.forEach(pos => {
            let container = chartsContainer.select(`#chart-${pos.id}`);
            
            if (container.empty()) {
                console.warn(`Missing container: chart-${pos.id}`);
            return;
            }

            console.log(`Creating pie chart for ${pos.id}`);

            if (!svgElements[pos.id]) {
                let svg = container.append("svg")
                    .attr("width", 200)
                    .attr("height", 200)
                    .style("overflow", "visible")
                    .append("g")
                    .attr("transform", `translate(100, 100)`);
                svgElements[pos.id] = svg;
            }
            updatePieChart(pos.id, totalSurgeries);
        });
    }

    function updatePieChart(optype, totalSurgeries) {
        let total = surgeryData[optype] || 0;
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
                { label: optype, value: total || 1, color: "red" },
                { label: "Other Surgeries", value: totalSurgeries - total, color: "lightgrey" }
            ];
            color = "red";
            textContent = `Out of all surgeries, <b style="color:${color}"> ${optype}</b> constituted <b style="color:${color}">${percent}%</b>.`;
        } else if (currentState === 1) {
            let percent = total === 0 ? 0 : Math.round((totalCancer / total) * 100);
            data = [
                { label: "Cancer", value: totalCancer || 1, color: "orange" },
                { label: "Other", value: total - totalCancer || 1, color: "lightgrey" }
            ];
            color = "orange";
            textContent = `Out of all <b style="color:${color}">${optype}</b> surgeries, <b style="color:${color}">${percent}%</b> were cancer diagnoses.`;
        } else {
            // Third toggle state: Split Cancer into Male/Female directly
            let percentMale = totalCancer === 0 ? 0 : Math.round((maleCases / totalCancer) * 100);
            let percentFemale = totalCancer === 0 ? 0 : Math.round((femaleCases / totalCancer) * 100);
            data = [
                { label: "Non-Cancer", value: nonCancerCases || 1, color: "lightgrey" },
                { label: "Male Cancer", value: maleCases || 1, color: "lightblue" },
                { label: "Female Cancer", value: femaleCases || 1, color: "pink" }
            ];
            textContent = `Women made up <b style="color:pink">${percentFemale}%</b> and men <b style="color:lightblue">${percentMale}%</b> of the cancer diagnoses.`;
        }
        
        d3.select(`#text-${optype}`).html(textContent);

        let pie = d3.pie().value(d => d.value);
        let arc = d3.arc().innerRadius(0).outerRadius(radius);

        let svg = svgElements[optype];
        if (!svg) return;

        let paths = svg.selectAll("path").data(pie(data.filter(d => d.value > 0)));

        paths.transition()
            .duration(500)
            .attrTween("d", function (d) {
                let interpolator = d3.interpolate(this._current || d, d);
                this._current = interpolator(1);
                return function (t) {
                    return arc(interpolator(t));
                };
            })
            .attr("fill", d => d.data.color);

        paths.enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .each(function (d) { this._current = d; }) // Store current state for transitions
            .transition()
            .duration(500)
            .attrTween("d", function (d) {
                let interpolator = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function (t) {
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
                let angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2; // Midpoint of slice
                let isLargest = d.data.value === d3.max(data, d => d.value);
                let offset = isLargest ? radius * 0.5 : radius * 1.1;
                let x = Math.cos(angle) * offset;
                let y = Math.sin(angle) * offset;
                return `translate(${x}, ${y})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);

        text.exit().remove();
    }
    function showOrganConnection(pos) {
        drawConnectingArrows() 
        arrowsSvg.selectAll("*").remove();

        if (!pos.element) return;

        arrowsSvg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#555");

        // Highlight the organ in the SVG
        if (pos.element) {
            d3.select(pos.element)
                .style("filter", "drop-shadow(0 0 5px red)")
                .style("opacity", 1);
        }

        // Get the position of the organ in the SVG
        const organRect = pos.element.getBoundingClientRect();
        const svgRect = centerContainer.node().getBoundingClientRect();
        
        // Get the position of the chart container
        const chartRect = document.getElementById(`chart-container-${pos.id}`).getBoundingClientRect();
        
        // Calculate positions relative to the SVG container
        const organX = organRect.left + organRect.width/2 - svgRect.left;
        const organY = organRect.top + organRect.height/2 - svgRect.top;
        
        // Calculate target position on edge of SVG nearest to chart
        const svgCenterX = svgRect.width/2;
        const svgCenterY = svgRect.height/2;
        
        // Draw a line from organ to the edge of SVG in direction of chart
        const angle = Math.atan2(chartRect.top - svgRect.top - svgCenterY, chartRect.left - svgRect.left - svgCenterX);
        const edgeX = svgCenterX + Math.cos(angle) * (svgRect.width/2 - 10);
        const edgeY = svgCenterY + Math.sin(angle) * (svgRect.height/2 - 10);
        
        // Add curve between organ and edge of SVG
        arrowsSvg.append("path")
            .attr("d", `M${organX},${organY} L${edgeX},${edgeY}`)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,3")
            .attr("marker-end", "url(#arrowhead)")
            .style("opacity", 0.8);
    }

    // Function to hide all connections
    function hideOrganConnections() {
        arrowsSvg.selectAll("*").remove();
        
        // Remove highlighting from all organs
        positions.forEach(pos => {
            if (pos.element) {
                d3.select(pos.element)
                    .style("filter", null)
                    .style("opacity", null);
            }
            
        });
        drawConnectingArrows() 
    }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
        updateDots();
        
        positions.forEach(pos => {
            updatePieChart(pos.id, totalSurgeries);
        });
    }

    function updateTitle() {
        const titles = [
            "An analysis of the Distribution of Surgeries by Organs and Systems",
            "The Distribution of Surgeries with Cancer vs Non-Cancer Diagnoses",
            "A Comparison of Female vs Male Cancer Diagnoses by Organs and Organ Systems"
        ];
        title.text(titles[currentState]);
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
            .style("top", "100px")
            .style("right", "20px")
            .style("background", "white")
            .style("padding", "10px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "5px");

        let legendData;
        if (currentState === 0) {
            legendData = [
                { label: "All Other Surgeries", color: "lightgrey" },
                { label: "System-specific Surgery", color: "red" }
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

        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px")
            .html(d => `<span style="background-color:${d.color}; width:16px; height:16px; margin-right:5px; display:inline-block; border-radius:50%;"></span>${d.label}`);
    }

    // Add window resize handler
    window.addEventListener("resize", () => {
        hideOrganConnections();
    });

    nextButton.addEventListener("click", function () {
        currentState = (currentState + 1) % 3;
        updateAll();
        hideOrganConnections();
    });

    previousButton.addEventListener("click", function () {
        currentState = (currentState - 1 + 3) % 3;
        updateAll();
        hideOrganConnections();
    });

    function drawConnectingArrows() {
        arrowsSvg.selectAll("*").remove();
    
        arrowsSvg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#555");
    
        setTimeout(() => {
            const bodyRect = document.getElementById("body-image").getBoundingClientRect();
    
            positions.forEach(pos => {
                const chartContainer = d3.select(`#chart-container-${pos.id}`).node();
                if (!chartContainer) return;
    
                const chartRect = chartContainer.getBoundingClientRect();
    
                // Approximate organ positions manually
                const organX = bodyRect.left + bodyRect.width / 2 + parseFloat(pos.x) * 0.6;
                const organY = bodyRect.top + bodyRect.height / 2 + parseFloat(pos.y) * 0.6;
    
                // Calculate chart position
                const chartX = chartRect.left + chartRect.width / 2;
                const chartY = chartRect.top + chartRect.height / 2;
    
                const midX = (organX + chartX) / 2;
                const midY = (organY + chartY) / 2;
    
                arrowsSvg.append("path")
                    .attr("d", `M${organX},${organY} Q${midX},${midY} ${chartX},${chartY}`)
                    .attr("fill", "none")
                    .attr("stroke", "#555")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,3")
                    .attr("marker-end", "url(#arrowhead)");
            });
        }, 500);
    }
    

    // Initial update
    updateAll();
});