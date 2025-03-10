
// document.addEventListener("DOMContentLoaded", function () {
//     let currentState = 0;
//     let surgeryData = {};
//     let cancerData = {};
//     let genderData = {};
//     let svgElements = {};
//     let width = 120, height = 120, radius = Math.min(width, height) / 2;
  
//     const dots = document.querySelectorAll(".dot");
//     const previousButton = document.getElementById("previous-button");
//     const nextButton = document.getElementById("next-button");
  
//     let title = d3.select("#title").append("h2")
//       .attr("id", "status-title")
//       .style("text-align", "center")
    
//     const mainContainer = d3.select("#main-container")
//       .style("display", "flex")
//       .style("flex-direction", "column")
//       .style("width", "100%")
//       .style("margin", "0 auto");
  
//     // Create the center container for the body image
//     const centerContainer = mainContainer.append("div")
//       .attr("id", "center-container")
//       .attr("position", "relative")
//       .style("display", "flex")
//       .style("justify-content", "center")
//       .style("align-items", "center")
//       .style("width", "1100px") // Adjust as needed for your SVG size
//       .style("height", "500px"); // Adjust as needed for your SVG size

//     // Create a container for all charts that will be positioned around the SVG
//     const chartsContainer = mainContainer.append("div")
//       .attr("id", "charts-container")
//       .style("position", "relative")
//       .style("display", "grid")
//       .style("grid-template-columns", "7fr 7fr")
//       .style("grid-gap", "80px")
//       .style("width", "100%")
//       .style("max-width", "1200px")
//       .style("margin", "20px auto");


//     const arrowsSvg = centerContainer.append("svg")
//       .attr("id", "arrows-svg")
//       .attr("width", "100%")
//       .attr("height", "100%")
//       .style("position", "absolute")
//       .style("top", "0")
//       .style("left", "0")
//       .style("pointer-events", "none")
//       .style("z-index", "2");
    

    
//     const positions = [
//         { id: "Lymphatic-Endocrine", x: "-350px", y: "0.5px", label: "Lymphatic/Endocrine System", organId: "Thyroid", organName: "Thyroid" },
//         { id: "Cardiovascular", x: "450px", y: "0.5px", label: "Cardiovascular System", organId: "Heart", organName: "Heart" },
//         { id: "Digestive", x: "-300px", y: "15px", label: "Digestive System", organId: "Stomach", organName: "Stomach" },
//         { id: "Hepatic", x: "350px", y: "15px", label: "Hepatic System", organId: "Liver", organName: "Liver" },
//         { id: "Pancreatic-Billiary", x: "-300px", y: "8px", label: "Pancreatic/Billiary System", organId: "Pancreas", organName: "Pancreas" },
//         { id: "Colorectal", x: "-350px", y: "8px", label: "Colorectal System", organId: "Intestines", organName: "Intestines" },
//         { id: "Urinary", x: "-300px", y: "10px", label: "Urinary System", organId: "Kidneys", organName: "Kidneys" },
//         { id: "Reproductive", x: "0px", y: "30px", label: "Reproductive System", organId: "Female_RS", organName: "Reproductive" }
//     ];
 
//     positions.forEach(pos => {
//         const container = chartsContainer.append("div")
//             .attr("id", `chart-container-${pos.id}`)
//             .style("flex-direction", "column")
//             .style("align-items", "center")
//             .style("width", "240px")
//             .style("height", "280px") 
//             .style("text-align", "center")
//             .style("transform", "translate(-50%, -50%)")
//             .style("left", `calc(50% + ${pos.x})`) 
//             .style("top", `calc(50% + ${pos.y})`) 
//             .style("background", "rgba(255, 255, 255, 0.8)") 
//             .style("border-radius", "8px")
//             .style("padding", "8px")
//             .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
  
     
//         container.append("h4")
//             .text(pos.label)
//             .style("margin", "0 0 1px 0");

//         container.append("img")
//             .attr("src", `Images/${pos.organId}.png`)  
//             .attr("width", "60px")
//             .attr("height", "60px")
//             .style("margin-bottom", "2px");
    
//         container.append("div")
//             .attr("id", `chart-${pos.id}`)
//             .style("text-align", "center")
//             .style("align-items", "center")
//             .style("width", "170px")
//             .style("height", "170px");
    

//         container.append("div")
//             .attr("class", "chart-text")
//             .attr("id", `text-${pos.id}`)
//             .style("font-size", "12px")
//             .style("margin-bottom", "5px")
//             .style("height", "40px");
//         });



