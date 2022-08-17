# Visual Analytics Project 
## VAST_challenge_2021

The Visual Analytics project aims at solving the Mini Challenge 2 of the VAST Challenge 2021, 
a Visual Analytics competition designed to help
researchers develop software for a variety of analytics tasks. The objective of this challenge is to identify the
identities and behaviours of the employees of the GAStech International, a Kronos-based company
settled in the fictional city of Abila. Through the Interactive Dashboard It is possible to recognize the most frequent
locations visited by the employees, as well as typical patterns and issues of concern, analysing their
transactions and car movements on Abila’s territory during a two-week period in January 2014.

### Tools

The visualization project has been carried out exploiting Vue, a component-based framework for
building user interfaces built on top of HTML, CSS and Javascript, in its 3.2 version. For this reason,
it was also used Bootstrap Vue 3, a Vue integrated version of the front-end toolkit which utilizes
prebuilt components to help building the web page structure. The additional libraries employed
are:
- Topojson, an extension of GeoJSON that encodes topology, that was needed to read the
map’s json and for the representation of all the geographical data at disposal, like streets or
employee’s coordinates in space;
- D3, a javascript library designed for an efficient manipulation of the DOM, as it allows to
apply data-driven transformations to the document with flexibility;
- Crossfilter, a library for exploring multivariate and high dimensional datasets and
performing data filtering or grouping;
- Plotly.js, an open source graphing library with a detailes API reference which offers the
possibility to create charts of all kinds.
