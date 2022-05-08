<template>
    <svg style="width:700; height:500" viewbox="[0, 0, width, height]">
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

                console.log(topology)

                gWorld.datum(topology).call(map)

               })

        gFeatures.datum({...this.featureCollection}).call(map)

    },

    watch: {
        featureCollection(features) {
            const gFeatures = d3.select(this.$refs.features)
            console.log({...features.features})
            gFeatures.datum(features)
                .call(map)
        },
        deep : true
    }

}

</script>

<style scoped>


</style>