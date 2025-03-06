function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }
  
  const ARE_WE_HOME = document.documentElement.classList.contains("Home");
  
  const pages = [
    { url: "", title: "Home" },
    { url: "https://andiigonzalez.github.io/dsc106_finalproject/index2.html", title: "Different Layout Try" },
    { url: "https://andiigonzalez.github.io/dsc106_finalproject/writeup.html", title: 'Writeup' }
  ];
  
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
    
    const mainContainer = d3.select("#main-container")
      .style("position", "relative")
      .style("display", "grid")
      .style("grid-template-columns", "1fr")
      .style("grid-template-rows", "auto")
      .style("width", "100%")
      .style("height", "100vh")
      .style("margin", "0 auto");
  
    // Create the center container for the body image
    const centerContainer = mainContainer.append("div")
      .attr("id", "center-container")
      .style("position", "relative")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("grid-column", "1")
      .style("grid-row", "1")
      .style("z-index", "1");
  
    const svgContainer = d3.select("#body_image")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("position", "relative");


    const arrowsSvg = mainContainer.append("svg")
      .attr("id", "arrows-svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "none")
      .style("z-index", "0");
    
    // Create containers for charts positioned around the center
    const positions = [
      { id: "Lymphatic-Endocrine", x: "right", y: "top", label: "Lymphatic/Endocrine System", organId: "thyroid" },
      { id: "Cardiovascular", x: "left", y: "top", label: "Cardiovascular System", organId: "heart" },
      { id: "Digestive", x: "right", y: "middle", label: "Digestive System", organId: "stomach" },
      { id: "Hepatic", x: "left", y: "middle", label: "Hepatic System", organId: "liver" },
      { id: "Urinary", x: "right", y: "bottom", label: "Urinary System", organId: "kidneys" },
      { id: "Reproductive", x: "left", y: "bottom", label: "Reproductive System", organId: "reproductive" }
    ];
  
    // Create chart containers around the center
    positions.forEach(pos => {
        const container = mainContainer.append("div")
            .attr("id", `chart-container-${pos.id}`)
            .style("position", "absolute")
            .style("width", "220px")
            .style("text-align", "center");
  
      // Position containers around the center
        if (pos.x === "left") container.style("left", "10%");
        else if (pos.x === "right") container.style("right", "10%");
        else container.style("left", "calc(50% - 110px)"); // center
      
        if (pos.y === "top") container.style("top", "10%");
        else if (pos.y === "bottom") container.style("bottom", "10%");
        else container.style("top", "calc(50% - 110px)"); // middle
    
        // Create title for each chart
        container.append("h4")
            .text(pos.label)
            .style("margin", "0 0 5px 0");
    
        // Create chart div
        container.append("div")
            .attr("id", `chart-${pos.id}`)
            .style("width", "220px")
            .style("height", "200px");
    
        // Add text placeholder for chart description
        container.append("div")
            .attr("class", "chart-text")
            .style("font-size", "12px")
            .style("margin-top", "5px")
            .style("height", "40px");
        });
    
    // Create a separate organs object to store organ data
    const organs = {
        "heart": { name: "Heart", pieId: "Cardiovascular" },
        "stomach": { name: "Stomach/Intestines", pieId: "Digestive" },
        "kidneys": { name: "Kidneys & Bladder", pieId: "Urinary" },
        "reproductive": { name: "Reproductive System", pieId: "Reproductive" },
        "liver": { name: "Liver", pieId: "Hepatic" },
        "thyroid": { name: "Thyroid", pieId: "Lymphatic-Endocrine" }
        };


    d3.csv("sugeries.csv").then(function (data) {
        processData(data);

        d3.xml("Images/only_organs_removebg.svg").then(function (xml) {
            let importedNode = document.importNode(xml.documentElement, true);
            centerContainer.node().appendChild(importedNode);
      
            let anatomySvg = d3.select("#center-container svg")
                .attr("width", 400)
                .attr("height", 600)
                .style("margin", "0 auto");
      
            setupOrganInteractions(anatomySvg);
            createPieCharts();
            setTimeout(drawConnectingArrows, 500);
            updateAll();
          });
      });


    function setupOrganInteractions(anatomySvg) {
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("display", "none")
            .style("z-index", "100");

        // Setup interactions for each organ
        Object.keys(organs).forEach(function (organId) {
            let organ = anatomySvg.select(`#${organId}`);
            if (organ.empty()) {
                console.warn(`Organ with ID "${organId}" not found in SVG`);
                return;
            }

        organ.style("cursor", "pointer")
        .on("mouseover", function (event) {
            d3.select(this).style("stroke", "yellow").style("stroke-width", "3px");
            let organName = organs[organId].name;
            let pieId = organs[organId].pieId;
            let surgeryCount = surgeryData[pieId] || 0;
            let maleCount = genderData[pieId]?.M || 0;
            let femaleCount = genderData[pieId]?.F || 0;
            let total = maleCount + femaleCount;
            let malePercent = total === 0 ? 0 : Math.round((maleCount / total) * 100);
            let femalePercent = total === 0 ? 0 : Math.round((femaleCount / total) * 100);

            // Highlight the corresponding chart container
            d3.select(`#chart-container-${pieId}`).style("background-color", "rgba(255, 255, 0, 0.1)")
                .style("border", "2px solid yellow")
                .style("border-radius", "5px");

            tooltip.style("display", "block")
                .html(`<b>${organName}</b><br>Surgeries: ${surgeryCount}<br>Male: ${malePercent}%<br>Female: ${femalePercent}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            
            .on("mouseout", function () {
                d3.select(this).style("stroke", "none");
                    let pieId = organs[organId].pieId;
                d3.select(`#chart-container-${pieId}`)
                    .style("background-color", "transparent")
                    .style("border", "none");
                    
                tooltip.style("display", "none");
             });
            });
        }

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
            let container = d3.select(`#chart-${pos.id}`);
            
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
            
            // Add an organ image next to each pie chart
            container.append("img")
                .attr("src", `Images/${pos.organId}.svg`)
                .attr("width", 50)
                .attr("height", 50)
                .style("position", "absolute")
                .style("top", "0")
                .style("right", "0");
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
        
        d3.select(`#chart-${optype} + .chart-text`).html(textContent);

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

        function drawConnectingArrows() {
        // Clear existing arrows
        arrowsSvg.selectAll("*").remove();

        // Add marker definition for arrow
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

    // Get positions after elements are rendered
        setTimeout(() => {
            const centerRect = centerContainer.node().getBoundingClientRect();
            const centerX = centerRect.left + centerRect.width / 2;
            const centerY = centerRect.top + centerRect.height / 2;
            
            positions.forEach(pos => {
            // Find the organ element
            const organEl = d3.select(`#${pos.organId}`).node();
            if (!organEl) return;
            
            const organRect = organEl.getBoundingClientRect();
            const organX = organRect.left + organRect.width / 2;
            const organY = organRect.top + organRect.height / 2;
            
            // Find the chart container
            const chartContainer = d3.select(`#chart-container-${pos.id}`).node();
            if (!chartContainer) return;
            
            const chartRect = chartContainer.getBoundingClientRect();
            const chartX = chartRect.left + chartRect.width / 2;
            const chartY = chartRect.top + chartRect.height / 2;
            
            // Calculate control point for curved line
            const midX = (organX + chartX) / 2;
            const midY = (organY + chartY) / 2;
            
            // Add curve between organ and chart
            arrowsSvg.append("path")
                .attr("d", `M${organX},${organY} Q${midX},${midY} ${chartX},${chartY}`)
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,3")
                .attr("marker-end", "url(#arrowhead)");
            });
        }, 500); // Give time for initial render
        }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
        updateDots();
        
        positions.forEach(pos => {
            updatePieChart(pos.id, totalSurgeries);
        });
        
        // Redraw arrows when state changes
        drawConnectingArrows();
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
            .html(d => `<span style="background-color:${d.color}; width:16px; height:16px; margin-right:5px; border-radius:50%;"></span>${d.label}`);
        }

        // Add window resize handler for responsive behavior
        window.addEventListener("resize", () => {
            drawConnectingArrows();
        });

        nextButton.addEventListener("click", function () {
            currentState = (currentState + 1) % 3;
            updateAll();
        });

        previousButton.addEventListener("click", function () {
            currentState = (currentState - 1 + 3) % 3;
            updateAll();
        });

        // Initial update
        updateAll();
});



    