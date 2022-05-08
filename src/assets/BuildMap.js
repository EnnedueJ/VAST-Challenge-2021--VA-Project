const d3 = require('d3')

export default function BuildMap() {

    let topology;

    function me(selection) {
        //console.log(selection.datum())

        const backgroundColor = "white";
        const stroke ="black";
        const strokeLinecap = "round";
        const strokeLinejoin = "round";

        const boundaries = selection.node().parentNode.getBoundingClientRect();
        const projection = d3.geoMercator()
            .fitSize(
                [boundaries.width, boundaries.height],
                topology
            )

        const path = d3.geoPath().projection(projection)

        const svg = d3.select(selection.node().parentNode)

        svg
            .attr("stroke", stroke)
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("fill", "none")
            .attr("background-color", backgroundColor)

        selection.selectAll("path")
            .data(selection.datum().features)
            .join("path")
                .attr("fill", "cyan")
                .attr("d", path)

        
    }    



                
        /*
        svg.selectAll("d")
                .data(topology.features)
                .join("text")
                .attr("class", "loc-label")
                .attr("transform", (d) => {
                    if (d.geometry != null) {
                        return "translate(" + projection(d.geometry.coordinates[0]) + ")"
                    } else {
                        return null
                    }
                })
                .text((d) => {
                    
                    if (d.geometry != null) {

                        const label = d.properties.FETYPE + " " + d.properties.FENAME
                        const labelsHidden = ["St","Rd","Ave","Way"]

                        return !labelsHidden.includes(d.properties.FETYPE) ? label : null
                    } 
                    return null
                })
                .attr("stroke","none")
                .attr("fill","black")
                .attr("style","font-size:15px")
            
        */
       

    me.addTopology = function(top) {
        topology = top
    }

    return me;

}