//     d3.csv("sugeries.csv").then(function (data) {
//         processData(data);

//         d3.xml("Images/only_organs_nobg.png").then(function (xml) {
//             let importedNode = document.importNode(xml.documentElement, true);
//             centerContainer.node().appendChild(importedNode);
            
//             const bodySvg = centerContainer.select("img");
            

//             bodySvg.attr("width", "100%").attr("height", "100%")
//                 .style("position", "relative")
          
//             setTimeout(() => {
                
//                 positions.forEach(pos => {
//                     pos.element = document.getElementById(pos.organId);
//                     if (!pos.element) {
//                         console.warn(`Organ element #${pos.organId} not found`);
//                     }
//                 });
                
//                 createPieCharts();
//                 updateAll();
                
              
//                 positions.forEach(pos => {
//                     d3.select(`#chart-container-${pos.id}`)
//                         .style("cursor", "pointer")
//                         .on("mouseenter", () => {
//                             showOrganConnection(pos);
//                         })
//                         .on("mouseleave", () => {
//                             hideOrganConnections();
//                         });
//                 });
//             }, 500);
//         });
//     });



//     function processData(data) {
//         let totalSurgeries = data.length;
//         data.forEach(d => {
//           let optype = d.optype.replace(/\//g, "-");
//           surgeryData[optype] = (surgeryData[optype] || 0) + 1;
//           let isCancer = /(cancer|tumor|carcinoma|sarcoma|malignant|lymphoma)/i.test(d.dx);
//           let gender = d.sex;
    
//           if (isCancer) {
//             cancerData[optype] = (cancerData[optype] || 0) + 1;
//             if (!genderData[optype]) {
//               genderData[optype] = { M: 0, F: 0 };
//             }
//             if (gender === "M") {
//               genderData[optype].M++;
//             } else if (gender === "F") {
//               genderData[optype].F++;
//             }
//           }
//         });
//       }
    
//     function createPieCharts() {
//         let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);

//         positions.forEach(pos => {
//             let container = chartsContainer.select(`#chart-${pos.id}`);
            
//             if (container.empty()) {
//                 console.warn(`Missing container: chart-${pos.id}`);
//             return;
//             }

//             console.log(`Creating pie chart for ${pos.id}`);

//             if (!svgElements[pos.id]) {
//                 let svg = container.append("svg")
//                     .attr("width", 200)
//                     .attr("height", 200)
//                     .style("overflow", "visible")
//                     .append("g")
//                     .attr("transform", `translate(100, 100)`);
//                 svgElements[pos.id] = svg;
//             }
//             updatePieChart(pos.id, totalSurgeries);
//         });
//     }

//     function updatePieChart(optype, totalSurgeries) {
//         let total = surgeryData[optype] || 0;
//         let totalCancer = cancerData[optype] || 0;
//         let maleCases = genderData[optype]?.M || 0;
//         let femaleCases = genderData[optype]?.F || 0;
//         let nonCancerCases = total - totalCancer;
//         let textContent = "";
//         let color = "black";

//         let data;
//         if (currentState === 0) {
//             let percent = Math.round((total / totalSurgeries) * 100);
//             data = [
//                 { label: optype, value: total || 1, color: "red" },
//                 { label: "Other Surgeries", value: totalSurgeries - total, color: "lightgrey" }
//             ];
//             color = "red";
//             textContent = `Out of all surgeries, <b style="color:${color}"> ${optype}</b> constituted <b style="color:${color}">${percent}%</b>.`;
//         } else if (currentState === 1) {
//             let percent = total === 0 ? 0 : Math.round((totalCancer / total) * 100);
//             data = [
//                 { label: "Cancer", value: totalCancer || 1, color: "orange" },
//                 { label: "Other", value: total - totalCancer || 1, color: "lightgrey" }
//             ];
//             color = "orange";
//             textContent = `Out of all <b style="color:${color}">${optype}</b> surgeries, <b style="color:${color}">${percent}%</b> were cancer diagnoses.`;
//         } else {
//             // Third toggle state: Split Cancer into Male/Female directly
//             let percentMale = totalCancer === 0 ? 0 : Math.round((maleCases / totalCancer) * 100);
//             let percentFemale = totalCancer === 0 ? 0 : Math.round((femaleCases / totalCancer) * 100);
//             data = [
//                 { label: "Non-Cancer", value: nonCancerCases || 1, color: "lightgrey" },
//                 { label: "Male Cancer", value: maleCases || 1, color: "lightblue" },
//                 { label: "Female Cancer", value: femaleCases || 1, color: "pink" }
//             ];
//             textContent = `Women made up <b style="color:pink">${percentFemale}%</b> and men <b style="color:lightblue">${percentMale}%</b> of the cancer diagnoses.`;
//         }
        
