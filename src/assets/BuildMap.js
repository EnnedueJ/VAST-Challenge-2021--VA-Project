const d3 = require('d3')


export default function BuildMap() {

    let topology;
    const dispatch = d3.dispatch("id");

    function dispatcher(event) {
        const id = event.target.__data__.properties.employeeID
        dispatch.call("id", this, id)
    }

    function me(selection) {
        //topology and projection section
        const boundaries = selection.node().parentNode.getBoundingClientRect();
        const projection = d3.geoMercator()
            .fitSize(
                [boundaries.width, boundaries.height],
                topology
            )

        const path = d3.geoPath().projection(projection)
        path.pointRadius(5)

        

        if (selection.classed("features")) {
            //features section
            selection.selectAll("g").remove()

            const lastIDs = d3.groups(selection.datum().features, d => d.properties.employeeID).map(d => d[1].at(-1))

            const gs = selection.selectAll("g")
                .data(selection.datum().features)
                .join("g")
                .filter(d => d.properties.name != "Default")
                
            let currId;
            gs.append("path")
                .attr("d", path)
                .attr("fill", d =>  lastIDs.includes(d) ? "red" : "none")
                .attr("stroke-opacity", d =>  lastIDs.includes(d) ? "100%" : "10%")
                .on("mouseover", (event) => {
                    currId = event.target.__data__.properties.employeeID
                    selection.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? "blue" : "yellow")
                        
                })
                .on("mouseout", () => {
                    selection.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? "red" : "none")
                })
                .on("click", dispatcher)


            // gs.append("text")
            //     .text(d => d.properties.employeeID)
            //     .attr("transform", d => "translate("+ projection(d.geometry.coordinates) + ")")

        } else {
            //map section
            selection.selectAll("path")
            .data(selection.datum().features)
            .join("path")
                .attr("d", path)
        }

    
        

        
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

    me.on = function (eventType, handler) {
        dispatch.on(eventType, handler);

        return me;
    }

    return me;

}
