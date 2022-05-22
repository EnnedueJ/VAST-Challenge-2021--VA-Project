<template>

    <b-container>
        <b-row>
            <h1>Mini Challenge 2</h1>
        </b-row>
        <b-row>
            <b-col class="loc-plot">
                <b-row id="titles">
                    <h4>Location popularity</h4>
                    <h6><i>Click on a location to inspect.</i></h6>
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
                    <LocationsChart :id="'plot-1'" :popsAggr="dataLocations" @targetChange="setTarget"/>
                </b-row>
            </b-col>
            <b-col class="map">
                <h4>Abila's Map</h4>
                <GeoMap :featureCollection="pointCollection"/>
                <b-row class="under-map">
                    <b-col class="dropdown">
                        <h6>Day</h6>
                        <b-form-select
                            v-model="selectedDay.value"
                            :options="selectedDay.options"
                            class="mb-1"
                            value-field="value"
                            text-field="value"
                            style="width:80%"
                            > 
                        </b-form-select>
                        
                    </b-col>
                    <b-col class="form-range" lg="9">
                        <b-form-input 
                            id="range-bar" 
                            type="range"

                            style="width:90%">
                        </b-form-input>
                    </b-col>
                </b-row>
            </b-col>
            <b-col>
                <h4>Employees</h4>
                <b-list-group class="persons-list">
                    <b-list-group-item class="flex justify-content-between"  v-for="p in employees" :key="p.id">
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
        <b-row class="row-info-charts">
            <h5><b>{{locationTarget}}</b></h5>
            <b-col class="col-info-charts">
                <InfoChart :id="'plot-2'" :popsAggr="datesData" :xaxis="xaxis1" :title="'Days'"/>
                <InfoChart :id="'plot-3'" :popsAggr="timeData" :xaxis="xaxis2" :title="'Times'"/>
            </b-col>
            <b-col>
                
            </b-col>
            <b-col></b-col>
        </b-row>
    </b-container>
    
</template>

<script>
const crossfilter = require("crossfilter");
const d3 = require("d3");

import GeoMap from "./GeoMap.vue";
import LocationsChart from "./LocationsChart.vue"
import InfoChart from "./InfoChart.vue"

let cardsCf;
let gpsCf;
let dayDim;
let cardDim;
let locDim;
let dateDim;
let timeDim;