//         d3.select(`#text-${optype}`).html(textContent);

//         let pie = d3.pie().value(d => d.value);
//         let arc = d3.arc().innerRadius(0).outerRadius(radius);

//         let svg = svgElements[optype];
//         if (!svg) return;

//         let paths = svg.selectAll("path").data(pie(data.filter(d => d.value > 0)));

//         paths.transition()
//             .duration(500)
//             .attrTween("d", function (d) {
//                 let interpolator = d3.interpolate(this._current || d, d);
//                 this._current = interpolator(1);
//                 return function (t) {
//                     return arc(interpolator(t));
//                 };
//             })
//             .attr("fill", d => d.data.color);

//         paths.enter()
//             .append("path")
//             .attr("d", arc)
//             .attr("fill", d => d.data.color)
//             .each(function (d) { this._current = d; }) // Store current state for transitions
//             .transition()
//             .duration(500)
//             .attrTween("d", function (d) {
//                 let interpolator = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
//                 return function (t) {
//                     return arc(interpolator(t));
//                 };
//             });

//         paths.exit().remove();

//         let text = svg.selectAll("text").data(pie(data));

//         text.enter().append("text")
//             .merge(text)
//             .transition()
//             .duration(500)
//             .attr("transform", d => {
//                 let angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2; // Midpoint of slice
//                 let isLargest = d.data.value === d3.max(data, d => d.value);
//                 let offset = isLargest ? radius * 0.5 : radius * 1.1;
//                 let x = Math.cos(angle) * offset;
//                 let y = Math.sin(angle) * offset;
//                 return `translate(${x}, ${y})`;
//             })
//             .attr("text-anchor", "middle")
//             .attr("dy", "0.35em")
//             .style("font-size", "12px")
//             .style("font-weight", "bold")
//             .style("fill", "black")
//             .text(d => `${Math.round(d.data.value / d3.sum(data, d => d.value) * 100)}%`);

//         text.exit().remove();
//     }
//     function showOrganConnection(pos) {
//         drawConnectingArrows() 
//         arrowsSvg.selectAll("*").remove();

//         if (!pos.element) return;

//         arrowsSvg.append("defs").append("marker")
//             .attr("id", "arrowhead")
//             .attr("viewBox", "0 -5 10 10")
//             .attr("refX", 8)
//             .attr("refY", 0)
//             .attr("markerWidth", 6)
//             .attr("markerHeight", 6)
//             .attr("orient", "auto")
//             .append("path")
//             .attr("d", "M0,-5L10,0L0,5")
//             .attr("fill", "#555");

//         // Highlight the organ in the SVG
//         if (pos.element) {
//             d3.select(pos.element)
//                 .style("filter", "drop-shadow(0 0 5px red)")
//                 .style("opacity", 1);
//         }

//         // Get the position of the organ in the SVG
//         const organRect = pos.element.getBoundingClientRect();
//         const svgRect = centerContainer.node().getBoundingClientRect();
        
//         // Get the position of the chart container
//         const chartRect = document.getElementById(`chart-container-${pos.id}`).getBoundingClientRect();
        
//         // Calculate positions relative to the SVG container
//         const organX = organRect.left + organRect.width/2 - svgRect.left;
//         const organY = organRect.top + organRect.height/2 - svgRect.top;
        
//         // Calculate target position on edge of SVG nearest to chart
//         const svgCenterX = svgRect.width/2;
//         const svgCenterY = svgRect.height/2;
        
//         // Draw a line from organ to the edge of SVG in direction of chart
//         const angle = Math.atan2(chartRect.top - svgRect.top - svgCenterY, chartRect.left - svgRect.left - svgCenterX);
//         const edgeX = svgCenterX + Math.cos(angle) * (svgRect.width/2 - 10);
//         const edgeY = svgCenterY + Math.sin(angle) * (svgRect.height/2 - 10);
        
//         // Add curve between organ and edge of SVG
//         arrowsSvg.append("path")
//             .attr("d", `M${organX},${organY} L${edgeX},${edgeY}`)
//             .attr("fill", "none")
//             .attr("stroke", "red")
//             .attr("stroke-width", 2)
//             .attr("stroke-dasharray", "5,3")
//             .attr("marker-end", "url(#arrowhead)")
//             .style("opacity", 0.8);
//     }

