<template>

    <div id="mc2-container">
        <h1>Mini Challenge 2</h1>
        <GeoMap/>
    </div>
    
</template>

<script>
import GeoMap from "./GeoMap.vue"


export default {
    name : "MC2Gastech",
    components: {
        GeoMap
        },

}

</script>

<style>

#mc2-container {
    display: inherit;
    flex-direction: inherit;
    flex-grow: 1;
    justify-content: space-between;
    gap: 30px;
    height: 1000px;
}

h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10%;
    padding: 10px;
}



</style>