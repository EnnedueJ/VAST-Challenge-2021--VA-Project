<template>
    <div :id="id" :data="popsAggr" :layout="layout" :options="options" />
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-basic");
const d3 = require("d3");

export default {
    name: "InfoChart",
    props: {
        id: String,
        popsAggr: Array,
    },
    data() {
        return {
            data : [{
                type: "scatter",
            }],
            layout: {
                height: 300,
                width:400,
                margin: {
                    t:10,
                    b:35,
                    r:10,
                    l:30
                },
                font: {
                    family: "Trebuchet MS, sans-serif"
                },
                xaxis: {
                    title: "January",
                    type: "date",
                    tickformat: "%a %d"
                }
                
            },
            options: {
                displayModeBar: false,
            }
        }
    },
    mounted() {
        this.plot = d3.select("#"+this.id).node()
        Plotly.newPlot(this.plot, this.data, this.layout)

    },
    watch: {
        popsAggr(datum) {
            this.data[0].x = datum.map(d => d.key);
            this.data[0].y = datum.map(d => d.value);
            Plotly.react(this.plot, this.data, this.layout, this.options)
            
        },
        deep : true
    },
    methods: {
       
    }
}
</script>

<style scoped>


</style>