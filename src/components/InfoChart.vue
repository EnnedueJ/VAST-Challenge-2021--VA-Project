<template>
    <div>
        <!--<h6>{{title}}</h6>-->
        <div :id="id" :data="popsAggr" :layout="layout" :options="options" :xaxis="xaxis" :title="title"/>
    </div>
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
                histfunc: "sum",
                xbins: {
                    start: 2.,
                    size: 1.1,
                    end: 23.
                },
                line: {
                    color: 'rgb(200,50,100)'
                },
                marker: {
                    color: 'rgb(200,50,100)'
                },
                fill: 'tonexty',
            },
            layout: {
                height: 250,
                width:400,
                margin: {
                    t:10,
                    b:35,
                    r:10,
                    l:40
                },
                font: {
                    family: "Trebuchet MS, sans-serif"
                },
                xaxis: this.xaxis,
                yaxis: {
                    title: "Visits"
                },
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
    },
    methods: {
       
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
</style>