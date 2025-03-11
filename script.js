document.addEventListener("DOMContentLoaded", function () {
    let currentState = 0;
    let surgeryData = {};
    let cancerData = {};
    let genderData = {};
    let svgElements = {};
    let width = 150, height = 150, radius = Math.min(width, height) / 2;
  
    const steps = document.querySelectorAll(".step");
  
    let title = d3.select("#title").append("h2")
        .attr("id", "status-title")
        .style("text-align", "center");
    
    const mainContainer = d3.select("#main-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("width", "100%")
        .style("max-width", "1200px")
        .style("margin", "0 auto");

    const scroller = scrollama();

    const visualizationWrapper = mainContainer.append("div")
        .attr("id", "visualization-wrapper")
        .style("display", "flex")
        .style("flex-direction", "row") // Ensure horizontal layout
        .style("justify-content", "space-between") 
        .style("width", "100%")
        .style("position", "relative")
        .style("margin-top", "10px")
        .style("height", "900px");


    const leftChartsContainer = visualizationWrapper.append("div")
        .attr("id", "left-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "30%")
        .style("padding-right", "20px")
        .style("z-index", "1");

    const centerContainer = visualizationWrapper.append("div")
    .attr("id", "center-container")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("width", "40%") 
    .style("height", "80vh") // Adjust height to fill viewport properly
    .style("position", "relative")
    .style("top", "0px") // Ensure it aligns with the top
    .style("z-index", "0");

    const rightChartsContainer = visualizationWrapper.append("div")
        .attr("id", "right-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "30%")
        .style("padding-left", "20px")
        .style("z-index", "1");


    const arrowsSvg = centerContainer.append("svg")
      .attr("id", "arrows-svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "none")
      .style("z-index", "2");


    const leftPositions = [
        { id: "Lymphatic-Endocrine", label: "Lymphatic/Endocrine System", organId: "Thyroid", organName: "Thyroid" },
        { id: "Digestive", label: "Digestive System", organId: "Stomach", organName: "Stomach" },
        { id: "Pancreatic-Billiary", label: "Pancreatic/Billiary System", organId: "Pancreas", organName: "Pancreas" },
        { id: "Urinary", label: "Urinary System", organId: "Kidneys", organName: "Kidneys" }
    ];
    
    const rightPositions = [
        { id: "Cardiovascular", label: "Cardiovascular System", organId: "Heart", organName: "Heart" },
        { id: "Hepatic", label: "Hepatic System", organId: "Liver", organName: "Liver" },
        { id: "Colorectal", label: "Colorectal System", organId: "Intestines", organName: "Intestines" },
        { id: "Reproductive", label: "Reproductive System", organId: "Female_RS", organName: "Reproductive" }
    ];

    const positions = [...leftPositions, ...rightPositions];

    leftPositions.forEach(pos => createChartContainer(leftChartsContainer, pos));
    rightPositions.forEach(pos => createChartContainer(rightChartsContainer, pos));

    d3.csv("sugeries.csv").then(function (data) {
        processData(data);
        createPieCharts();
        updateAll();

        d3.xml("Images/only_organs_removebg.svg").then(function (xml) {

            const svgContainer = centerContainer.append("div")
                .attr("id", "svg-container")
                .style("width", "50%")
                .style("display", "flex")
                .style("height", "50vh")
                .style("justify-content", "center")
                .style("align-items", "center")
                .style("position", "relative")
                .style("top", "-100px") // Move up by 100px
                .style("left", "70px") // Move right by 70px
                .style("z-index", "0");



            let importedNode = document.importNode(xml.documentElement, true);
            importedNode.id = "body-svg";

            importedNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
            importedNode.setAttribute("width", "100%");
            importedNode.setAttribute("height", "100vh");
            importedNode.setAttribute("viewBox", "0 0 400 800"); // Adjust viewBox to match your SVG content
            
            svgContainer.node().appendChild(importedNode);
            setTimeout(() => {
                // Find and store organ elements
                positions.forEach(pos => {
                    pos.element = document.getElementById(pos.organId);
                    if (!pos.element) {
                        console.warn(`Organ element #${pos.organId} not found`);
                    }
                });
                
                // Initialize pie charts now that containers exist
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

    function createChartContainer(parentContainer, pos) {
        const container = parentContainer.append("div")
            .attr("id", `chart-container-${pos.id}`)
            .style("display", "flex")
            .style("flex-direction", "row") // New row-based layout
            .style("align-items", "center")
            .style("justify-content", "space-between") // Space elements correctly
            .style("margin", "10px 0")
            .style("padding", "10px")
            .style("background", "transparent")
            .style("border-radius", "8px")
            .style("box-shadow", "0 2px 4px rgba(110, 110, 110, 0.1)")
            .style("width", "100%")
            .style("height", "130px") // Reduce height
            .style("position", "relative");

        const leftSection = container.append("div")
            .style("display", "flex")
            .style("flex-direction", "column") // Stack title and organ/image in a column
            .style("align-items", "center")
            .style("width", "40%"); // Left side takes 40%

        leftSection.append("h4")
            .text(pos.label)
            .style("margin-bottom", "5px")
            .style("font-size", "14px")
            .style("text-align", "center");

        // Append Organ Image & Pie Chart
        const organChartWrapper = leftSection.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("gap", "10px");

        organChartWrapper.append("img")
            .attr("src", `Images/${pos.organId}.png`)
            .attr("width", "50px") // Adjust size
            .attr("height", "50px");

        organChartWrapper.append("div")
            .attr("id", `chart-${pos.id}`)
            .style("width", "90px")
            .style("height", "90px")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center");

        // Right section for the description
        const rightSection = container.append("div")
            .attr("class", "chart-text")
            .attr("id", `text-${pos.id}`)
            .style("width", "55%") // Right section takes 55%
            .style("font-size", "14px")
            .style("text-align", "left");

    }


    function processData(data) {
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
    
            container.selectAll("svg").remove();

            let svg = container.append("svg")
                .attr("width", "200")
                .attr("height", "200")
                .style("overflow", "visible")
                .style("position", "relative")
                .style("margin", "0 auto");
    
            svgElements[pos.id] = svg;
    
            updatePieChart(pos.id, totalSurgeries);
        });
    }

    function updatePieChart(optype, totalSurgeries) {
        let total = surgeryData[optype] || 0;
        let totalCancer = cancerData[optype] || 0;
        let maleCases = genderData[optype]?.M || 0;
        let maleCancer = cancerData[optype]?.M || 0;
        let maleNonCancer =  maleCases - maleCancer || 0;
        let femaleCancer = cancerData[optype]?.F || 0;
        let femaleCases = genderData[optype]?.F || 0;
        let femaleNonCancer = femaleCases-femaleCancer|| 0;
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
        } else if (currentState === 2)  {
            // Third toggle state: Split Cancer into Male/Female directly
            let percentMale = totalCancer === 0 ? 0 : Math.round((maleCancer / totalCancer) * 100);
            let percentFemale = totalCancer === 0 ? 0 : Math.round((femaleCancer / totalCancer) * 100);
            data = [
                { label: "Non-Cancer", value: nonCancerCases || 1, color: "lightgrey" },
                { label: "Male Cancer", value: maleCases || 1, color: "lightblue" },
                { label: "Female Cancer", value: femaleCases || 1, color: "pink" }
            ];
            textContent = `Women made up <b style="color:pink">${percentFemale}%</b> and men <b style="color:lightblue">${percentMale}%</b> of the cancer diagnoses.`;
        } else if (currentState === 3) {
            data1 = [
                { label: optype, value: total || 1, color: "red" },
                { label: "Other Surgeries", value: totalSurgeries - total, color: "lightgrey" }
            ];
            color1 = "red";
            let percentCancerMale = maleCases=== 0 ? 0 : Math.round((maleCancer / maleCases) * 100);
            let percentNonCancerMale = maleCases === 0 ? 0 : Math.round((maleNonCancer / totalCancer) * 100);
            let percentCancerFeale = femaleCases=== 0 ? 0 : Math.round((femaleCancer / femaleCases) * 100);
            let percentNonCancerFeale = femaleCases === 0 ? 0 : Math.round((femaleNonCancer / femaleCancer) * 100);
            data2 = [
                { label: "Male Cases Non cancer ", value: percentNonCancerMale || 1, color: "lightgrey" },
                { label: "Male Cases Cancer", value: percentCancerMale  || 1, color: "lightblue" },
            ];
            color2 = "lightblue";
            data3 = [
                { label: "Female Cases Non cancer ", value: percentNonCancerFeale || 1, color: "lightgrey" },
                { label: "Female Cases Cancer", value: percentCancerFeale  || 1, color: "lightblue" },
            ];
            color3 = "pink";
        }

            
        
        d3.select(`#text-${optype}`).html(textContent);

        let pie = d3.pie().value(d => d.value);
        let radius = 35;
        let arc = d3.arc().innerRadius(0).outerRadius(radius);

        let svg = svgElements[optype];
        if (!svg) return;

        let g = svg.selectAll('.pie-container').data([null]);
        
        g = g.enter()
            .append('g')
            .attr('class', 'pie-container')
            .attr('transform', 'translate(100,100)')
            .merge(g);

        // Update paths with transitions
        let paths = g.selectAll("path").data(pie(data.filter(d => d.value > 0)));



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

        paths.exit()
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        let text = g.selectAll(".pie-text").data(pie(data));

        text.enter()
            .append("text")
            .attr("class", "pie-text")
            .merge(text)
            .transition()
            .duration(500)
            .attr("transform", d => {
                let centroid = arc.centroid(d); // Get label position inside slice
                let x = centroid[0] * 0.85;  // Adjust slightly inward
                let y = centroid[1] * 0.85;

                return `translate(${x}, ${y})`; // No rotation, keeps text always upright
            })
            .attr("text-anchor", "middle") // Ensures proper horizontal alignment
            .attr("dy", "0.35em") // Keeps vertical alignment centered
            .style("font-size", "10px") // Keeps text small for readability
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(d => {
                let percentage = Math.round(d.data.value / d3.sum(data, d => d.value) * 100);
                return percentage > 5 ? `${percentage}%` : ""; // Hide very small percentages
            });

        text.exit().remove();

    }

    
    function showOrganConnection(pos) {
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

 
        if (pos.element) {
            d3.select(pos.element)
                .style("filter", "drop-shadow(0 0 5px red)")
                .style("opacity", 1);
        }


        const centerRect = centerContainer.node().getBoundingClientRect();
        const organRect = pos.element.getBoundingClientRect();
        const chartContainer = document.getElementById(`chart-container-${pos.id}`);
        const chartRect = chartContainer.getBoundingClientRect();
        
        // Calculate coordinates relative to the arrowsSvg
        const organX = organRect.left + organRect.width/2 - centerRect.left;
        const organY = organRect.top + organRect.height/2 - centerRect.top;
        const chartX = chartRect.left + chartRect.width/2 - centerRect.left;
        const chartY = chartRect.top + chartRect.height/2 - centerRect.top;
        
  
        arrowsSvg.append("path")
            .attr("d", `M${organX},${organY} L${chartX},${chartY}`)
            .attr("fill", "black")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,3")
            .attr("marker-end", "url(#arrowhead)")
            .style("opacity", 0.8);
    }

 
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
    }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
    
        console.log("Current state:", currentState);
    
        positions.forEach(pos => {
            //console.log(`Updating pie chart for ${pos.id}`);
            updatePieChart(pos.id, totalSurgeries);
        });
    }
    

    function updateTitle() {
        const titles = [
            "Analysis of the Distribution of Surgeries by Organs and Systems",
            "Distribution of Surgeries Related to Cancer Diagnoses",
            "Comparison of Surgeries Performed on Female and Male Cancer Patients by Organ Systems",
            "Who? What? Where?"
        ];
        title.text(titles[currentState]);
    }

    function updateLegend() {
        d3.select("#legend").remove();
        let legend = d3.select("body").append("div")
            .attr("id", "legend")
            .style("position", "fixed")

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
    scroller.setup({
        step: ".step",
        offset: 0.5,
        debug: false
    })
        .onStepEnter(response => {
            currentState = response.index;
            updateAll();
        });

    window.addEventListener("resize", scroller.resize);
});