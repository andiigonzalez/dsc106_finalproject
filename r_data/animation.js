// animation.js
export function animateScalpels() {
    const width = 800, height = 600;  // Canvas dimensions
    const centerX = width / 2, centerY = height / 2;  // Center position

    // Define starting positions for each scalpel
    const scalpels = [
        { id: "tl", x: 100, y: 0, img: "Images/scalpel_tl.png" },  // Top-left
        { id: "tr", x: 700, y: 0, img: "Images/scalpel_tr.png" },  // Top-right
        { id: "bl", x: 100, y: 450, img: "Images/scalpel_bl.png" },  // Bottom-left
        { id: "br", x: 700, y: 450, img: "Images/scalpel_br.png" }   // Bottom-right
    ];

    // Create the SVG container
    const svg = d3.select("#animation-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "transparent");

    // Append the central image (whole human body)
    svg.append("image")
        .attr("xlink:href", "Images/wholehuman_body.png")
        .attr("x", centerX - 150)
        .attr("y", centerY - 300)
        .attr("width", 360)
        .attr("height", 540)
        .style("opacity", 1);  // Always visible

    // Function to animate a scalpel
    function animateScalpel(scalpel) {
        svg.append("image")
            .attr("xlink:href", scalpel.img)
            .attr("x", scalpel.x)
            .attr("y", scalpel.y)
            .attr("width", 50)
            .attr("height", 50)
            .style("opacity", 0)
            .transition()
            .duration(1000)  // 1 sec fade-in
            .style("opacity", 1)
            .transition()
            .duration(2000)  // 2 sec move toward center
            .attr("x", centerX + 5)
            .attr("y", centerY - 150)
            .transition()
            .duration(1000)  // 1 sec fade-out
            .style("opacity", 0)
            .on("end", function() {
                d3.select(this).remove();  // Remove element after animation
                setTimeout(() => animateScalpel(scalpel), 1000);  // Restart animation after delay
            });
    }

    // Start the animation for each scalpel
    scalpels.forEach(scalpel => animateScalpel(scalpel));
}
