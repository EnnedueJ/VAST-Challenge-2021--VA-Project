<template>

    <b-container>
        <b-row>
            <h1>Mini Challenge 2</h1>
        </b-row>
        <b-row>
            <b-col class="plots">
                <b-row id="titles">
                    <h4>Popular locations</h4>
                    <h7>Most popular location by number of visitors.</h7>
                </b-row>
                <b-row>
                    <b-form-checkbox-group button-variant="outline-secondary"
                        size="sm"
                        v-model="cardType.value"
                        :options="cardType.options"
                        name="buttonsCard"
                        buttons
                        >
                    </b-form-checkbox-group>
                </b-row>
                <b-row>
                    
                    <PlotlyChart :popsAggr="dataLocations"/>
                </b-row>
            </b-col>
            <b-col class="map">
                <h4>Map</h4>
                <GeoMap :featureCollection="pointCollection"/>
            </b-col>
            
        </b-row>
        <b-row>
            
        </b-row>
    </b-container>
    
</template>

<script>
const crossfilter = require("crossfilter");
const d3 = require("d3");

import GeoMap from "./GeoMap.vue";
import PlotlyChart from "./PlotlyChart.vue"

let cardsCf;
let dim;

export default {
    name : "MC2Gastech",
    components: {
    GeoMap,
    PlotlyChart
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
            },
            dataLocations: [],
            cardType: {
                value: "All",
                options: ["All","Credit Card","Loyalty Card"]
                }
        }
    },

    mounted() {
        d3.csv("/data/car-assignments.csv")
            .then(res => {
                this.employees = crossfilter(res);
                })

        
        d3.csv("/data/gps.csv")
            .then((res) => {
                const cf = crossfilter(res);
                const gps = cf.dimension(d => d.id);
                const filter = gps.filter(1).top(Infinity);
                const features = this.csvToGeoJson(filter);
                this.pointCollection = features;
                })
            
        
        Promise.all([
            d3.csv("/data/cc_data.csv"),
            d3.csv("/data/loyalty_data.csv")
        ]).then((res) => {
            cardsCf = crossfilter(res[0]).add(res[1])
            dim = cardsCf.dimension(d => d.loyaltynum)
            this.dataLocations = this.getLocationByCardType(this.cardType)
             
        })

    },

    watch: {
        cardType: {
            handler(newVal) {
                this.dataLocations = this.getLocationByCardType(newVal)
            },

            deep: true,
        },
        
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
        },

        getLocationByCardType(card) {
            let newCf = cardsCf;
            if (card.value == "Credit Card")  {
                newCf = dim.filter(d => d == null);
            } else if (card.value == "Loyalty Card") {
                newCf = dim.filter(d => d != null);
            } else {
                newCf = dim.filter(null)
            }

            newCf = crossfilter(newCf.top(Infinity))
            const dLocation = newCf.dimension(d => d.location);
            const dLocations = dLocation.group().reduceCount().all();
            console.log(dLocations)
            
            return dLocations.sort((x,y) => d3.ascending(x.value, y.value));
             
        },


    }

}

</script>




<style scoped>

.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: fit-content;
}

h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.col {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.plots {
    align-items: right;
    text-align: right;
}


.map {
    align-items: left;
}

.btn-group {
    justify-content: right;
    vertical-align: middle;
    
}


</style>