//     // Function to hide all connections
//     function hideOrganConnections() {
//         arrowsSvg.selectAll("*").remove();
        
//         // Remove highlighting from all organs
//         positions.forEach(pos => {
//             if (pos.element) {
//                 d3.select(pos.element)
//                     .style("filter", null)
//                     .style("opacity", null);
//             }
            
//         });
//         drawConnectingArrows() 
//     }

//     function updateAll() {
//         let totalSurgeries = d3.sum(Object.values(surgeryData));
//         updateTitle();
//         updateLegend();
//         updateDots();
        
//         positions.forEach(pos => {
//             updatePieChart(pos.id, totalSurgeries);
//         });
//     }

//     function updateTitle() {
//         const titles = [
//             "An analysis of the Distribution of Surgeries by Organs and Systems",
//             "The Distribution of Surgeries with Cancer vs Non-Cancer Diagnoses",
//             "A Comparison of Female vs Male Cancer Diagnoses by Organs and Organ Systems"
//         ];
//         title.text(titles[currentState]);
//     }

//     function updateDots() {
//         dots.forEach((dot, index) => {
//             dot.classList.toggle("active", index === currentState);
//         });
//     }

//     function updateLegend() {
//         d3.select("#legend").remove();
//         let legend = d3.select("body").append("div")
//             .attr("id", "legend")
//             .style("position", "absolute")
//             .style("top", "100px")
//             .style("right", "20px")
//             .style("background", "white")
//             .style("padding", "10px")
//             .style("border", "1px solid #ccc")
//             .style("border-radius", "5px");

//         let legendData;
//         if (currentState === 0) {
//             legendData = [
//                 { label: "All Other Surgeries", color: "lightgrey" },
//                 { label: "System-specific Surgery", color: "red" }
//             ];
//         } else if (currentState === 1) {
//             legendData = [
//                 { label: "Cancer", color: "orange" },
//                 { label: "Non-Cancer", color: "lightgrey" }
//             ];
//         } else {
//             legendData = [
//                 { label: "Non-Cancer", color: "lightgrey" },
//                 { label: "Male Cancer", color: "lightblue" },
//                 { label: "Female Cancer", color: "pink" }
//             ];
//         }

//         legend.selectAll(".legend-item")
//             .data(legendData)
//             .enter()
//             .append("div")
//             .attr("class", "legend-item")
//             .style("display", "flex")
//             .style("align-items", "center")
//             .style("margin", "5px")
//             .html(d => `<span style="background-color:${d.color}; width:16px; height:16px; margin-right:5px; display:inline-block; border-radius:50%;"></span>${d.label}`);
//     }

//     // Add window resize handler
//     window.addEventListener("resize", () => {
//         hideOrganConnections();
//     });

//     nextButton.addEventListener("click", function () {
//         currentState = (currentState + 1) % 3;
//         updateAll();
//         hideOrganConnections();
//     });

//     previousButton.addEventListener("click", function () {
//         currentState = (currentState - 1 + 3) % 3;
//         updateAll();
//         hideOrganConnections();
//     });

//     function drawConnectingArrows() {
//         arrowsSvg.selectAll("*").remove();
    
//         arrowsSvg.append("defs").append("marker")
//             .attr("id", "arrowhead")
//             .attr("viewBox", "0 -5 10 10")
//             .attr("refX", 8)
//             .attr("refY", 0)
//             .attr("markerWidth", 6)
//             .attr("markerHeight", 6)
//             .attr("orient", "auto")
//             .append("path")
//             .attr("d", "M0,-5L10,0L0,5")
//             .attr("fill", "#555");
    
//         setTimeout(() => {
//             const bodyRect = document.getElementById("body-image").getBoundingClientRect();
    
//             positions.forEach(pos => {
//                 const chartContainer = d3.select(`#chart-container-${pos.id}`).node();
//                 if (!chartContainer) return;
    
//                 const chartRect = chartContainer.getBoundingClientRect();
    
//                 // Approximate organ positions manually
//                 const organX = bodyRect.left + bodyRect.width / 2 + parseFloat(pos.x) * 0.6;
//                 const organY = bodyRect.top + bodyRect.height / 2 + parseFloat(pos.y) * 0.6;
    
//                 // Calculate chart position
//                 const chartX = chartRect.left + chartRect.width / 2;
//                 const chartY = chartRect.top + chartRect.height / 2;
    
//                 const midX = (organX + chartX) / 2;
//                 const midY = (organY + chartY) / 2;
    
