import { animateScalpels } from './animation.js';

document.addEventListener("DOMContentLoaded", function () {
    let currentState = 0;
    let surgeryData = {};
    let cancerData = {};
    let genderData = {};
    let svgElements = {};
    const organPositions = {
        "Thyroid": { x: 120, y: 100 },
        "Stomach": { x: 180, y: 450 },
        "Pancreas": { x: 105, y: 510 },
        "Kidneys": { x: 185, y: 525 },
        "Heart": { x: 130, y: 360 },
        "Liver": { x: 70, y: 430 },
        "Intestines": { x: 120, y: 620},
        "Reproductive": { x: 120, y: 750 }
    };
    
  
    const steps = document.querySelectorAll(".step");
  
    let title = d3.select("#title").append("h2")
        .attr("id", "status-title")
        .style("text-align", "center");
    
    const mainContainer = d3.select("#main-container");

    const scroller = scrollama();

    const visualizationWrapper = mainContainer.append("div")
        .attr("id", "visualization-wrapper");

    const leftChartsContainer = visualizationWrapper.append("div")
        .attr("id", "left-charts-container");

    const centerContainer = visualizationWrapper.append("div")
        .attr("id", "center-container");

    const rightChartsContainer = visualizationWrapper.append("div")
        .attr("id", "right-charts-container");

    const leftPositions = [
        { id: "Lymphatic-Endocrine", label: "Lymphatic/Endocrine System", organId: "Thyroid", organName: "Thyroid" },
        { id: "Digestive", label: "Digestive System", organId: "Stomach", organName: "Stomach" },
        { id: "Pancreatic-Biliary", label: "Pancreatic/Biliary System", organId: "Pancreas", organName: "Pancreas" },
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
        setTimeout(() => {
            createBarCharts();
            updateAll();
        }, 500); // Delay ensures data is fully processed before rendering

        d3.xml("Images/only_organs_removebg.svg").then(function (xml) {

            const svgContainer = d3.select("#center-container").append("div")
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
            // Delay the appending of the pulsing dot to ensure SVG loads first
            setTimeout(() => {
                const centerSvg = d3.select("#body-svg");
                if (!centerSvg.empty()) {
                    console.log("SVG found! Appending pulsing dot...");

                    const pulsingDot = centerSvg.append("circle")
                        .attr("class", "pulsing-dot")
                        .attr("r", 10) // Dot radius

                    function showPulsingDot(organName) {
                        if (!organPositions[organName]) return;

                        const { x, y } = organPositions[organName];

                        pulsingDot
                            .interrupt() // Stop any existing transitions
                            .attr("cx", x)
                            .attr("cy", y)
                            .style("display", "block") // Ensure it appears
                            .transition()
                            .duration(300)
                            .style("opacity", 1);
                    }

                    function hidePulsingDot() {
                        pulsingDot
                            .transition()
                            .duration(200)
                            .style("opacity", 0)
                            .on("end", function () {
                                d3.select(this).style("display", "none"); // Ensure it's hidden after fade out
                            });
                    }


                    positions.forEach(pos => {
                        d3.select(`#chart-container-${pos.id}`)
                            .style("cursor", "pointer") // Ensure hover cursor
                            .on("mouseenter", () => {
                                console.log(`Hovering over ${pos.id}`);
                                showPulsingDot(pos.organName);
                            })
                            .on("mouseleave", hidePulsingDot);
                    });
                } else {
                    console.error("Main SVG #body-svg not found! Ensure it loads before appending the pulsing dot.");
                }
                    
                    // Initialize charts now that containers exist
                    createBarCharts();
                    updateAll();
            }, 500);
        });

        // Create the pulsing dot container inside the central SVG
        const centerSvg = d3.select("#body-svg");

    });

    function createChartContainer(parentContainer, pos) {
        const container = parentContainer.append("div")
            .attr("id", `chart-container-${pos.id}`)
            .style("display", "flex")
            .style("flex-direction", "column") // Stack elements vertically
            .style("align-items", "center")
            .style("justify-content", "space-between")
            .style("margin", "5px")
            .style("padding", "5px")
            .style("background", "transparent")
            .style("border-radius", "8px")
            .style("box-shadow", "0 2px 4px rgba(110, 110, 110, 0.1)")
            .style("width", "100%")
            .style("position", "relative");
    
        // Top Section: Title and Organ Image
        const topSection = container.append("div")
            .style("display", "flex")
            .style("flex-direction", "row") // Arrange title and image in a column
            .style("align-items", "center")
            .style("width", "100%")
            .style("justify-content", "space-between");
    
        // Title
        const titleContainer = topSection.append("div")
            .style("width", "35%") // Allocate space for title
            .style("text-align", "left")
            .style("padding-left", "10px");
    
        titleContainer.append("h4")
            .text(pos.label)
            .style("margin-bottom", "5px")
            .style("font-size", "14px");
    
        // Organ Image
        const imageContainer = topSection.append("div")
            .style("width", "30%") // Allocate space for image
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("padding-left", "10px");
    
        imageContainer.append("img")
            .attr("src", `Images/${pos.organId}.png`)
            .attr("width", "45px")
            .attr("height", "45px");
    
        // Description
        const descriptionContainer = topSection.append("div")
            .attr("id", `text-${pos.id}`)
            .style("width", "50%") // Allocate space for description
            .style("font-size", "12px")
            .style("text-align", "left");
    
        // Bottom Section: Bar Container (spanning full width)
        const barContainer = container.append("div")
            .attr("id", `chart-${pos.id}`);
    }
    
    

    d3.csv("sugeries.csv").then(data => {
        const processedData = processData(data);
        createBarCharts(processedData);
    });

    function processData(data) {
        data.forEach(d => {
          let optype = d.optype.replace(/\//g, "-");
          surgeryData[optype] = (surgeryData[optype] || 0) + 1;
          let isCancer = /(cancer|carcinoma|malignant|blastoma|tumor|neoplasm|sarcoma|glioma|lymphoma|leukemia|melanoma|mesothelioma|myeloma|teratoma)/i.test(d.dx);
          let gender = d.sex;
    
          if (isCancer) {
            cancerData[optype] = (cancerData[optype] || 0) + 1;
            
            if (!genderData[optype]) {
                genderData[optype] = { total: 0, M: 0, F: 0 };
            }
        
            genderData[optype].total += 1;
            genderData[optype][gender] += 1;
          }
          return data.map(d => ({
            system: d.system,
            total: +d.total_surgeries,
            cancer: +d.cancer_surgeries,
            male: +d.male_cancer_surgeries,
            female: +d.female_cancer_surgeries
        }));      
        
        });
      }

    function createBarCharts() {
        let totalSurgeries = Object.values(surgeryData).reduce((a, b) => a + b, 0);

        positions.forEach(pos => {
            let container = d3.select(`#chart-${pos.id}`);

            if (container.empty()) {
                console.warn(`Missing container: chart-${pos.id}`);
                return;
            }

            // Clear existing SVG
            container.selectAll("svg").remove(); // Remove any existing SVG before creating new ones


            // Create SVG for bar chart
            let svg = container.append("svg")
                .attr("width", "100%") // Full width to match the container
                .attr("height", "30px");

            svgElements[pos.id] = svg;

            updateBarChart(pos.id, totalSurgeries);
        });
    }


    function updateBarChart(optype, totalSurgeries) {
        let total = surgeryData[optype] ?? 0; 
        let totalCancer = cancerData[optype] ?? 0;
        let maleCancer = genderData[optype]?.M ?? 0;
        let femaleCancer = genderData[optype]?.F ?? 0;
        let referenceTotal; // This is the new "100%" value

        // Avoid division by zero
        if (total === 0) total = 1;
        if (totalCancer === 0) totalCancer = 1;

        let nonCancerCases = total - totalCancer;
        let textContent = "";
        
        let data;

        if (currentState === 0) {
            return; // Do nothing on Step 0
        }
         else if (currentState === 1) {

            referenceTotal = totalSurgeries; // 100% is all surgeries
            data = [
                { label: "System-specific Surgery", value: total, color: "red" },
                { label: "Other Surgeries", value: totalSurgeries - total, color: "lightgrey" }
            ];
            textContent = `Out of all surgeries, <b style="color:red">${optype}</b> constituted <b style="color:red">${Math.round((total / totalSurgeries) * 100)}%</b> of the total surgeries.`;
        } else if (currentState === 2) {
            referenceTotal = total; // Now, system-specific surgeries become 100%
            data = [
                { label: "Cancer", value: totalCancer, color: "orange" },
                { label: "Non-Cancer", value: total - totalCancer, color: "lightgrey" }
            ];
            textContent = `Out of all <b style="color:orange">${optype}</b> surgeries, <b style="color:orange">${Math.round((totalCancer / total) * 100)}%</b> were cancer-related.`;
        } else if (currentState === 3) {
            referenceTotal = totalCancer; // Now, cancer surgeries become 100%
            data = [
                { label: "Male Cancer", value: maleCancer, color: "lightblue" },
                { label: "Female Cancer", value: femaleCancer, color: "pink" }
            ];
            textContent = `Women made up <b style="color:pink">${Math.round((femaleCancer / totalCancer) * 100)}%</b> and men <b style="color:lightblue">${Math.round((maleCancer / totalCancer) * 100)}%</b> of cancer-related surgeries.`;
        }

        // Prevent division by zero
        referenceTotal = referenceTotal || 1;
        
        
        let svg = svgElements[optype];
        if (!svg) return;
    
        let container = d3.select(`#chart-${optype}`);
        if (container.empty()) {
            console.warn(`Container for ${optype} not found`);
            return;
        }

        let totalWidth = container.node().getBoundingClientRect().width || 300; // Fallback to 300px if width is not detected

        
        let bars = svg.selectAll("rect")
            .data(data, d => d.label); // Use data join to prevent duplicates

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(500)
            .attr("x", (d, i) => i === 0 ? 0 : d3.sum(data.slice(0, i), d => d.value) / referenceTotal * totalWidth)
            .attr("width", d => (d.value / referenceTotal) * totalWidth)
            .attr("height", "25")
            .attr("ry", 2)  // Rounds the corners vertically
            .attr("fill", d => d.color);

        bars.exit().remove(); // Ensure old bars are properly removed
        
        d3.select(`#text-${optype}`).html(textContent);
    }

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
    
        console.log("Current state:", currentState);
    
        positions.forEach(pos => {
            updateBarChart(pos.id, totalSurgeries);
        });
    }
    

    function updateTitle() {
        const titles = [
            "",
            "Analysis of the Distribution of Surgeries by Organs and Systems",
            "Distribution of Surgeries Related to Cancer Diagnoses",
            "Comparison of Surgeries Performed on Female and Male Cancer Patients by Organ Systems",
            "Comparison of Surgeries Performed on Female and Male Cancer Patients by Organ Systems"
        ];
        title.text(titles[currentState]);
    }

    function updateLegend() {
        let legend = d3.select("#legend");
    
        if (currentState === 0) {
            // Completely hide the legend at step 0
            legend.transition()
                .duration(500)
                .style("opacity", 0)
                .on("end", function() { 
                    d3.select(this).style("display", "none"); // Hide it completely
                });
            return;
        }
    
        // If we are not in step 0, ensure the legend exists and is visible
        if (legend.empty()) {
            legend = d3.select("body").append("div")
                .attr("id", "legend")
                .style("display", "none") // Start hidden
                .style("opacity", 0);
        }
    
        // Ensure legend is visible when moving to step 1+
        legend.style("display", "flex")
              .transition()
              .duration(500)
              .style("opacity", 1);
    
        let legendData;
        if (currentState === 1) {
            legendData = [
                { label: "All Other Surgeries", color: "lightgrey" },
                { label: "System-specific Surgery", color: "red" }
            ];
        } else if (currentState === 2) {
            legendData = [
                { label: "Cancer", color: "orange" },
                { label: "Non-Cancer", color: "lightgrey" }
            ];
        } else if (currentState === 3) {
            legendData = [
                { label: "Non-Cancer", color: "lightgrey" },
                { label: "Male Cancer", color: "lightblue" },
                { label: "Female Cancer", color: "pink" }
            ];
        } else {
            return; // No legend for other steps
        }
    
        // Update legend items
        let items = legend.selectAll(".legend-item")
            .data(legendData);
    
        items.enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin", "5px")
            .merge(items)
            .html(d => `<span style="background-color:${d.color}; width:16px; height:16px; margin-right:5px; display:inline-block; border-radius:50%;"></span>${d.label}`);
    
        items.exit().remove();
    }
    
    
    

    // Add window resize handler
    scroller.setup({
        step: ".step",
        offset: 0.5,
        debug: false
    }).onStepEnter(response => {
        currentState = response.index;

        // Ensure animation container exists within #center-container at the beginning
        let animationContainer = d3.select("#main-container").select("#animation-container");

        if (animationContainer.empty()) {
            animationContainer = d3.select("#main-container")
                .append("div")
                .attr("id", "animation-container");
        }
    
        if (currentState === 0) {
            updateTitle(); // Ensure the title updates when going back to step 0
            // Ensure the animation container is always displayed when returning to step 0
            animationContainer
            .interrupt()
            .style("display", "flex")
            .style("opacity", 1);

            animationContainer.node().offsetHeight; // <-- Forces the browser to recognize the style change

            animationContainer.transition()
                .duration(800)
                .style("opacity", 1)
                .style("transition", "opacity 0.5s ease-inout");


            // Re-trigger the animation on re-entry to step 0
            d3.select("#animation-container").selectAll("*").remove(); // Clear any existing elements

            animateScalpels("#animation-container");

            animationContainer.transition()
                    .duration(800)
                    .style("opacity", 1);

            d3.select("#visualization-wrapper")
                .transition()
                .duration(800)
                .style("opacity", 0)
                .style("pointer-events", "none");

            d3.select("#animation-container")
                .transition()
                .duration(800)
                .style("opacity", 1); // Ensure animation remains visible

            
        } 
        else if (currentState === 1) {
            animationContainer.transition()
                    .duration(800)
                    .style("opacity", 0)
                    .style("display", "none");  // Hides it but doesn't remove it

            d3.select("#visualization-wrapper")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .style("pointer-events", "auto");
        } else {
            // Ensure visualizations remain visible in later steps
            d3.select("#visualization-wrapper").style("opacity", 1);
        }
    
        updateLegend(); // Ensure legend updates on every step change

        if (currentState > 0) {
            updateAll();
        }
    });
        
    window.addEventListener("resize", scroller.resize);

});