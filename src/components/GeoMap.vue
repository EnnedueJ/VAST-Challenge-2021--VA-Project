<template>
    <div id="map"></div>
</template>

<script>
const d3 = require("d3");
const topojson = require("topojson");

import BuildMap from "@/assets/BuildMap.js";

//const topologyPath = "/geospatial/Kronos_Island.json"
const topologyPath = "/geospatial/Abila.json"

export default {
    name : "GeoMap",
    data() {
        return
    },

    mounted() {

        fetch(topologyPath)
            .then(data => data.json())
            .then(json => {

                const width = 700;
                const height = 450;

                const featureName = topologyPath.match(/(\w*).json/)[1]
                const topology = topojson.feature(json, json.objects[featureName])

                const projection = d3.geoMercator()
                    .fitExtent( //fit projection to start on [0,0] top left corner and [width, height] as the bottom right corner
                        [
                            [0, 0],
                            [width, height],
                        ],
                        topology
                    )

                const path = d3.geoPath(projection)

                const map = BuildMap(topology, {
                    width : width,
                    height : height,
                    path : path,
                    })
                

                d3.select("#map")
                    .call(map)

                }
            )

    }
}

</script>

<style>

#map {
    height: 50%;    
}

</style>