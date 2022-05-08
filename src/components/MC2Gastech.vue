<template>

    <b-container>
        <b-row>
            <h1>Mini Challenge 2</h1>
        </b-row>
        <b-row>
            <b-col class="map">
                <GeoMap :featureCollection="pointCollection"/>
            </b-col>
        </b-row>
    </b-container>
    
</template>

<script>
const crossfilter = require("crossfilter");
const d3 = require("d3");

import GeoMap from "./GeoMap.vue";

export default {
    name : "MC2Gastech",
    components: {
        GeoMap
        },

    data() {
        return {
            pointCollection: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {
                            name: 'Default'
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [1, 1]
                        }
                    }
                ]
            }
        }
    },

    mounted() {
        d3.csv("/data/car-assignments.csv")
            .then(res => {
                this.employees = crossfilter(res)
                })

        
        d3.csv("/data/gps.csv")
            .then((res) => {
                const cf = crossfilter(res);
                const gps = cf.dimension(d => d.id);
                const filter = gps.filter(1).top(Infinity);
                const features = this.csvToGeoJson(filter);
                this.pointCollection = features;
                })
            
        
        

    },

    methods : {
        csvToGeoJson(csv) {
            const fc = {
                type : 'FeatureCollection',
                features : csv.map( (row) => {
                    return {
                        type: 'Feature',
                        properties: {
                            personID: +row.id,
                            time: row.Timestamp,
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [+row.long, +row.lat]
                        }
                    }
                })

            }

            return fc
        }
    }

}





</script>




<style scoped>

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}



</style>