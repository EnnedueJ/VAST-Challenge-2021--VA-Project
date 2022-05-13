<template>
    <div id="plot" :data="popsAggr" :layout="layout" :options="options"/>
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-basic");

export default {
    name: "LocationsChart",
    props: {
        popsAggr: Array,
    },
    data() {
        return {
            data : [{
                type: "bar",
                orientation: 'h',
                marker: {
                    color: 'rgb(158,202,225)',
                    opacity: 0.6,
                    line: {
                        color: 'rgb(8,48,107)',
                        width: 1.5
                    }
                },
            }],
            layout: {
                height: 650,
                width:500,
                margin: {
                    t:0,
                    b:20,
                    r:0,
                    l:170
                },
                font: {
                    family: "Trebuchet MS, sans-serif"
                },
                xaxis: {
                    zeroline: false
                },
                
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
            Plotly.newPlot("plot", this.data, this.layout)
        },
        deep : true
    }
}
</script>

<style scoped>

#plot {
    display: flex;
    justify-content: right;
}

</style>