const d3 = require('d3')


export default function BuildMap() {
    let container;
    let topology;
    const dispatch = d3.dispatch("id");

    // function brushended() {
    //     console.log(container)
    //     if (!d3.event.selection) {
    //         return;
    //     }
    //     const list = [];
    //     container.datum().forEach((em) => {
    //         list.push(em.employeeID)
    //     });
    //     dispatch.call("id", this, list)
    // }

    // const brush = d3.brush()
    //     .on("end", brushended)

    function dispatcher(event) {
        const id = event.target.__data__.properties.employeeID
        dispatch.call("id", this, [id])
    }
    


    function me(selection) {
        container = selection;
        //topology and projection section
        const boundaries = container.node().parentNode.getBoundingClientRect();
        const projection = d3.geoMercator()
            .fitSize(
                [boundaries.width, boundaries.height],
                topology
            )

        const path = d3.geoPath().projection(projection)
        path.pointRadius(4)

        

        

        if (container.classed("features")) {
            //features section
            container.selectAll("g").remove()

            const lastIDs = d3.groups(container.datum().features, d => d.properties.employeeID).map(d => d[1].at(-1))

            const feats = Array.from(d3.group(container.datum().features, d => d.properties.employeeID), ([, value]) => value.slice(-50))
            const finalFeats = [].concat.apply([],feats).sort(d => d.properties.time)

            const gs = container.selectAll("g")
                .data(finalFeats)
                .join("g")
                .filter(d => d.properties.name != "Default")
                
            let currId;
            gs.append("path")
                .attr("d", path)
                .attr("fill", d =>  lastIDs.includes(d) ? "red" : "none")
                .attr("stroke-opacity", d =>  lastIDs.includes(d) ? "100%" : "10%")
                .on("mouseover", (event) => {
                    currId = event.target.__data__.properties.employeeID
                    container.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? "blue" : "yellow")
                        
                        
                })
                .on("mouseout", () => {
                    container.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? "red" : "none")
                })
                .on("click", dispatcher)
                
            // container.append("g")
            //     .call(brush)

        } else {
            //map section
            container.selectAll("path")
            .data(container.datum().features)
            .join("path")
                .attr("d", path)
                .attr("stroke-opacity","50%")
        }

    
        

        
    }    

    me.addTopology = function(top) {
        topology = top
    }

    me.on = function (eventType, handler) {
        dispatch.on(eventType, handler);

        return me;
    }

    return me;

}
