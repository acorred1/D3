function make_ed_attainment(){
    var margin = {top: 20, right: 10, bottom: 20, left: 10};
    var width = 850 - margin.left - margin.right,
    height = 505 - margin.top - margin.bottom;

    //Define map projection
    var projection = d3.geo.albersUsa().translate([width/2,height/2]).scale([1000]);
    //Define path generator
    var path = d3.geo.path().projection(projection);
    //Define color scale on percents
    var color = d3.scale.linear().range(["white","blue"]);
    //Creat svg element
    var svg = d3.select("div#ed-attainment").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Load education data
    d3.csv("Education.csv", function(error,edu_data) {
            //Where to start the visualization
            var level = "less_hs_";
            var year = "1970";

            if(error){ console.log(error);}
            else{
                //Load GeoJSON data
                d3.json("us-states.json", function(error,json) {
                    if(error) {console.log(error);}
                    else{
                        //Merge education data to geojason data
                        merge_data(json,edu_data);

                        //Adjust domain in color scale to min/max of values
                        var edu_min = d3.min( json.features.map( function(curr){ return d3.min( object_values(curr.properties).slice(1) );} ) );
                        var edu_max = d3.max( json.features.map( function(curr){ return d3.max( object_values(curr.properties).slice(1)  );} ) );
                        color.domain([edu_min,edu_max]);

                        //Create path elements
                        svg.selectAll("path").data(json.features).enter().append("path")
                        .attr("d",path).attr("stroke","white").attr("fill", function(d) { 
                                var val = d.properties[level + year];
                                if(val){ return color(val); }
                                else{ return "#ccc";}
                                })
                        .on("mouseover", function(d) {

                                //Get position of mouse
                                var coord = [0,0];
                                coord = d3.mouse(this);

                                //Update tooltip
                                var tip = d3.select("#ed-tooltip").style("left", coord[0] + "px").style("top", coord[1] + "px");
                                tip.select(".value").text( function() { 
                                    var val = d.properties[level + year]; 
                                    if(val){return val;}
                                    else{ return "Unavailable";}
                                    });
                                tip.select("#level").text( function() {
                                    if(level == 'less_hs_'){ return "less than a High School diploma";}
                                    else if(level == 'hs_'){ return "a High School Diploma only";}
                                    else if(level == 'some_college_'){ return "some college or Associate's degree";}
                                    else{ return "a Bachelor's degree or higher";}
                                    });
                                tip.select("#state").text(function(){ return d.properties.name;});
                                tip.select("#year").text( function() { 
                                    return year.replace("_","-");
                                    });

                                //Make tooltip visible
                                tip.classed("hidden",false);
                                
                                } )
                        .on("mouseout", function() {
                                //Hide the tooltip
                                d3.select("#ed-tooltip").classed("hidden",true);
                                });


                        //Create color bar for reference
                        var bars_width = 690, bar_height = 15, bars_padding = 30, text_offset = 20;
                        //Dummy dataset where each bar will be a fraction of percent in the range of edu_min to edu_max
                        var bars = d3.range(Math.floor(edu_min),Math.floor(edu_max)+1,0.25); 
                        //Scale for the x coordinate of the rects making the color bar
                        var xScale = d3.scale.ordinal().domain(d3.range(bars.length)).rangeRoundBands([0,bars_width]);

                        d3.select("div#ed-attainment").append("div").attr("id","colorbar");
                        var color_svg = d3.select("div#colorbar").append("svg").attr("width",width).attr("height",bar_height+3*bars_padding);
                        var g_colorbar = color_svg.append("g").attr("transform","translate(" + (width - bars_width)/2 + "," + bars_padding +")");

                        g_colorbar.selectAll("rect").data(bars).enter().append("rect").attr("height",bar_height).attr("width",xScale.rangeBand())
                            .attr("x", function(d,i) { return xScale(i); }).attr("fill", function(d){ return color(d);});
                        //Labels at extremes of bar showing endpoints of range 
                        g_colorbar.selectAll("text").data(color.domain()).enter().append("text").text( function(d){return d + "%";} )
                            .attr("x", function(d,i){ if(i === 0){ return xScale(i);} else{ return xScale(bars.length-i); } })
                            .attr("y",bar_height + text_offset ).attr("text-anchor","middle").classed("colorbar-text",true);

                        //Create selectors for year and educational level
                        d3.select("div#ed-attainment").append("div").classed("row",true).attr("id","selects");
                        d3.select("div#selects").append("div").classed("col-md-6",true).attr("id","outer_year");
                        d3.select("div#selects").append("div").classed("col-md-6",true).attr("id","select_level");
                        d3.select("div#outer_year").append("label").text("Year");
                        d3.select("div#outer_year").append("div").classed("row",true).attr("id","inner_year");
                        d3.select("div#inner_year").append("div").classed("col-md-9",true).attr("id","select_year");
                        d3.select("div#inner_year").append("div").classed("col-md-3",true).attr("id","play_year");
                        
                        //Data for binding to selects
                        var all_years = ["1970","1980","1990","2000","2006_2010","2007_2011","2008_2012"];
                        var all_levels = ["less_hs_","hs_","some_college_","college_higher_"];

                        var select_year = d3.select("div#select_year").append("select").attr("id","year").classed("form-control",true);
                        select_year.selectAll("option").data(all_years).enter().append("option")
                            .attr("value", function(d) {return d;}).text( function(d) {return d.replace("_","-");});

                        d3.select("div#select_level").append("label").text("Educational Level");
                        var select_level = d3.select("div#select_level").append("select").attr("id","level").classed("form-control",true);
                        select_level.selectAll("option").data(all_levels).enter().append("option")
                            .attr("value", function(d){ return d;}).text(function(d){
                                    if(d == 'less_hs_'){ return "Less than a High School diploma";} 
                                    else if(d == 'hs_'){ return "A High School diploma only";} 
                                    else if(d == 'some_college_'){ return "Some College or an Associate's degree";} 
                                    else {return "A Bachelor's degree or higher";}
                                    });
                        
                        //Listen on selects to transition to new data
                        var transition_duration = 1200;
                        select_year.on("change", function(){
                                year = d3.select("select#year").property("value");
                                svg.selectAll("path").transition().duration(transition_duration).attr("fill", function(d) {
                                        var val = d.properties[level + year];
                                        if(val){ return color(val); }
                                        else{ return "#ccc";}
                                    } );
                                });

                        select_level.on("change", function() {
                                level = d3.select("select#level").property("value");
                                svg.selectAll("path").transition().duration(transition_duration).attr("fill", function(d) {
                                        var val = d.properties[level + year];
                                        if(val){ return color(val); }
                                        else{ return "#ccc";}
                                        });
                                });


                        //Create play button
                        var play = d3.select("div#play_year").append("button").classed("btn",true).classed("btn-primary",true).attr("id","play_year");
                        play.append("span").classed("glyphicon",true).classed("glyphicon-play",true).text(" Play");

                        //Listen to play button
                        var interval;
                        play.on("click", function(){
                        //Change select year options at transtition duration long intervals
                                //Stop any previous plays
                                clearInterval(interval);

                                var current = 0; //Always start at earliest year 
                                var select = $("select#year")[0];
                                var n = select.length; 
                                //Do the first iteration so can start right away 
                                //and not with a delay
                                select.selectedIndex = current;
                                select.dispatchEvent(new MouseEvent('change'));
                                current++;
                                
                                //Continue with remaining options
                                interval = setInterval( play_years , transition_duration);

                                function play_years(){
                                    if(current >= n){
                                    //Done playing
                                    clearInterval(interval);
                                    return;
                                    }
                                    else{
                                        //Change selected year option
                                        select.selectedIndex = current; 
                                        //Trigger change. B/c jQuery events don't trigger d3 listeners
                                        select.dispatchEvent(new MouseEvent('change'));
                                        current++;
                                    }
                                }
                                

                                });


                        //Add source and descriptions of variables text  
                        fineprt = d3.select("div#ed-attainment").append("div").classed("fineprint",true);
                        fineprt.append("h5").text("Sources");
                        /*jshint multistr: true */
                        fineprt.append("p").text("Census Bureau, 1970, 1980, 1990, 2000 Censuses of Population, and the 2006-2010, 2007-2011, 2008-2012  \
                                American Community Surveys. Available at: ")
                                .append("a").attr("href","http://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx#.U9gYxY1dVy9")
                                .attr("target","_blank")
                                .text("USDA Economic Research Center.");
                        fineprt.append("h5").text("Description of Variables");
                        fineprt.append("h6").text("Less than High School");
                        fineprt.append("p").text("For 1970 and 1980, the share of adults (age 25 and older) with less than high school includes those who \
                                had not completed the 12th grade.  From 1990 onward, the share includes those who did not receive a high school diploma or \
                                its equivalent (such as a GED), but did not report college experience.");
                        fineprt.append("h6").text("High School only");
                        fineprt.append("p").text("For 1970 and 1980, the share of adults (age 25 and older) with high school only includes those who completed \
                                12th grade only.  From 1990 onward, the share includes those who completed 12th grade and received a high school diploma or its \
                                equivalent (such as a GED), but did not report college experience.");
                        fineprt.append("h6").text("Some College");
                        fineprt.append("p").text("For 1970 and 1980, the share of adults (age 25 and older) with some college includes those who completed from \
                                one to three years of college.  From 1990 onward, the share includes those who reported completing at least one year of college \
                                but did not receive a bachelor's degree.");
                        fineprt.append("h6").text("College graduate ");
                        fineprt.append("p").text("For 1970 and 1980, the share of adults (age 25 and older) who are college graduates includes those who completed \
                                at four or more years of college regardless of degree earned. From 1990 onward, the share includes those who received a bachelor's \
                                or higher degree");


                    }
                    } );

            }           
    }); 

    //Function to get a list of the values held by an object
    function object_values(obj){
        var arr = [];
        for(var key in obj){
            if(obj.hasOwnProperty(key)){arr.push(obj[key]);}
        }
        return arr;
    }

    function merge_data(json,edu_data) {
    //Merge json data to education data
    //Capitalize on fact that both files have the same order
        for(var i = 0; i < json.features.length; i++){
            if( json.features[i].properties.name == edu_data[i].area_name ){
                //1970
                json.features[i].properties.less_hs_1970 = parseFloat(edu_data[i].less_hs_1970);
                json.features[i].properties.hs_1970 = parseFloat(edu_data[i].hs_1970);
                json.features[i].properties.some_college_1970 = parseFloat(edu_data[i].some_college_1970);
                json.features[i].properties.college_higher_1970 = parseFloat(edu_data[i].college_higher_1970);
                //1980
                json.features[i].properties.less_hs_1980 = parseFloat(edu_data[i].less_hs_1980);
                json.features[i].properties.hs_1980 = parseFloat(edu_data[i].hs_1980);
                json.features[i].properties.some_college_1980 = parseFloat(edu_data[i].some_college_1980);
                json.features[i].properties.college_higher_1980 = parseFloat(edu_data[i].college_higher_1980);
                //1990
                json.features[i].properties.less_hs_1990 = parseFloat(edu_data[i].less_hs_1990);
                json.features[i].properties.hs_1990 = parseFloat(edu_data[i].hs_1990);
                json.features[i].properties.some_college_1990 = parseFloat(edu_data[i].some_college_1990);
                json.features[i].properties.college_higher_1990 = parseFloat(edu_data[i].college_higher_1990);
                //2000
                json.features[i].properties.less_hs_2000 = parseFloat(edu_data[i].less_hs_2000);
                json.features[i].properties.hs_2000 = parseFloat(edu_data[i].hs_2000);
                json.features[i].properties.some_college_2000 = parseFloat(edu_data[i].some_college_2000);
                json.features[i].properties.college_higher_2000 = parseFloat(edu_data[i].college_higher_2000);
                //2006-2010
                json.features[i].properties.less_hs_2006_2010 = parseFloat(edu_data[i].less_hs_2006_2010);
                json.features[i].properties.hs_2006_2010 = parseFloat(edu_data[i].hs_2006_2010);
                json.features[i].properties.some_college_2006_2010 = parseFloat(edu_data[i].some_college_2006_2010);
                json.features[i].properties.college_higher_2006_2010 = parseFloat(edu_data[i].college_higher_2006_2010);
                //2007-2011
                json.features[i].properties.less_hs_2007_2011 = parseFloat(edu_data[i].less_hs_2007_2011);
                json.features[i].properties.hs_2007_2011 = parseFloat(edu_data[i].hs_2007_2011);
                json.features[i].properties.some_college_2007_2011 = parseFloat(edu_data[i].some_college_2007_2011);
                json.features[i].properties.college_higher_2007_2011 = parseFloat(edu_data[i].college_higher_2007_2011);
                //2008-2012
                json.features[i].properties.less_hs_2008_2012 = parseFloat(edu_data[i].less_hs_2008_2012);
                json.features[i].properties.hs_2008_2012 = parseFloat(edu_data[i].hs_2008_2012);
                json.features[i].properties.some_college_2008_2012 = parseFloat(edu_data[i].some_college_2008_2012);
                json.features[i].properties.college_higher_2008_2012 = parseFloat(edu_data[i].college_higher_2008_2012);
                }
        }
    }
}

make_ed_attainment();
