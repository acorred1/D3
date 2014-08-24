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

            //Add source and descriptions of variables text  
            create_stem_fineprint(d3.select("div#stem"));
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

    //Add source and descriptions of variables text  
    function create_stem_fineprint(main_div) {
        fineprt = main_div.append("div").classed("fineprint",true);
        fineprt.append("h5").text("Source");
        /*jshint multistr: true */
        fineprt.append("p").text("U.S. Department of Commerce, Census Bureau, American Community Survey (ACS), 2011. Available at: ")
                .append("a").attr("href","http://nces.ed.gov/programs/digest/d13/tables/dt13_505.30.asp")
                .attr("target","_blank")
                .text("National Center for Education Statistics.");
        fineprt.append("h5").text("Description of Variables");
        fineprt.append("h6").text("All genders/All races");
        fineprt.append("p").text("Total includes other racial/ethnic groups not shown separately.");
        fineprt.append("h6").text("American Indian/Alaska Native");
        fineprt.append("p").text("Includes persons reporting American Indian alone, persons reporting Alaska Native alone, \
                and persons from American Indian and/or Alaska Native tribes specified or not specified.");
        fineprt.append("h6").text("Note");
        fineprt.append("p").text("Estimates include persons in the indicated age range who live in households as well as those \
                who live in group quarters (such as college residence halls, residential treatment centers, military barracks, and\
                correctional facilities). Only employed persons who have a bachelor’s degree in a STEM field of study are included.\
                The first bachelor’s degree major reported by respondents was used to classify their field of study, even though\
                they were able to report a second bachelor’s degree major and may possess advanced degrees in other fields. \
                Aggregated occupation classifications were used to assemble the data, except that managers of STEM activities\
                were counted as practitioners of STEM occupations instead of 'Business workers/managers.' Detail may not sum \
                to totals because of rounding. Race categories exclude persons of Hispanic ethnicity");
    }


}

make_stem();
