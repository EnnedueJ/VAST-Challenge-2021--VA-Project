//const d3 = require('d3')

export default function BuildMap(data, {
    width = 600,
    height = 450,
    path,
    backgroundColor = "white",
    stroke = "black",
    strokeLinecap = "round",
    strokeLinejoin = "round",

}) {

    function me(selection) {

        const svg = selection.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("pointer-events", "none")
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin);

        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
                .attr("fill", backgroundColor)
                .attr("d", path)
                
            

    }

    return me;

}
