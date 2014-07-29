function make_stem(){

    //SVG dimensions
    var margin = {top: 20, right: 10, bottom: 20, left: 10};
    var width = 385 - margin.left - margin.right,
    height = 505 - margin.top - margin.bottom;

    //Arc 
    var radius = (width - margin.left - margin.right)/2;
    var arc = d3.svg.arc().innerRadius((radius-55)/2).outerRadius(radius);
    var pie = d3.layout.pie().sort(null);

    //Color scale for binary category: sten vs non-stem
    var color = d3.scale.ordinal().domain([0,1]).range(["teal","magenta"]);

    d3.json("stem.json", function(error,data){
        if(error){ console.log(error);}
        else{
            generate_vis(d3.select("div#stem-left"),data);
            generate_vis(d3.select("div#stem-right"),data);
        }
   } );


    function generate_vis(div_sel,data){

        //Create SVG elements
        var svg = div_sel.append("svg").attr({"width": width, "height": height});

        //Create group
        var arcs = svg.selectAll("g.arc").data(pie( [data.all.all.stem, data.all.all.non_stem] ))
            .enter().append("g")
            .classed("arc",true).
            attr("transform","translate(" + width/2 + "," + height/2 + ")");

        //Draw arc paths
        arcs.append("path").attr("fill", function(d,i) { return color(i);} ).attr("d",arc)
            .each(function(d) { this._current = d; }); // store the initial angles

        //Make labels
        arcs.append("text").attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
            .text(function(d,i){ 
                if(i === 0 ) {return "STEM " + d.value + "%";}
                else{return "Non-STEM " + d.value + "%";}});

        //Create select
        var row = div_sel.append("div").classed("row",true);
        row.append("div").classed("col-md-6",true).classed("gender",true);
        row.append("div").classed("col-md-6",true).classed("race",true);
        div_sel.select("div.gender").append("label").text("Gender");
        div_sel.select("div.race").append("label").text("Race/Ethnicity");

        //Data for binding to selects
        var genders = Object.keys(data);
        var races = Object.keys(data.all);

        var select_gender = div_sel.select("div.gender").append("select").classed("gender",true).classed("form-control",true);
        select_gender.selectAll("option").data(genders).enter().append("option")
            .attr("value", function(d) {return d;}).text( function(d) {return toTitleCase(d.replace(/_/g," "));});

        var select_race = div_sel.select("div.race").append("select").classed("race",true).classed("form-control",true);
        select_race.selectAll("option").data(races).enter().append("option")
            .attr("value", function(d){ return d;}).text(function(d){return toTitleCase(d.replace(/_/g," ")); });
        
        //Listen on selects to transition to new data
        select_gender.on("change", function(){
                //Update data
                var gender = div_sel.select("select.gender").property("value");
                var race = div_sel.select("select.race").property("value");
                var current_vals = [data[gender][race].stem, data[gender][race].non_stem];
                svg.selectAll("g.arc").data(pie(current_vals)); 
                arcs.select("path").transition().duration(750).attrTween("d", arcTween);
                
                //Update labels
                arcs.select("text").transition().duration(750)
                .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
                .text(function(d,i){
                    if(i === 0 ) {return "STEM " + d.value + "%";}
                    else{return "Non-STEM " + d.value + "%";}});
        });

        select_race.on("change", function() {
                //Update race
                var gender = div_sel.select("select.gender").property("value");
                var race = div_sel.select("select.race").property("value");
                var current_vals = [data[gender][race].stem, data[gender][race].non_stem];
                svg.selectAll("g.arc").data(pie(current_vals)); 
                arcs.select("path").transition().duration(750).attrTween("d", arcTween);
                
                //Update labels
                arcs.select("text").transition().duration(750)
                .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
                .text(function(d,i){
                    if(i === 0 ) {return "STEM " + d.value + "%";}
                    else{return "Non-STEM " + d.value + "%";}});
        });

    }

    //Taken from: http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript?lq=1
    function toTitleCase(str)
    {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    //By mbostock
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

}

make_stem();
