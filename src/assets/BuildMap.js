const d3 = require('d3');


export default function BuildMap() {
    let container;
    let topology;
    const dispatch = d3.dispatch("id");

    function dispatcher(event) {
        const ids = event.target.__data__.properties ? [event.target.__data__.properties.employeeID] : event.target.__data__.ids.map(Number)
        dispatch.call("id", this, ids);
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
                feats1.filter(d => lastIDs.includes(d) || feats1.at(-1).properties.time - d.properties.time < 70) //reducing trajectories on employee stop 

            let currId;

            //preprocessing for drawing circles on employees proximity
            const heads = finalFeats.filter(d => lastIDs.includes(d)).map(d => [d.properties.employeeID, d.geometry.coordinates[0], d.geometry.coordinates[1]])
            const finalCircles = computeCircles(heads)
            drawCircles(finalCircles, projection)

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
                .attr("cx",d => projection(d.coordinates)[0])
                .attr("cy", d => projection(d.coordinates)[1])
                .style("fill","rgba(255,153,153)")
                .style("opacity","0.6")
                .style("cursor","pointer")
                .attr("stroke","black")
                .attr("stroke-width",0)
                .on("mouseover", (e,) => {
                    d3.select(e.target)
                        .transition()
                        .duration(300)
                        .attr("stroke-width",2)
                        .raise()
                })
                .on("mouseout", (e,) => {
                    d3.select(e.target)
                        .transition()
                        .duration(300)
                        .attr("stroke-width",0)
                })
                .on("click", dispatcher)
                .lower()
                .transition()
                    .duration(1000)
                    .attr("r",30)

    }

    const computeCircles = function(heads) {
        const trycoords = {}
        for (const i in heads) {
            for (const j in heads) {
                if (i != j ) {
                    const a = heads[i];
                    const b = heads[j];
                    const diff = Math.abs(a[1]-b[1]) + Math.abs(a[2]-b[2]);
                    const centroid = ([(a[1]+b[1])/2, (a[2]+b[2])/2]).map(d => +d.toFixed(6));
                    const keey = String(a[0]) + "_" + String(b[0])
                    diff < Math.pow(8,-4) ? trycoords[keey] = String(centroid.map(d => +d.toFixed(4))) : null;
                }
            }
        }

        const circles = {}
        for (const [key, value] of Object.entries(trycoords)) {
            if (!circles[value]) {
                circles[value] = [key]
            } else {
                circles[value].push(key)
            }
        }

        const finalCircles = [] 
        for (const [key, value] of Object.entries(circles)) {
            const ids = value.reduce((p,c,idx) => {
                return idx == 0 ? c : p + "_" + c
            })
            .split("_")
            .flat()
            .filter((value, i, self) => self.indexOf(value) === i )

            const newCoords = key.split(",").map(parseFloat)

            finalCircles.push(Object.assign({ids: ids, coordinates: newCoords}))
        }

        return finalCircles
    }

    return me;
}
