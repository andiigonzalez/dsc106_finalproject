let step = 0; 
let charts = {}; 
let surgeryData = {};  
let cancerData = {};  
let genderData = {};  
let lines = []; // store LeaderLine objects

// On page load, fetch the CSV & parse
window.onload = function() {
  fetch('percentages.csv')
    .then(response => response.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        complete: function(results) {
          processData(results.data);
        }
      });
    });
};

function processData(data) {
  data.forEach(row => {
    const optype = row["surgery_name"];
    surgeryData[optype] = parseFloat(row["pct_of_general"]);
    cancerData[optype] = parseFloat(row["pct_cancer_indv"]);
    genderData[optype] = {
      female: parseFloat(row["cancer_pct_women"]),
      male: parseFloat(row["cancer_pct_men"])
    };
  });
  
  // Create the charts
  createCharts();
  
  // Reveal the "Next" button
  document.getElementById("next-btn").disabled = false;
}

// Create a Chart.js pie for each organ
function createCharts() {
  // For each surgery type in the CSV
  Object.keys(surgeryData).forEach(optype => {
    const canvasId = `canvas-${optype.replace(/\s+/g, '')}`; // match the HTML
    const ctx = document.getElementById(canvasId);
    if (!ctx) return; // If there's no matching chart in HTML, skip

    // initial data => Non-cancer vs cancer
    const chartData = {
      labels: ["Non-Cancer", "Cancer"],
      datasets: [{
        data: [1 - cancerData[optype], cancerData[optype]],
        backgroundColor: ["#cccccc", "#ff4444"]
      }]
    };

    charts[optype] = new Chart(ctx, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Animate chart box in
    const chartBox = document.getElementById(`chart-${optype.replace(/\s+/g, '')}`);
    if (chartBox) {
      chartBox.style.opacity = 1; // Show chart box
    }

    // Draw arrow from organ to chart
    const organEl = document.getElementById(`organ-${optype.replace(/\s+/g, '')}`);
    if (organEl && chartBox) {
      const line = new LeaderLine(
        LeaderLine.pointAnchor(organEl, { x: '50%', y: '50%' }),
        LeaderLine.pointAnchor(chartBox, { x: '50%', y: '50%' }),
        {
          color: '#999',
          startPlug: 'behind',
          endPlug: 'arrow2'
        }
      );
      lines.push(line);
    }
  });
}

// Called when user clicks "Next"
function nextStep() {
  step++;

  if (step === 1) {
    // Step 2: color the cancer slice (already red in the example),
    // or highlight it more distinctly if you like
    Object.keys(charts).forEach(optype => {
      const chart = charts[optype];
      // e.g. make the cancer slice bright red
      chart.data.datasets[0].backgroundColor = ["#cccccc", "#ff0000"];
      chart.update();
    });
  } 
  else if (step === 2) {
    // Step 3: split cancer slice into male/female
    Object.keys(charts).forEach(optype => {
      const chart = charts[optype];
      const maleVal = genderData[optype].male * cancerData[optype];
      const femaleVal = genderData[optype].female * cancerData[optype];
      // new data => [nonCancer, maleCancer, femaleCancer]
      chart.data.labels = ["Non-Cancer", "Male Cancer", "Female Cancer"];
      chart.data.datasets[0].data = [1 - cancerData[optype], maleVal, femaleVal];
      chart.data.datasets[0].backgroundColor = ["#cccccc", "#4444ff", "#ff44aa"];
      chart.update();
    });

    // no more steps, disable next
    document.getElementById("next-btn").disabled = true;
  }
}
