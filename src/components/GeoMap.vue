<template>
    <svg id="mapsvg" style="width:950; height:700;">
        <image class="map-png" xlink:href="/data/MC2-tourist-modified.png" preserveAspectRatio="none"></image>
        <g class="world" ref="world"></g>
        <g class="features" ref="features"></g>
    </svg>
    <div class="toggle-button">
        <b-form-checkbox v-model="trajectories" name="check-button" button-variant="outline-primary" switch>
            <b>Trajectories</b>
        </b-form-checkbox>
    </div>
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
            trajectories: false,
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

            d3.select(this.$refs.features).datum(features)
                .call(map.on("id", d => {
                        this.$emit('emitId', d);
                        }
                    ), this.trajectories)

        },

        trajectories : {
            handler() {
                d3.select(this.$refs.features).datum({...this.featureCollection}).call(map,this.trajectories)
            }
        }

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

.toggle-button {
    position: absolute;
    width: 20%;
    right: 180px;
    top: 120px;
}

.form-check-input {
    cursor: pointer;
}
</style>