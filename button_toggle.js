
d3.select("a#ed-attainment-link").on("click", function() {
    d3.select("div#stem").classed("hidden",true);
    d3.select("div#ed-attainment").classed("hidden",false);
    d3.select("a#ed-attainment-link").classed("disabled",true);
    d3.select("a#stem-link").classed("disabled",false);
} );


d3.select("a#stem-link").on("click", function() {
    d3.select("div#ed-attainment").classed("hidden",true);
    d3.select("div#stem").classed("hidden",false);
    d3.select("a#stem-link").classed("disabled",true);
    d3.select("a#ed-attainment-link").classed("disabled",false);
} );
