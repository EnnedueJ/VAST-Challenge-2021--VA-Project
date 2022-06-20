<template>

    <b-container>
        <b-row>
            <h1>Mini Challenge 2</h1>
        </b-row>
        <b-row>
            <b-col class="loc-plot">
                <b-row id="titles">
                    <h4>Locations popularity</h4>
                    <h6><i>Click on a location to inspect. Double click to reset.</i></h6>
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
                <GeoMap :featureCollection="pointCollection" @emitId="employeeSelection"/>
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
                            v-model="timeInterval.value"
                            min="0"
                            :max=timeInterval.max
                            :step="5"
                            >
                        </b-form-input>
                    </b-col>
                    <div class="timeValue">
                        {{timeInterval.value != 0 ? 
                            pointCollection.features.at(-1).properties.dateTime.toString().split(" ")[4] 
                            : "00:00"}}
                    </div>
                </b-row>
            </b-col>
            <b-col>
                <h4>Employees</h4>
                <b-list-group class="persons-list">
                    <b-list-group-item class="flex justify-content-between" 
                        v-for="p in employees" 
                        :key="p.id"
                        :variant="p.selected ? 'warning' : ''"
                        :style="{'border-left':'3px solid '+ employmentColors[p.id]}">
                        {{p.name}}
                        <b-badge variant="light" pill
                            style="margin-left:20px; padding-left:15px;">
                            {{p.id}}
                        </b-badge>
                        <br/>
                        <small style="font-style: italic;">{{p.employmentTitle}}</small>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
            
        </b-row>
        <b-row class="row-info-charts">
            <h4><b>Location: </b><i>{{locationTarget}}</i> - <b>Card type: </b><i>{{cardType.value}}</i></h4>
            <b-col class="col-info-charts">
                <b-col class="inner-infocharts">
                    <h5 class="info-titles"><b>Visits</b></h5>
                    <InfoChart id='plot-2' :popsAggr="locationsByDate" :xaxis="xaxis1"/>
                    <InfoChart id='plot-3' :popsAggr="locationsByTime" :xaxis="xaxis2"/>
                </b-col>
                <b-col class="parcoords">
                    <h5 class="info-titles"><b>Transactions of the day</b></h5>
                    <i>{{new Date(selectedDay.value).toDateString()}}</i>
                    <ParallelCoordinates id='plot-6' :popsAggr="featuresOTD"/>
                </b-col>
                <b-col class="inner-infocharts">
                    <h5 class="info-titles"><b>Money Spent</b></h5>
                    <InfoChart id='plot-4' :popsAggr="priceByDate" :xaxis="xaxis1"/>
                    <InfoChart id='plot-5' :popsAggr="priceByTime" :xaxis="xaxis2"/>
                </b-col>
            </b-col>
        </b-row>
    </b-container>
    
</template>

<script>
const crossfilter = require("crossfilter");
const d3 = require("d3");

