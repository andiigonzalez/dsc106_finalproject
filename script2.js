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
  
    let title = d3.select("#title").append("h2")
        .attr("id", "status-title")
        .style("text-align", "center")
    
    const mainContainer = d3.select("#main-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("width", "100%")
        .style("max-width", "1400px")
        .style("margin", "0 auto");
    const toggleContainer = mainContainer.append("div")
        .attr("id", "toggle-container")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("margin-bottom", "20px");

    const visualizationWrapper = mainContainer.append("div")
        .attr("id", "visualization-wrapper")
        .style("display", "flex")
        .style("flex-direction", "row") // Ensure horizontal layout
        .style("justify-content", "space-between") 
        .style("width", "100%")
        .style("position", "relative")
        .style("margin-top", "10px")
        .style("height", "1600px");


    const leftChartsContainer = visualizationWrapper.append("div")
        .attr("id", "left-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "30%")
        .style("padding-right", "20px")
        .style("gap", "40px")
        .style("z-index", "1");

    const centerContainer = visualizationWrapper.append("div")
        .attr("id", "center-container")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("width", "60%") // Adjust as needed for your SVG size
        .style("height", "100%")
        .style("overflow", "visible"); // Adjust as needed for your SVG size

    const rightChartsContainer = visualizationWrapper.append("div")
        .attr("id", "right-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "30%")
        .style("gap", "40px") 
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

        d3.xml("Images/only_organs_removebg.svg").then(function (xml) {

            const svgContainer = centerContainer.append("div")
                .attr("id", "svg-container")
                .style("width", "100%")
                .style("height", "100%")
                .style("justify-content", "center")
                .style("position", "relative")
                .style("align-items", "center");



            let importedNode = document.importNode(xml.documentElement, true);
            importedNode.id = "body-svg";

            importedNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
            importedNode.setAttribute("width", "100%");
            importedNode.setAttribute("height", "90%");
            importedNode.setAttribute("viewBox",  "-95 130 400 550");
            // "viewbox" (min-x, min-y, width, height)
            // to move right set min-x smaller
            
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
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("margin", "10px 0")
            .style("padding", "10px")
            .style("background", "rgba(255, 255, 255, 0.8)")
            .style("border-radius", "8px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("width", "115%")
            .style("height", "320px")
            .style("position", "relative")
            .style("margin", "3px auto");
            
        
        container.append("h4")
            .text(pos.label)
            .style("margin", "0 0 1px 0")
            .style("font-size", "14px");
        
        container.append("img")
            .attr("src", `Images/${pos.organId}.png`)
            .attr("width", "60px")
            .attr("height", "60px")
            .style("margin-bottom", "2px");
        
        container.append("div")
            .attr("id", `chart-${pos.id}`)
            .style("width", "200px")
            .style("height", "200px")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("margin", "4px auto")
            .style("position", "relative")
     
        
        container.append("div")
            .attr("class", "chart-text")
            .attr("id", `text-${pos.id}`)
            .style("font-size", "14px")
            .style("margin-top", "4px")
            .style("margin-bottom", "8px")
            .style("text-align", "center");
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
            textContent = `<b style="color:${color}"> ${optype}</b> surgeries constituted <b style="color:${color}">${percent}%</b> of <b>all</b> surgeries.`;
        } else if (currentState === 1) {
            let percent = total === 0 ? 0 : Math.round((totalCancer / total) * 100);
            data = [
                { label: "Cancer", value: totalCancer || 1, color: "orange" },
                { label: "Other", value: total - totalCancer || 1, color: "lightgrey" }
            ];
            color = "orange";
            textContent = `<b style="color:${color}">${percent}%</b> of all all <b style="color:${color}">${optype}</b> surgery were <b style="color:${color}">cancer</b> diagnoses.`;
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
                { label: "Female Cases Non cancer ", value: percentNonCancerFale || 1, color: "lightgrey" },
                { label: "Female Cases Cancer", value: percentCancerMale  || 1, color: "lightblue" },
            ];
            color3 = "pink";
        }

            
        
        d3.select(`#text-${optype}`).html(textContent);

        let pie = d3.pie().value(d => d.value);
        let radius = 80;
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

        let text = svg.selectAll("text").data(pie(data));

        text.enter().append("text")
            .merge(text)
            .transition()
            .duration(500)
            .attr("transform", d => {
                let angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2; // Midpoint of slice
                let isLargest = d.data.value === d3.max(data, d => d.value);
                let offset = isLargest ? radius * 0.5 : radius * 1.1;
                let x = Math.cos(angle)* offset ;
                let y = (Math.sin(angle+0.5) * offset);
                return `translate(${x+90}, ${y+95})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);

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
        updateDots();
        
        positions.forEach(pos => {
            updatePieChart(pos.id, totalSurgeries);
        });
    }

    function updateTitle() {
        const titles = [
            "An analysis of the Distribution of Surgeries by Organs and Systems",
            "The Distribution of Surgeries with Cancer vs Non-Cancer Diagnoses",
            "A Comparison of Female vs Male Cancer Diagnoses by Organs and Organ Systems",
            "Who? What? Where?"
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
            .style("position", "fixed")
            .style("top", "60px")
            .style("right", "30px")
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
});