//                 arrowsSvg.append("path")
//                     .attr("d", `M${organX},${organY} Q${midX},${midY} ${chartX},${chartY}`)
//                     .attr("fill", "none")
//                     .attr("stroke", "#555")
//                     .attr("stroke-width", 2)
//                     .attr("stroke-dasharray", "5,3")
//                     .attr("marker-end", "url(#arrowhead)");
//             });
//         }, 500);
//     }
    

//     // Initial update
//     updateAll();
// });

// //////////////////////////////////////////////////////////////////////////////////////

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

    // Add a container for the single pie chart in state 4
    const singlePieContainer = mainContainer.append("div")
      .attr("id", "single-pie-container")
      .style("display", "none")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("width", "100%")
      .style("height", "400px")
      .style("margin", "20px auto");

    // Add the SVG for the single pie chart
    const singlePieSvg = singlePieContainer.append("svg")
      .attr("width", 400)
      .attr("height", 400)
      .append("g")
      .attr("transform", "translate(200, 200)");

    // Add a legend container for the single pie chart
    const singlePieLegend = singlePieContainer.append("div")
      .attr("id", "single-pie-legend")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("justify-content", "center")
      .style("margin-left", "20px");


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
        { id: "Lymphatic-Endocrine", x: "-350px", y: "0.5px", label: "Lymphatic/Endocrine System", organId: "Thyroid", organName: "Thyroid", color: "#FF6B6B" },
        { id: "Cardiovascular", x: "450px", y: "0.5px", label: "Cardiovascular System", organId: "Heart", organName: "Heart", color: "#FF9E4D" },
        { id: "Digestive", x: "-300px", y: "15px", label: "Digestive System", organId: "Stomach", organName: "Stomach", color: "#FFD166" },
        { id: "Hepatic", x: "350px", y: "15px", label: "Hepatic System", organId: "Liver", organName: "Liver", color: "#06D6A0" },
        { id: "Pancreatic-Billiary", x: "-300px", y: "8px", label: "Pancreatic/Billiary System", organId: "Pancreas", organName: "Pancreas", color: "#118AB2" },
        { id: "Colorectal", x: "-350px", y: "8px", label: "Colorectal System", organId: "Intestines", organName: "Intestines", color: "#073B4C" },
        { id: "Urinary", x: "-300px", y: "10px", label: "Urinary System", organId: "Kidneys", organName: "Kidneys", color: "#8338EC" },
        { id: "Reproductive", x: "0px", y: "30px", label: "Reproductive System", organId: "Female_RS", organName: "Reproductive", color: "#3A86FF" }
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
                createSinglePieChart();
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

    function createSinglePieChart() {
        // Create a single pie chart showing all organ systems
        let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);
        let pieData = positions.map(pos => {
            let total = surgeryData[pos.id] || 0;
            let cancerCases = cancerData[pos.id] || 0;
            let nonCancerCases = total - cancerCases;
            let maleCases = genderData[pos.id]?.M || 0;
            let femaleCases = genderData[pos.id]?.F || 0;
            
            return {
                label: pos.label,
                value: total || 0,
                color: pos.color,
                cancerCases: cancerCases,
                nonCancerCases: nonCancerCases,
                maleCases: maleCases,
                femaleCases: femaleCases
            };
        });
    
        // Adjust the layout to make room for the expanded legend
        singlePieContainer.style("display", "grid")
            .style("grid-template-columns", "1fr 1.5fr")
            .style("grid-gap", "40px")
            .style("width", "100%")
            .style("max-width", "1200px")
            .style("height", "auto")
            .style("min-height", "1000px")
            .style("margin", "20px auto");
    
        // Create a container for both pie charts
        // Increase the SVG height to accommodate both charts
        const pieChartsContainer = singlePieContainer.select("svg").node() ? 
            singlePieContainer.select("svg").attr("height", 2000) : 
            singlePieContainer.append("svg")
                .attr("width", 700)
                .attr("height", 2000);
    
        // Clear existing content
        pieChartsContainer.selectAll("*").remove();
    
        // Create first pie chart (distribution by organ system)
        // Position the first chart with more space between charts
        const firstPieChart = pieChartsContainer.append("g")
            .attr("transform", "translate(200, 200)");
    
        // Set up pie and arc generators for first chart
        let pie = d3.pie().value(d => d.value);
        let arc = d3.arc().innerRadius(80).outerRadius(140);
        let labelArc = d3.arc().innerRadius(145).outerRadius(145);
    
        // Add title for first pie chart
        pieChartsContainer.append("text")
            .attr("x", 200)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Distribution by Organ System");
    
        // Bind data to paths for first chart
        let paths = firstPieChart.selectAll("path.first-chart")
            .data(pie(pieData));
    
        // Enter and update paths for first chart
        paths.enter()
            .append("path")
            .attr("class", "first-chart")
            .merge(paths)
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
    
        // Add labels for first chart
        let labels = firstPieChart.selectAll("text.first-chart")
            .data(pie(pieData));
    
        labels.enter()
            .append("text")
            .attr("class", "first-chart")
            .merge(labels)
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(d => d.data.value > 0 ? `${Math.round((d.data.value / totalSurgeries) * 100)}%` : "");
    
        // Create second pie chart (cancer vs non-cancer)
        // Position the second chart farther down to avoid overlap
        const secondPieChart = pieChartsContainer.append("g")
            .attr("transform", "translate(200, 550)");
    
        // Calculate totals for second chart
        let totalCancerCases = pieData.reduce((sum, d) => sum + d.cancerCases, 0);
        let totalNonCancerCases = pieData.reduce((sum, d) => sum + d.nonCancerCases, 0);
        
        let secondPieData = [
            { label: "Cancer", value: totalCancerCases, color: "orange" },
            { label: "Non-Cancer", value: totalNonCancerCases, color: "lightgrey" }
        ];
    
        // Add title for second pie chart
        pieChartsContainer.append("text")
            .attr("x", 200)
            .attr("y", 400)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Distribution of Cancer vs Non-Cancer Diagnoses");
    
        // Set up pie and arc generators for second chart
        let secondPie = d3.pie().value(d => d.value);
        let secondArc = d3.arc().innerRadius(60).outerRadius(120);
        let secondLabelArc = d3.arc().innerRadius(125).outerRadius(125);
    
        // Bind data to paths for second chart
        let secondPaths = secondPieChart.selectAll("path.second-chart")
            .data(secondPie(secondPieData));
    
        // Enter and update paths for second chart
        secondPaths.enter()
            .append("path")
            .attr("class", "second-chart")
            .merge(secondPaths)
            .attr("d", secondArc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
    
        // Add labels for second chart
        let secondLabels = secondPieChart.selectAll("text.second-chart")
            .data(secondPie(secondPieData));
    
        secondLabels.enter()
            .append("text")
            .attr("class", "second-chart")
            .merge(secondLabels)
            .attr("transform", d => `translate(${secondLabelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(d => {
                const percent = Math.round((d.data.value / (totalCancerCases + totalNonCancerCases)) * 100);
                return `${percent}%`;
            });
    
        // Add percentages inside the second chart slices
        secondPieChart.selectAll("text.inner-label")
            .data(secondPie(secondPieData))
            .enter()
            .append("text")
            .attr("class", "inner-label")
            .attr("transform", d => {
                // Position labels inside the slices, closer to the outer edge
                const centroid = secondArc.centroid(d);
                // Scale the position a bit toward center for better placement
                return `translate(${centroid[0] * 0.7}, ${centroid[1] * 0.7})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", d => d.data.label === "Cancer" ? "black" : "black")
            .text(d => d.data.label);
            
        // Create third pie chart (gender distribution of cancer cases)
        // Position the third chart farther down to avoid overlap
        const thirdPieChart = pieChartsContainer.append("g")
            .attr("transform", "translate(200, 900)");
            
        // Calculate totals for third chart
        let totalMaleCancerCases = pieData.reduce((sum, d) => sum + d.maleCases, 0);
        let totalFemaleCancerCases = pieData.reduce((sum, d) => sum + d.femaleCases, 0);
        
        let thirdPieData = [
            { label: "Male", value: totalMaleCancerCases, color: "lightblue" },
            { label: "Female", value: totalFemaleCancerCases, color: "pink" }
        ];
        
        // Add title for third pie chart
        pieChartsContainer.append("text")
            .attr("x", 200)
            .attr("y", 750)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Gender Distribution of Cancer Diagnoses");
            
        // Set up pie and arc generators for third chart
        let thirdPie = d3.pie().value(d => d.value);
        let thirdArc = d3.arc().innerRadius(60).outerRadius(120);
        let thirdLabelArc = d3.arc().innerRadius(125).outerRadius(125);
        
        // Bind data to paths for third chart
        let thirdPaths = thirdPieChart.selectAll("path.third-chart")
            .data(thirdPie(thirdPieData));
            
        // Enter and update paths for third chart
        thirdPaths.enter()
            .append("path")
            .attr("class", "third-chart")
            .merge(thirdPaths)
            .attr("d", thirdArc)
            .attr("fill", d => d.data.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
            
        // Add labels for third chart
        let thirdLabels = thirdPieChart.selectAll("text.third-chart")
            .data(thirdPie(thirdPieData));
            
        thirdLabels.enter()
            .append("text")
            .attr("class", "third-chart")
            .merge(thirdLabels)
            .attr("transform", d => `translate(${thirdLabelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(d => {
                const totalCases = totalMaleCancerCases + totalFemaleCancerCases;
                const percent = totalCases > 0 ? Math.round((d.data.value / totalCases) * 100) : 0;
                return `${percent}%`;
            });
            
        // Add labels inside the third chart slices
        thirdPieChart.selectAll("text.inner-label-third")
            .data(thirdPie(thirdPieData))
            .enter()
            .append("text")
            .attr("class", "inner-label-third")
            .attr("transform", d => {
                // Position labels inside the slices, closer to the outer edge
                const centroid = thirdArc.centroid(d);
                // Scale the position a bit toward center for better placement
                return `translate(${centroid[0] * 0.7}, ${centroid[1] * 0.7})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(d => d.data.label);
    
        // Clear existing legend
        singlePieLegend.selectAll("*").remove();
    
        // Style the legend container to better handle the content
        singlePieLegend.style("display", "flex")
            .style("flex-direction", "column")
            .style("max-height", "2500px") // Increased height to match charts
            .style("overflow-y", "auto")
            .style("padding", "10px")
            .style("background-color", "rgba(255, 255, 255, 0.9)")
            .style("border-radius", "8px")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.1)")
            .style("margin-left", "20px");
    
        // Rest of the legend code remains the same...
        // Add a title to the legend
        singlePieLegend.append("h3")
            .text("Detailed Breakdown by Organ System")
            .style("margin", "0 0 15px 0")
            .style("text-align", "center");
    
        // Create a more detailed legend for the single pie chart
        const legendItems = singlePieLegend.selectAll(".legend-item")
            .data(pieData.filter(d => d.value > 0));
    
        const legendItemEnter = legendItems.enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("margin", "10px 0")
            .style("padding", "10px")
            .style("border-bottom", "1px solid #eee")
            .style("width", "100%");  // Ensure full width
    
        // Add system name and color indicator
        const titleRow = legendItemEnter.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "8px")
            .style("width", "100%");  // Ensure full width
    
        titleRow.append("div")
            .style("min-width", "18px")
            .style("height", "18px")
            .style("margin-right", "10px")
            .style("border-radius", "50%")
            .style("background", d => d.color)
            .style("flex-shrink", "0");  // Prevent color indicator from shrinking
    
        titleRow.append("div")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("word-wrap", "break-word")  // Allow text to wrap
            .style("width", "100%")  // Take full width
            .text(d => `${d.label} (${d.value} cases, ${Math.round((d.value / totalSurgeries) * 100)}%)`);
    
        // Add an inner container for the detailed breakdowns
        const detailsContainer = legendItemEnter.append("div")
            .style("margin-left", "28px")
            .style("margin-top", "5px")
            .style("width", "calc(100% - 28px)");  // Ensure proper width accounting for margin
    
        // Add cancer vs non-cancer breakdown
        const cancerSection = detailsContainer.append("div")
            .style("margin-bottom", "10px")
            .style("width", "100%");
    
        cancerSection.append("div")
            .style("font-weight", "bold")
            .style("margin-bottom", "5px")
            .text("Diagnosis Breakdown:");
    
        const cancerRow = cancerSection.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "3px")
            .style("margin-left", "10px");
    
        cancerRow.append("div")
            .style("min-width", "12px")
            .style("height", "12px")
            .style("margin-right", "8px")
            .style("background", "orange")
            .style("flex-shrink", "0");
    
        cancerRow.append("span")
            .style("white-space", "normal")  // Allow text to wrap
            .style("word-wrap", "break-word")
            .text(d => {
                const percent = d.value > 0 ? Math.round((d.cancerCases / d.value) * 100) : 0;
                return `Cancer: ${d.cancerCases} (${percent}%)`;
            });
    
        const nonCancerRow = cancerSection.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-left", "10px");
    
        nonCancerRow.append("div")
            .style("min-width", "12px")
            .style("height", "12px")
            .style("margin-right", "8px")
            .style("background", "lightgrey")
            .style("flex-shrink", "0");
    
        nonCancerRow.append("span")
            .style("white-space", "normal")  // Allow text to wrap
            .style("word-wrap", "break-word")
            .text(d => {
                const percent = d.value > 0 ? Math.round((d.nonCancerCases / d.value) * 100) : 0;
                return `Non-Cancer: ${d.nonCancerCases} (${percent}%)`;
            });
    
        // Add gender breakdown for cancer cases
        const genderSection = detailsContainer.append("div")
            .style("display", d => d.cancerCases > 0 ? "block" : "none")
            .style("width", "100%");
    
        genderSection.append("div")
            .style("font-weight", "bold")
            .style("margin-top", "8px")
            .style("margin-bottom", "5px")
            .text("Cancer Cases by Gender:");
    
        const maleRow = genderSection.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "3px")
            .style("margin-left", "10px");
    
        maleRow.append("div")
            .style("min-width", "12px")
            .style("height", "12px")
            .style("margin-right", "8px")
            .style("background", "lightblue")
            .style("flex-shrink", "0");
    
        maleRow.append("span")
            .style("white-space", "normal")  // Allow text to wrap
            .style("word-wrap", "break-word")
            .text(d => {
                const percent = d.cancerCases > 0 ? Math.round((d.maleCases / d.cancerCases) * 100) : 0;
                return `Male: ${d.maleCases} (${percent}%)`;
            });
    
        const femaleRow = genderSection.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-left", "10px");
    
        femaleRow.append("div")
            .style("min-width", "12px")
            .style("height", "12px")
            .style("margin-right", "8px")
            .style("background", "pink")
            .style("flex-shrink", "0");
    
        femaleRow.append("span")
            .style("white-space", "normal")  // Allow text to wrap
            .style("word-wrap", "break-word")
            .text(d => {
                const percent = d.cancerCases > 0 ? Math.round((d.femaleCases / d.cancerCases) * 100) : 0;
                return `Female: ${d.femaleCases} (${percent}%)`;
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
        } else if (currentState === 2) {
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
        // Only show organ connections in states 0-2
        if (currentState === 3) return;
        
        drawConnectingArrows();
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
        
        // Only redraw arrows in states 0-2
        if (currentState !== 3) {
            drawConnectingArrows();
        }
    }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
        updateDots();
        
        // Toggle display of containers based on state
        if (currentState === 3) {
            // Show single pie chart, hide individual charts
            centerContainer.style("display", "none");
            chartsContainer.style("display", "none");
            singlePieContainer.style("display", "flex");
            arrowsSvg.style("display", "none");
        } else {
            // Show individual charts, hide single pie chart
            centerContainer.style("display", "flex");
            chartsContainer.style("display", "grid");
            singlePieContainer.style("display", "none");
            arrowsSvg.style("display", "block");
            
            positions.forEach(pos => {
                updatePieChart(pos.id, totalSurgeries);
            });
        }
    }

    function updateTitle() {
        const titles = [
            "An analysis of the Distribution of Surgeries by Organs and Systems",
            "The Distribution of Surgeries with Cancer vs Non-Cancer Diagnoses",
            "A Comparison of Female vs Male Cancer Diagnoses by Organs and Organ Systems",
            "Overall Distribution of Surgeries by Organ System" // New title for state 3
        ];
        title.text(titles[currentState]);
    }

    function updateDots() {
        // Update existing dots and add a fourth dot if not present
        if (dots.length < 4) {
            // If there are only 3 dots, we need to create a 4th dot
            const dotsContainer = dots[0].parentElement;
            const newDot = document.createElement("span");
            newDot.className = "dot";
            dotsContainer.appendChild(newDot);
            
            // Requery dots to include the new one
            const updatedDots = document.querySelectorAll(".dot");
            updatedDots.forEach((dot, index) => {
                dot.classList.toggle("active", index === currentState);
            });
        } else {
            // Just update the existing dots
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === currentState);
            });
        }
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
        } else if (currentState === 2) {
            legendData = [
                { label: "Non-Cancer", color: "lightgrey" },
                { label: "Male Cancer", color: "lightblue" },
                { label: "Female Cancer", color: "pink" }
            ];
        } else {
            // For state 3, show organ system colors
            legendData = positions.map(pos => ({
                label: pos.label,
                color: pos.color
            }));
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
        currentState = (currentState + 1) % 4; // Now cycle through 4 states
        updateAll();
        hideOrganConnections();
    });

    previousButton.addEventListener("click", function () {
        currentState = (currentState - 1 + 4) % 4; // Now cycle through 4 states
        updateAll();
        hideOrganConnections();
    });

    function drawConnectingArrows() {
        // Only draw connecting arrows in states 0-2
        if (currentState === 3) return;
        
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

/////////////////////////////////////////////////////////////////////////////////////////



