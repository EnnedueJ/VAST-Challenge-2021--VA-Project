<template>
    <div>
        <div :id="id" :data="popsAggr" :layout="layout" :options="options"/>
    </div>
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-gl2d.min.js");
const d3 = require("d3");

export default {
    name: "ParallelCoordinates",
    props: {
        id: String,
        popsAggr: Array,
        xaxis: Object,
        title: String,
    },
    data() {
        return {
            finalData : [],
            data : {
                type: "parcoords",
                line: {
                    color: 'rgb(200,50,100)',
                },
                labelfont: {
                    size: 18,
                }
            },
            layout: {
                width:900,
                height: 800,
                font: {
                    family: "Trebuchet MS, sans-serif"
                },

            },
            options: {
                displayModeBar: false,
            }
        }
    },
    mounted() {
        this.plot = d3.select("#"+this.id).node()
        Plotly.newPlot(this.plot, [this.data], this.layout, this.options)

    },
    watch: {
        popsAggr(datum) {
            console.log(datum)
            this.finalData = datum.map(row => {
                return {
                    ...row,
                    card : row.ccnum ? String(row.ccnum) : row.loyaltynum,
                }
            })

            const cards = this.unpack(this.finalData, 'card').sort()
            const times = this.unpack(this.finalData, 'time')
            const locations = this.unpack(this.finalData, 'location')
            const prices = this.unpack(this.finalData, 'price')
            const setCards = [...new Set(cards)]
            const setLocations = [...new Set(locations)]

            this.data.dimensions = [{
                    label: "card",
                    values: cards.map(c => setCards.indexOf(c)),
                    range: [0,setCards.length],
                    ticktext: setCards,
                    tickvals: d3.range(setCards.length),
                }, {
                    label: "time",
                    values: times,
                    range: [0,Math.max(...times)],
                }, {
                    label: "location",
                    values: locations.map(l => setLocations.indexOf(l)),
                    range: [0,setLocations.length],
                    ticktext: setLocations,
                    tickvals: d3.range(setLocations.length)
                }, {
                    label: "price",
                    values: prices,
                    range: [0,Math.max(...prices)]
                }
            ]

            Plotly.react(this.plot, [this.data], this.layout, this.options)
            
        },
    },
    methods: {
        unpack(rows, key) {
            return rows.map(function(row) {
                return row[key];
            });
        }
    }
}
</script>

<style scoped>
* {
    margin: 0;
}

h6 {
    padding-left: 15px;
}

#plot-6 {
    height: 900px;
}
</style>