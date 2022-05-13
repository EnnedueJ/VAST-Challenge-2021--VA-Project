<template>

    <b-container>
        <b-row>
            <h1>Mini Challenge 2</h1>
        </b-row>
        <b-row>
            <b-col class="plots">
                <b-row id="titles">
                    <h4>Popular locations</h4>
                    <!--<h7>Most popular location by number of visitors.</h7>-->
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
                    <LocationsChart :popsAggr="dataLocations"/>
                </b-row>
            </b-col>
            <b-col class="map">
                <h4>Map</h4>
                <GeoMap :featureCollection="pointCollection"/>
            </b-col>
            <b-col>
                <h4>Persons</h4>
                <b-list-group class="persons-list">
                    <b-list-group-item class="flex justify-content-between"  v-for="p in persons" :key="p.id">
                        {{p.name}}
                        <b-badge variant="light" pill 
                            style="margin-left:20px; padding-left: 15px;">
                            {{p.id != 0 ? p.id : "f"}}
                        </b-badge>
                        <br/>
                        <small style="font-style: italic;">{{p.employment}}</small>
                    </b-list-group-item>
                </b-list-group>
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
import LocationsChart from "./LocationsChart.vue"

let cardsCf;
let dim;

export default {
    name : "MC2Gastech",
    components: {
    GeoMap,
    LocationsChart
},

    data() {
        return {
            persons: [],
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
                value: "Total",
                options: ["Total","Credit Card","Loyalty Card"]
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
                const features = this.listToGeoJson(filter);
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

        d3.csv("/data/car-assignments.csv")
            .then((res) => {
                const persons = res.map((d) => {
                    return {
                        name : d.FirstName + " " + d.LastName,
                        id : +d.CarID,
                        employment : d.CurrentEmploymentTitle
                    }

                })

                this.persons = persons
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
        listToGeoJson(csv) {
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
            
            if (card.value) { //check if card value is valid
                let newCf;
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
                
                return dLocations.sort((x,y) => d3.ascending(x.value, y.value));
            }

            return this.dataLocations
            
             
        },


    }

}

</script>




<style scoped>

.container {
    width: 2000px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: fit-content;
}

h1 {
    display: flex;
    align-items: center;
    justify-content: center;
}

h4 {
    border-bottom: 0.5px solid #00000017;
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

.persons-list {
    width: 300px;
    height: 700px;
    overflow: scroll;
    overflow-x: hidden;
}

::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px     rgba(194, 189, 189, 0.3); 
    border-radius: 5px;
}

::-webkit-scrollbar-thumb {
    background: rgba(160, 130, 96, 0.295);
}

::-webkit-scrollbar-thumb:hover {
    background: rgb(97, 91, 83);
}


</style>