<template>
    <h6>{{title}}</h6>
    <div :id="id" :data="popsAggr" :layout="layout" :options="options" :xaxis="xaxis" :title="title"/>
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-cartesian");
const d3 = require("d3");

export default {
    name: "InfoChart",
    props: {
        id: String,
        popsAggr: Array,
        xaxis: Object,
        title: String,
    },
    data() {
        return {
            data : {
                type: this.id == "plot-2" ? "line" : "histogram",
                histfunc:"sum",
                xbins: {
                    start: 2.10,
                    size: 1.0,
                },
                line: {
                    color: 'rgb(200,50,100)'
                },
                marker: {
                    color: 'rgb(200,50,100)'
                }
            },
            layout: {
                height: 300,
                width:450,
                margin: {
                    t:10,
                    b:35,
                    r:10,
                    l:30
                },
                font: {
                    family: "Trebuchet MS, sans-serif"
                },
                xaxis: this.xaxis,
                bargap: 0.04, 
                
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
            this.data.x = datum.map(d => d.key);
            this.data.y = datum.map(d => d.value);
            Plotly.react(this.plot, [this.data], this.layout, this.options)
            
        },
        deep : true
    },
    methods: {
       
    }
}
</script>

<style scoped>
* {
    margin: 0;
}

</style>