export default {
    name : "MC2Gastech",
    components: {
    GeoMap,
    LocationsChart,
    InfoChart
    },

    data() {
        return {
            employees: [],
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
            cardsData: [],
            dataLocations: [],
            datesData: [],
            timeData: [],
            cardType: {
                value: "Total",
                options: ["Total","Credit Card","Loyalty Card"]
            },
            locationTarget: "Total",
            xaxis1 : {
                    title: "January",
                    type: "date",
                    tickformat: "%a %d"
                },

            xaxis2 : {
                title: "time",
                tickformat : ".2f",
                range: [2, 24]
            },
            selectedDay: {
                value: null,
                options: [
                ],
            },
        }
    },

    mounted() {
        
        Promise.all([
            d3.csv("/data/cc_data.csv"),
            d3.csv("/data/loyalty_data.csv")
        ]).then((res) => {
            this.cardsData = res[0].concat(res[1]).map((d) => {
                return {
                    date: new Date(d.timestamp.substring(0,10)),
                    time: d.timestamp.length > 10 ? Number(d.timestamp.substring(11,16).replace(":",".")) : null,
                    location: d.location,
                    price: +d.price,
                    ccnum: d.last4ccnum ? +d.last4ccnum : null,
                    loyaltynum: d.loyaltynum ? +d.loyaltynum : null
                }
            })

            cardsCf = crossfilter(this.cardsData)
            cardDim = cardsCf.dimension(d => d.loyaltynum)
            locDim = cardsCf.dimension(d => d.location)
            dateDim = cardsCf.dimension(d => d.date)
            timeDim = cardsCf.dimension(d => d.time)

            this.dataLocations = this.getLocationByCardType(this.cardType)

            this.setInfoChartData()

        })

        //car dataset loading in order to populate Employees list
        d3.csv("/data/car-assignments.csv")
            .then((res) => {
                const employees = res.map((d) => {
                    return {
                        name : d.FirstName + " " + d.LastName,
                        id : +d.CarID,
                        employment : d.CurrentEmploymentTitle
                    }

                })

                this.employees = employees
            })

        d3.csv("/data/gps.csv")
            .then((res) => {
                gpsCf = crossfilter(res)
                dayDim = gpsCf.dimension(d => d.Timestamp.substring(0,10))
                const uniqueDays = dayDim.group().all().filter(d => d.value)
                this.selectedDay.options = uniqueDays.map(d => ({
                    value: d.key
                    }))
                
                this.selectedDay.value = this.selectedDay.options[0].value
                this.daySelection()

            })

        
    },

    watch: {
        cardType: {
            handler(newVal) {
                this.dataLocations = this.getLocationByCardType(newVal)
            },
            deep: true,
        },

        locationTarget: {
            handler(newVal) {
                console.log(newVal)
                this.setInfoChartData()
            }
        },
        selectedDay: {
            handler(newVal) {
                this.selectedDay.value = newVal.value
                console.log(this.selectedDay.value)
                this.daySelection()
            },
            deep:true
        }

    },

    methods : {
        listToGeoJson(list) {
            const fc = {
                type : 'FeatureCollection',
                features : list.map( (row) => {
                    return {
                        type: 'Feature',
                        properties: {
                            employeeID: +row.employee,
                            time: row.time,
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [+row.x, +row.y]
                        }
                    }
                })

            }

            return fc;
        },

        getLocationByCardType(card) {
            if (card.value) { //check if card value is valid
                if (card.value == "Credit Card")  {
                    cardDim.filter(d => d == null);
                } else if (card.value == "Loyalty Card") {
                    cardDim.filter(d => d != null);
                } else {
                    cardDim.filterAll();
                }

                const dLocations = locDim.group().reduceCount().all();

                this.setInfoChartData()
                
                return dLocations.sort((x,y) => d3.ascending(x.value, y.value));
            }

            return this.dataLocations;
            
             
        },

        setTarget(tar) {
            this.locationTarget = tar;
        },

        setInfoChartData() {
            if (this.locationTarget != "Total") {
                locDim ? locDim.filterAll() : null
                locDim.filter(d => d == this.locationTarget)
                
            }
            
            this.datesData = dateDim.group().reduceCount().all();
            this.timeData = timeDim.group().all().filter(d => d.key != null);
            
        },

        daySelection() {
            dayDim.filterAll()
            dayDim.filter(d => d == this.selectedDay.value);
            const day = dayDim.top(Infinity);
            const paths = day.map(row => ({
                employee: row.id,
                time: new Date(row.Timestamp),
                x: +row.long,
                y: +row.lat
            }));
        
            const finalPaths = paths.sort((x,y) => d3.ascending(x.time, y.time));

            this.pointCollection = this.listToGeoJson(finalPaths);
            

            // const trajs = d3.nest()
            //     .key(d => d.employee)
            //     .entries(paths)


            // const tr = d3.values(trajs).map((d) => {
            //     const pls = d.values.map((p, i) => {
            //         if (i == 0) return 0;
            //         return eu
            //     })
            // })
        }
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
    margin-bottom: 50px;
    gap:10px;
}

h1 {
    display: flex;
    align-items: center;
    justify-content: center;
}

h4, h5 {
    border-bottom: 0.5px solid #00000017;
}



.col {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.loc-plot {
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

.col-info-charts {
    flex-direction: row;
}

.row-info-charts {
    padding: 20px;
    padding-top: 5px;
}

.persons-list {
    width: 300px;
    height: 700px;
    overflow: scroll;
    overflow-x: hidden;
}


.mb-1 {
    width: 30%;
    cursor: pointer;
}

.form-range {
    width: 70%;
    height: 80%;
}

.dropdown {
    width: 15%;
    flex-direction: row;
    
}

.dropdown * {
    border: 0;
    margin-right: 10px;
    align-items: center;
    justify-content: center;
}

.dropdown h6 {
    font-weight: bold;
    margin: 10px;
    
}


.under-map {
    gap: 40px;
    box-shadow: 0.3px 0.1px 0.3px 0.3px rgba(0,0,0,0.3);
    border-radius: 30px;
}

.form-range * {
    margin: 7px;
    align-items: center;
    justify-content: center;
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