<template>
    <div :id="id" :data="popsAggr" :layout="layout" :options="options" :ref="clickTarget"></div>
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
            data : {
                type: "bar",
                orientation: 'h',
                marker: {
                    color: 'rgb(158,202,225)',
                },
            },
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
            },
            tarPoint: String,
        }
    },
    mounted() {
        this.plot = d3.select("#"+this.id).node()
        Plotly.newPlot(this.plot, [this.data], this.layout, this.options)

        this.plot.on("plotly_click",(d) => {
                    this.getPlotClick(d)
                })

    },
    watch: {
        popsAggr(datum) {
            this.data.y = datum.map(d => d.key);
            this.data.x = datum.map(d => d.value);
            this.changeColor(this.tarPoint, this.data.y)
            Plotly.react(this.plot, [this.data], this.layout, this.options)
            
        },
    },
    methods: {
        getPlotClick(d) {
            this.tarPoint = d.points[0].y
            this.$emit('targetChange', this.tarPoint)
            
            const fullData = d.points[0].data.y
            this.changeColor(this.tarPoint, fullData)

            Plotly.react(this.plot, [this.data], this.layout, this.options);
            
        },

        changeColor(tar, data) {
            const pn = data.indexOf(tar)
            let colors = Array(data.length).fill('rgb(158,202,225)');
            
            colors[pn] = 'rgb(200,50,100)'
            this.data.marker.color = colors
        },

        clickTarget() {}
    }
}
</script>

<style scoped>

* {
    display: flex;
    justify-content: right;
}

</style>