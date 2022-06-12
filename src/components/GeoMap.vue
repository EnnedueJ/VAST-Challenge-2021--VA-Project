<template>
    <svg id="mapsvg" style="width:950; height:700;">
        <image class="map-png" xlink:href="/data/MC2-tourist.jpg" preserveAspectRatio="none"></image>
        <g class="world" ref="world"></g>
        <g class="features" ref="features"></g>
    </svg>
</template>

<script>

const d3 = require("d3");
const topojson = require("topojson")
import BuildMap from "@/assets/BuildMap.js";

const topologyPath = "/geospatial/Abila.json"
const map = BuildMap()

export default {
    name : "GeoMap",
    props : {
        featureCollection: {
            type: Object,
            default: () => ({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            name: 'Default'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [0, 0]
                        }
                    }
                ]
            })
        }
    },
    data() {
        return {
        }
    },

    mounted() {

        const gWorld = d3.select(this.$refs.world)
        const gFeatures = d3.select(this.$refs.features)

        d3.json(topologyPath)
            .then((json) => {

                const featureName = topologyPath.match(/(\w*).json/)[1]
                const topology = topojson.feature(json, json.objects[featureName])
                map.addTopology(topology)

                gWorld.datum(topology).call(map)

               })

        gFeatures.datum({...this.featureCollection}).call(map)

    },

    watch: {
        featureCollection(features) {
            const gFeatures = d3.select(this.$refs.features)

            gFeatures.datum(features)
                .call(map.on("id", d => {
                    this.$emit('emitId', d);
                    }
                ))

        },
        deep : true
    }

}

</script>

<style>

g.world path {
    stroke: rgb(84, 83, 83);
    stroke-linecap:round;
    stroke-linejoin: round;
    fill: none;
    
}

g.features path {
    stroke-width: 1px;
    stroke-opacity: 0;
    stroke: black;
}

image {
    width: 100%;
    height: 99%;
    opacity: 80%;
}
</style>