const d3 = require('d3');


export default function BuildMap() {
    let container;
    let topology;
    const dispatch = d3.dispatch("id");

    // function brushended({selection}) {
    //     if (!selection) {
    //         return;
    //     }
    //     const list = [];
    //     selection.datum().forEach((em) => {
    //         list.push(em.properties.employeeID)
    //     });
    //     dispatch.call("id", this, [...new Set(list)])
    // }
    // const brush = d3.brush()
    //     .on("end", brushended)

    function dispatcher(event) {
        const id = event.target.__data__.properties.employeeID;
        dispatch.call("id", this, [id]);
    }
    
    const opacityScale = d3.scaleLinear()
        .domain([1,50])
        .range(["rgba(0,0,0,0)","rgba(0,0,0,0.4)"])


    function opacityWRTrajectories(trajs, d) {
        return trajs ? "rgba(0,0,0,0.1)" : opacityScale(d.properties.timeId)
    }


    function me(selection, trajectories=false) {
        container = selection;
        //topology and projection section
        const boundaries = container.node().parentNode.getBoundingClientRect();
        const projection = d3.geoMercator()
            .fitSize(
                [boundaries.width, boundaries.height],
                topology
            )

        const path = d3.geoPath().projection(projection);
        //path.pointRadius(4);
        
        //features section
        if (container.classed("features")) {

            //grouping employees by ID to extract trajectories
            const feats = Array.from(d3.group(container.datum().features, d => d.properties.employeeID), 
                ([, value]) => value.slice(trajectories ? 0 : -40).map( (rec,i) => ({
                            ...rec,
                            properties : Object.assign(rec.properties, {timeId: i})
                        }))
                    )

            //features to draw
            const feats1 = [].concat.apply([],feats)
            //ids for employees actual position
            const lastIDs = d3.groups(feats1, d => d.properties.employeeID).map(d => d[1].at(-1));
            //final features to draw
            const finalFeats = trajectories ?
                feats1 :
                feats1.filter(d => lastIDs.includes(d) || feats1.at(-1).properties.time - d.properties.time < 40) //reducing trajectories on employee stop 


            //preprocessing for drawing circles on employees proximity
            const heads = finalFeats.filter(d => lastIDs.includes(d)).map(d => [d.geometry.coordinates[0], d.geometry.coordinates[1]])
            const coords = []
            for (const i in heads) {
                for (const j in heads) {
                    if (i != j ) {
                        const a = heads[i]
                        const b = heads[j]
                        const diff = Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1])
                        const centroid = ([(a[0]+b[0])/2, (a[1]+b[1])/2]).map(d => +d.toFixed(6))
                        diff < Math.pow(8,-4) ? coords.push(centroid) : null
                    }
                }
            }
            const coords1 = new Set(coords.map(JSON.stringify));
            const relCoords = Array.from(coords1).map(JSON.parse);

            let currId;

            //draw circles for people proximity
            drawCircles(relCoords, projection)

            //gps paths
            container.selectAll("path")
                .data(finalFeats)
                .join("path")
                .attr("d", path.pointRadius(3))
                .attr("fill", d => lastIDs.includes(d) ? d.properties.employmentColor : opacityWRTrajectories(trajectories, d))
                .on("mouseover", (event) => {
                    currId = event.target.__data__.properties.employeeID
                    container.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? "blue" : "yellow")
                        .filter(d => lastIDs.includes(d))
                        .attr("d",path.pointRadius(6))
                        
                })
                .on("mouseout", () => {
                    container.selectAll("path")
                        .filter(d => d.properties.employeeID == currId)
                        .attr("fill", d =>  lastIDs.includes(d) ? d.properties.employmentColor : opacityWRTrajectories(trajectories, d))
                        .filter(d => lastIDs.includes(d))
                        .attr("d",path.pointRadius(5))
                })
                .on("click", dispatcher)

            //bringing heads on top of DOM inside the g-features section of svg
            container.selectAll("path")
                .filter(d => lastIDs.includes(d))
                .attr("d",path.pointRadius(5))
                .raise()
        
        
            //container.call(brush)

        } else {
            //map section
            container.selectAll("path")
            .data(container.datum().features)
            .join("path")
                .attr("d", path)
                .attr("stroke-opacity","50%")
        }

    }    

    //outside functions
    me.addTopology = function(top) {
        topology = top;
    }

    me.on = function (eventType, handler) {
        dispatch.on(eventType, handler);

        return me;
    }

    const drawCircles = function (coords, projection) {

        container.selectAll("circle")
                .data(coords)
                .join(
                    (enter) => {
                        return enter
                            .append("circle")
                            .attr("r",0)
                    },
                    (update) => update,
                    (exit) => {
                        return exit
                            .transition()
                            .duration(1500)
                                .attr("r",0)
                    }
                )
                .attr("cx",d => projection(d)[0])
                .attr("cy", d => projection(d)[1])
                .style("fill","rgba(255,153,153)")
                .style("opacity","0.4")
                .lower()
                .transition()
                    .duration(1000)
                    .attr("r",30)
    }

    return me;
}
