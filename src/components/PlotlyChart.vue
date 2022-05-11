<template>
    <div id="plot" :data="popsAggr" :layout="layout" :options="options"/>
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-basic");

export default {
    name: "PlotlyChart",
    props: {
        popsAggr: Array,
    },
    data() {
        return {
            data : [{
                type: "bar",
                orientation: 'h'
            }],
            layout: {
                height: 650,
                width:500,
                margin: {
                    t:0,
                    b:20,
                    r:20,
                    l:170
                },
                font: {
                    family: "Trebuchet MS, sans-serif"
                },
                xaxis: {
                    zeroline: false
                }
            },
            options: {
                displayModeBar: false,
            }
        }
    },
    mounted() {
        Plotly.newPlot("plot", this.data, this.layout)
    },
    watch: {
        popsAggr(datum) {
            this.data[0].y = datum.map(d => d.key);
            this.data[0].x = datum.map(d => d.value);
            console.log(this.data)
            Plotly.newPlot("plot", this.data, this.layout)
        },
        deep : true
    }
}
</script>

<style>

</style>