<template>
    <div :id="id" :data="popsAggr" :layout="layout" :options="options" :ref="clickTarget"/>
</template>

<script>
const Plotly = require("plotly.js/dist/plotly-basic");
const d3 = require("d3");

export default {
    name: "LocationsChart",
    props: {
        id: String,
        popsAggr: Array,
    },
    data() {
        return {
            
            data : [{
                type: "bar",
                orientation: 'h',
                marker: {
                    color: 'rgb(158,202,225)',
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
        this.plot = d3.select("#"+this.id).node()
        Plotly.newPlot(this.plot, this.data, this.layout, this.options)

        this.plot.on("plotly_click",(d) => {
                    this.getPlotClick(d)
                })

    },
    watch: {
        popsAggr(datum) {
            this.data[0].y = datum.map(d => d.key);
            this.data[0].x = datum.map(d => d.value);
            Plotly.react(this.plot, this.data, this.layout, this.options)
            
        },
        deep : true
    },
    methods: {
        getPlotClick(d) {
            this.$emit('targetChange', d.points[0].y)
            /*
            const target = d.points[0].y
            const fullData = d.points[0].data.y
            const pn = fullData.indexOf(target)
            let colors = Array(fullData.length).fill('rgb(158,202,225)');
            
            colors[pn] = 'rgb(200,50,100)'
            const update = {'marker':{
                color: colors,
                }};

            Plotly.restyle(this.plot, update);
            */
        }
    }
}
</script>

<style scoped>

* {
    display: flex;
    justify-content: right;
}

</style>