import GeoMap from "./GeoMap.vue";
import LocationsChart from "./LocationsChart.vue"
import InfoChart from "./InfoChart.vue"
import ParallelCoordinates from "./ParallelCoordinates.vue"

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
    InfoChart,
    ParallelCoordinates
    },

    data() {
        return {
            employees: [],
            employmentColors: {},
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
            locationsByDate: [],
            locationsByTime: [],
            priceByDate: [],
            priceByTime: [],
            featuresOTD: [],
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
            timeInterval: {
                value:0,
                max:52000
            }
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
                    loyaltynum: d.loyaltynum ? d.loyaltynum : null
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
                const uniqueEmpTypes = [...new Set(res.map((d) => d.CurrentEmploymentType))]

                const colorScale = d3.scaleOrdinal()
                    .domain(uniqueEmpTypes)
                    .range(d3.schemeCategory10)

                const employees = res.map((d) => {

                    return {
                        name : d.FirstName + " " + d.LastName,
                        id : +d.CarID,
                        employmentTitle : d.CurrentEmploymentTitle,
                        employmentType : d.CurrentEmploymentType,
                    }

                })
                
                this.employees = employees
                this.employees.forEach((row) => {
                    this.employmentColors[row.id] = colorScale(row.employmentType)
                    })
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
            handler() {
                this.setInfoChartData()
            }
        },
        selectedDay: {
            handler(newVal) {
                if (newVal != this.selectedDay.value) {
                    this.timeInterval.value = 0;
                }
                this.selectedDay.value = newVal.value
                this.daySelection()
            },
            deep:true
        },
        timeInterval: {
            handler() {
                this.daySelection();
            },
            deep:true,
        },
        employeeSelected: {
            handler(newVal) {
                this.employeeSelection(newVal);
            }
        },

    },

    methods : {
        listToGeoJson(list) {
            const fc = {
                type : 'FeatureCollection',
                features : list.map( (row, id) => {
                    return {
                        type: 'Feature',
                        properties: {
                            employeeID: +row.employee,
                            time: id,
                            dateTime: row.time,
                            employmentColor: this.employmentColors[+row.employee],
                            },
                        geometry: {
                            type: 'Point',
                            coordinates: [+row.x, +row.y]
                        }
                    }
                    
                }).filter(d => (d.properties.time <= this.timeInterval.value))
            }

            this.featuresOTD = dateDim.filter(d => d.getDate() == new Date(this.selectedDay.value).getDate())
                    .top(Infinity)
            dateDim.filterAll()

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

        employeeSelection(ids) {
            
            this.employees = this.employees.map((em) => {
                if (ids.includes(em.id)) {
                    return {
                        ...em,
                        selected: true,
                    }
                }
                return {
                    ...em,
                    selected: false,
                }
            }).sort((a,b) => (Number(a.id) || 36) - (Number(b.id) || 36))
            .sort((a,b) => b.selected - a.selected);
        },

        setInfoChartData() {
            locDim ? locDim.filterAll() : null
            if (this.locationTarget != "Total") {
                locDim.filter(d => d == this.locationTarget)
                
            }
            this.priceByDate = dateDim.group().reduceSum(function(d) { return d.price; }).all();
            this.priceByTime = timeDim.group().reduceSum(function(d) { return d.price; }).all();
            this.locationsByDate = dateDim.group().reduceCount().all();
            this.locationsByTime = timeDim.group().all().filter(d => d.key != null);

            this.featuresOTD = dateDim.filter(d => d.getDate() == new Date(this.selectedDay.value).getDate())
                    .top(Infinity)
            dateDim.filterAll()
        },

        daySelection() {
            dayDim.filterAll()
            dayDim.filter(d => d == this.selectedDay.value);
            const day = dayDim.top(Infinity);
            const paths = day.map((row) => ({
                employee: row.id,
                time: new Date(row.Timestamp),
                x: +row.long,
                y: +row.lat
            }));
        
            const finalPaths = paths.sort((x,y) => d3.ascending(x.time, y.time));
            this.timeInterval.max = finalPaths.length
            this.pointCollection = this.listToGeoJson(finalPaths);
        },
        
        selectionOTD() {
            this.featuresOTD = dateDim.filter(d => d.getDate() == new Date(this.selectedDay.value).getDate())
                    .top(Infinity)
            dateDim.filterAll()
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
    margin-top:5px;
    margin-bottom: 0;
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
    position:relative;
}

.btn-group {
    justify-content: right;
    vertical-align: middle;
    
}

.row-info-charts {
    padding: 2px;
    padding-top: 5px;
}

.row-info-charts h4 {
    text-align: center;
}

.info-titles {
    height: 20px;
    padding: 5px;
    border: 0;
}

.col-info-charts {
    height: 650px;
    flex-direction: row;
}

.inner-infocharts {
    align-items: center;
    box-shadow: inset 2px -2px 2px -1px #8b7e7e97;
    border-radius: 10px;
}
.parcoords {
    height: 900px;
    padding: 10px;
    box-shadow: inset 2px -2px 2px -1px #8b7e7e97;
    border-radius: 10px;
    align-items: center;
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


.dropdown {
    width: 25%;
    flex-direction: row;
}

.dropdown * {
    border: 0;
    align-items: center;
    justify-content: center;
}

.dropdown h6 {
    font-weight: bold;
    margin: 10px;
}


.under-map {
    box-shadow: 0.3px 0.1px 0.3px 0.3px rgba(0,0,0,0.3);
    border-radius: 30px;
    flex: flex-start;
}

.under-map:nth-child(2) {
    margin: 0;
}

.form-range {
    text-align: right;
    width:60%;
    height: 80%;
}

.form-range input {
    width: 100%;
}

.form-range input {
    margin: 7px;
}

.timeValue {
    width: 10%;
    text-align: center;
    padding: 7px;
}

::-webkit-scrollbar {
    width: 5px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(194, 189, 189, 0.3); 
    border-radius: 5px;
}

::-webkit-scrollbar-thumb {
    background: rgba(160, 130, 96, 0.295);
}

::-webkit-scrollbar-thumb:hover {
    background: rgb(97, 91, 83);
}


</style>