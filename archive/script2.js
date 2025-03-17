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
        .style("height", "100%")
        .style("width", "100%")
        .style("margin", "0 auto");

    const descriptionContainer =  mainContainer.append("div")
        .attr("id", "description-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("width", "60%")
        .style("overflow-y", "auto") // Enable scrolling
        .style("padding", "20px")
        .style("gap", "10px")
        .style("font-size", "18px");

    descriptionContainer.append("h3")
        .attr("id", "description-title")
        .style("align-items", "center")
        .style("margin-bottom", "10px")
        .style("font-size", "24px")
        .style("font-weight", "bold");
    
    descriptionContainer.append("div")
        .attr("id", "description-text")
        .style("font-size", "18px");

    const toggleContainer = mainContainer.append("div")
        .attr("id", "toggle-container")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("width", "150%")
        .style("top", "10px") // Fixed positioning for centering
        .style("left", "60%")
        .style("transform", "translateX(-50%)")
        .style("z-index", "10");

    const visualizationWrapper = mainContainer.append("div")
        .attr("id", "visualization-wrapper")
        .style("display", "flex")
        .style("width", "100%")
        .style("gap", "10px")
        .style("position", "relative")
        .style("margin-top", "20px")
        .style("height", "calc(100vh - 60px)") // Adjust for header/toggle height
        .style("overflow", "hidden");

    const leftChartsContainer = visualizationWrapper.append("div")
        .attr("id", "left-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "hidden") // No extra scrolling
        .style("gap", "20px")
        .style("top", "-10px");

    const centerContainer = visualizationWrapper.append("div")
        .attr("id", "center-container")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("width", "100%")
        .style("height", "110%")
        .style("top", "-10px")
        .style("overflow", "visible");

    /*** ✅ Right Charts Container (Fixed) ***/
    const rightChartsContainer = visualizationWrapper.append("div")
        .attr("id", "right-charts-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "flex-start")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "hidden") // Prevent extra scrolling
        .style("gap", "20px");



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
        importedNode.setAttribute("height", "100%"); // Fit within container
        importedNode.setAttribute("viewBox", "-100 210 400 470");
    
        svgContainer.node().appendChild(importedNode);
        setTimeout(() => {
            positions.forEach(pos => {
                pos.element = document.getElementById(pos.organId);
                if (!pos.element) {
                    console.warn(`Organ element #${pos.organId} not found`);
                }
            });
            createPieCharts();
            updateAll();
        }, 500);
    });



    function updateVisualization() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        let titleText = "";
        let descriptionText = "";
        

        if (currentState === 0) {
            titleText = "Surgery Distributions";
            descriptionText = `Out of <b>${totalSurgeries}</b> surgeries in the dataset, colorectal was the most frequent at <b>XX%</b>. Other common procedures included digestive and hepatic system surgeries.`;
        } else if (currentState === 1) {
            titleText = "Cancer vs Non-Cancer Diagnoses by Surgery";
            let totalCancerCases = d3.sum(Object.values(cancerData));
            let percentCancer = Math.round((totalCancerCases / totalSurgeries) * 100);
            descriptionText = `Cancer-related surgeries accounted for <b>${percentCancer}%</b> of all procedures. The most common cancer surgeries affected the <b>colorectal, hepatic, and reproductive systems</b>.`;
        } else if (currentState === 2) {
            titleText = "Male vs Female Cancer Diagnoses";
            descriptionText = `Among cancer surgeries, <b>XX%</b> were in male patients and <b>XX%</b> in female patients. The highest rates of cancer diagnoses in men were seen in the digestive system, while in women, reproductive system surgeries dominated.`;
        }

        d3.select("#description-title").html(titleText);
        d3.select("#description-text").html(descriptionText);

        // Update pie charts to match the new state
        updatePieCharts();
    }

    function createChartContainer(parentContainer, pos) {
        const container = parentContainer.append("div")
            .attr("id", `chart-container-${pos.id}`)
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "10px")
            .style("background", "rgba(255, 255, 255, 0.8)")
            .style("border-radius", "8px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("width", "100%")
            .style("height", "5500px")
            .style("overflow", "visible"); // Prevent chart overflow
    
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
            .style("width", "200px") // Adjusted to fit container
            .style("height", "200px") // Reduced height to fit
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("margin", "4px auto")
            .style("position", "relative");
    
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
            updateVisualization() 
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
            titleText = "Surgery Distributions";
            let percent = Math.round((total / totalSurgeries) * 100);
            data = [
                { label: optype, value: total || 1, color: "red" },
                { label: "Other Surgeries", value: totalSurgeries - total, color: "lightgrey" }
            ];
            color = "red";
            textContent = `<b style="color:${color}"> ${optype}</b> surgeries constituted <b style="color:${color}">${percent}%</b> of <b>all</b> surgeries.`;
            descriptionText = `Out of <b>${totalSurgeries}</b> surgeries in the dataset, ${maxSurgeryType} was the most frequent at <b>${maxPercent}%</b>. Other common procedures included digestive at  and hepatic system surgeries.`;
        } else if (currentState === 1) {
        } else if (currentState === 1) {
            titleText = "Cancer vs Non-Cancer Diagnoses by Surgery";
            let percent = total === 0 ? 0 : Math.round((totalCancer / total) * 100);
            data = [
                { label: "Cancer", value: totalCancer || 1, color: "orange" },
                { label: "Other", value: total - totalCancer || 1, color: "lightgrey" }
            ];
            color = "orange";
            textContent = `<b style="color:${color}">${percent}%</b> of all <b style="color:${color}">${optype}</b> surgery were <b style="color:${color}">cancer</b> diagnoses.`;
            descriptionText = `Cancer-related surgeries accounted for <b>${percentCancer}%</b> of all procedures. That is <b>${totalCancer}</b> out of ${total}. The most common cancer surgeries affected the <b>colorectal, hepatic, and reproductive systems</b>.
            The cancer diagnoses included the words such as: carcinoma, sarcoma, tumor, neoplasm, cancer,leukemia, lymphoma, metastasis... Although the cancer diagnosis may not have been the specific cause for the surgery, it was the underlying circumstance for the individual`;
        } else if (currentState === 2) {
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
            titleText = "Gender and Cancer Diagnoses";
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
            descriptionText = `Among cancer surgeries, <b>${percentMale}%</b> were in male patients and <b>${percentFemale}%</b> in female patients. The highest rates of cancer diagnoses in men were seen in the digestive system, while in women, reproductive system surgeries dominated.`;
        }
    

            
        d3.select("#description-title").html(titleText);
        d3.select("#description-text").html(descriptionText);
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
    

    function updateAll() {
        let totalSurgeries = d3.sum(Object.values(surgeryData));
        updateTitle();
        updateLegend();
        updateDots();
        updateVisualization()
        
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


    nextButton.addEventListener("click", function () {
        currentState = (currentState + 1) % 3;
        updateAll();
    });

    previousButton.addEventListener("click", function () {
        currentState = (currentState - 1 + 3) % 3;
        updateAll();
    });

    descriptionContainer.node().addEventListener("scroll", function () {
        let scrollY = descriptionContainer.node().scrollTop;
        let containerHeight = descriptionContainer.node().scrollHeight - descriptionContainer.node().clientHeight;
        let newState = Math.floor((scrollY / containerHeight) * 3); // Dividing scroll height into three states

        if (newState !== currentState) {
            currentState = newState;
            updateVisualization();
        }
    });

    /*** Initial Setup ***/
    updateVisualization();

});