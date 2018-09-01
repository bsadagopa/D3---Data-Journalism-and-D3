// create SVG elements
var padding = 50;

// set the dimensions and margins of the graph
var margin = {
        top: 10,
        right: 20,
        bottom: 70,
        left: 50
    },
    chart_width = 850 - margin.right - margin.left,
    chart_height = 600 - margin.top - margin.bottom;

var xAxisLabel_text = ['In Poverty(%)', 'Age(Median)', 'Household Income (Median)'];
var yAxisLabel_text = ['Lacks Healthcare(%)', 'Smokes(%)', 'Obese(%)'];
var xAxis = ['X_Poverty', 'X_Age', 'X_HouseholdIncome'];
var yAxis = ['Y_Healthcare', 'Y_Smokes', 'Y_Obese'];
var x_data_csv_col_names = ['poverty', 'age', 'income'];
var y_data_csv_col_names = ['healthcare', 'smokes', 'obesity'];
//Scales
var x_scale = '';
var y_scale = '';
//begining selections are 
// x = "In Povert(%)"
// y = "Lacks Healthcare (%)"
var xOption = 0;
var yOption = 0;
// tootip variables
var tooltip = '';
var tip = '';

//d3.csv("assets/data/data.csv")
/**
 * d3.csv, Main function to load the data and start processing
 * @param {*} 
 */
d3.csv("assets/data/data.csv")
//d3.csv("assets/data/test_data.csv")
    .then(function (csvdata) {
        // console.log(csvdata);
        csvdata = csvdata.map(function (d) {
            return {
                id: +d.id,
                state: d.state,
                abbr: d.abbr,
                poverty: +d.poverty,
                povertyMoe: +d.povertyMoe,
                age: +d.age,
                ageMoe: +d.ageMoe,
                income: +d.income,
                incomeMoe: +d.incomeMoe,
                healthcare: +d.healthcare,
                healthcareLow: +d.healthcareLow,
                healthcareHigh: +d.healthcareHigh,
                obesity: +d.obesity,
                obesityLow: +d.obesityLow,
                obesityHigh: +d.obesityHigh,
                smokes: +d.smokes,
                smokesLow: +d.smokesLow,
                smokesHigh: +d.smokesHigh
            }
        });
        console.log("Cleaned csvdata:", csvdata);
        generateSVN(csvdata);
    });

/**
 * generateSVL , main login to render the images
 * @param {*} data : The csv file data as list
 */
function generateSVN(data) {
    
    var svg = d3.select('#scatter')
        .append('svg')
        .attr('width', chart_width + 100)
        .attr('height', chart_height + 100);


    //clip paths
    svg.append('clipPath')
        .attr('id', 'plot-area-clip-path')
        .append('rect')
        .attr('x', padding)
        .attr('y', padding)
        .attr('width', chart_width - padding * 2)
        .attr('height', chart_height - padding * 2);

    // Create Axis & labels
    // Create x_axis & x_labels
    //Initial default plot is xOption = -1
    create_x_axis(svg, data, -1);
    create_y_axis(svg, data, -1);

    //Initialize tooltip
    //toolTipMgr(svg);
    // // tooltip
    var tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            // console.log("xOption = ", x_data_csv_col_names[xOption]);
            // console.log("yOption = ", y_data_csv_col_names[yOption]);
            var tooltip_str = function(){
                x_str = "<strong>" + d.state + "</strong><br/><span style='color:red'>" + 
                        x_data_csv_col_names[xOption] + ": ";
                if(xOption == 0){
                    x_str += d[x_data_csv_col_names[xOption]] + "%<br/>";
                }
                else {
                    x_str += d[x_data_csv_col_names[xOption]] + "<br/>";
                }
                y_str = y_data_csv_col_names[yOption] + ": " + d[y_data_csv_col_names[yOption]] + "%</span>";
                return(x_str + y_str);  
            }
            //console.log(tooltip_str);
            return tooltip_str;
        })
        
    svg.call(tooltip);

    // ***************
    // Grouping the circles and labels.
    // To make the labels come inside the scatter plot circles
    //****************
    var scatterPlotCircles = svg.selectAll("g scatter-plot-circles")
        .data(data)
        .enter()
        .append("g")
        .attr('id', 'plot-area')
        .attr('clip-path', 'url(#plot-area-clip-path)')
        .attr('id', 'state-labels');

    //create circles
    scatterPlotCircles
        .append('circle')
        .attr('cx', function (d) {
            //return x_scale_poverty(d.poverty);
            var xscale = create_x_scales(data, 0);
            return xscale(d.poverty);
        })
        .attr('cy', function (d) {
            //return y_scale_healthcare(d.healthcare);
            var yscale = create_y_scales(data, 0);
            return yscale(d.healthcare);
        })
        .attr('r', 10)
        //.attr('fill', '#D1AB0E');
        .attr('fill', 'cyan')
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

    // create Labels
    scatterPlotCircles
        .append('text')
        .attr("dx", function (d) {
            return -5
        })
        .attr("dy", function (d) {
            return 2
        })
        .attr("x", function (d) {
            //return x_scale_poverty(d.poverty);

            var xscale = create_x_scales(data, 0);
            return xscale(d.poverty);
        })
        .attr("y", function (d) {
            //return y_scale_healthcare(d.healthcare);

            var yscale = create_y_scales(data, 0);
            return yscale(d.healthcare);
        })
        .text(function (d) {
            return d.abbr;
        })
        .attr('text-align', 'center')
        .attr("font_family", "sans-serif") // Font type
        .attr("font-size", "8px") // Font size
        .attr("fill", "green") // Font color;
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

    //Animation
    // calling  onclick for new x-y labels
    d3.select('#X_Poverty')
        .on('click', function () {
            xOption = 0;
            console.log('On:#X_Poverty');
            drawOnClickImg(svg, data, xOption, yOption);
        })
    d3.select('#X_Age')
        .on('click', function () {
            xOption = 1;
            console.log('On:#X_Age');
            //redraw circles for age
            drawOnClickImg(svg, data, xOption, yOption);
        })
    // 
    d3.select('#X_HouseholdIncome')
        .on('click', function () {
            xOption = 2;
            console.log('On:#X_HouseholdIncome');
            drawOnClickImg(svg, data, xOption, yOption);
        })
    // Y Label Animation
    d3.select('#Y_Healthcare')
        .on('click', function () {
            yOption = 0;
            console.log('On:#Y_Healthcare');
            drawOnClickImg(svg, data, xOption, yOption);
        })
    d3.select('#Y_Smokes')
        .on('click', function () {
            yOption = 1;
            console.log('On:#Y_Smokes');
            //redraw circles for age
            drawOnClickImg(svg, data, xOption, yOption);
        })
    // 
    d3.select('#Y_Obese')
        .on('click', function () {
            yOption = 2;
            console.log('On:#Y_Obese');
            drawOnClickImg(svg, data, xOption, yOption);
        })    
}

/**
 * drawOnClickImg, main svg rendering function
 * @param {*} svg 
 * @param {*} data 
 * @param {*} xOption 
 * @param {*} yOption 
 */
function drawOnClickImg(svg, data, xOption, yOption) {
    //create circles
    //console.log("INSIDE drawOnClickImg:");
    //scatterPlotCircles
    svg.selectAll('#state-labels').select('circle')
        .data(data)
        .transition()
        .duration(1000)
        .on('start', function () {
            console.log('Transition started.');
            d3.select(this)
                .attr('fill', '#f26d2d');
        })
        .attr('cx', function (d) {
            var xscale = create_x_scales(data, xOption);
            return xscale(d[x_data_csv_col_names[xOption]]);
        })
        .attr('cy', function (d) {
            var yscale = create_y_scales(data, yOption);
            return yscale(d[y_data_csv_col_names[yOption]]);
        })
        .attr('r', 10)
        .transition()
        .attr('fill', 'cyan');
        
    // create Labels
    svg.selectAll('#state-labels').select('text')
        .attr("dx", function (d) {
            return -5
        })
        .attr("dy", function (d) {
            return 2
        })
        .attr("x", function (d) {
            var xscale = create_x_scales(data, xOption);
            return xscale(d[x_data_csv_col_names[xOption]]);
        })
        .attr("y", function (d) {
            //return y_scale_healthcare(d.healthcare);

            var yscale = create_y_scales(data, yOption);
            return yscale(d[y_data_csv_col_names[yOption]]);
        })
        .text(function (d) {
            return d.abbr;
        });


        // .on('end', function () {
        //     console.log('Transition has ENded!');
        //     d3.select(this)
        //         .attr('fill', '#d1ab0e')
        //         .attr('text-align', 'center')
        //         .attr("font_family", "sans-serif") // Font type
        //         .attr("font-size", "8px") // Font size
        //         .attr("fill", "green");
        // });

        svg.select('.x-axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(create_x_scales(data, xOption)));

        svg.select('.y-axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(create_y_scales(data, yOption)));
        
        d3.selectAll('.X_Label')
                    .classed('active', function(d, i){
                        if(i == xOption){
                            console.log("Selected = " + x_data_csv_col_names[xOption]);
                            return true;
                        }
                        else {
                            return false;
                        }
                    })
                    .classed('inactive', function(d, i){
                        if(i == xOption){
                            return false;
                        }
                        else {
                            return true;
                        }
                    });
        d3.selectAll('.Y_Label')
                .classed('active', function(d, i){
                    if(i == yOption){
                        console.log("Selected = " + y_data_csv_col_names[yOption]);
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .classed('inactive', function(d, i){
                    if(i == yOption){
                        return false;
                    }
                    else {
                        return true;
                    }
                });    
}

/**
 * create_x_axis, create and draw the x-axis
 * @param {*} svg 
 * @param {*} data 
 * @param {*} xOption 
 */
function create_x_axis(svg, data, xOption) {
    //console.log("create_x_axis: x_OPTION = " + xOption);
    //xAxisLabel_text = ['In Poverty(%)', 'Age(Median)', 'Household Income (Median)'];
    // Create Scales
    //X Scales
    var x_axis = '';
    if(xOption == -1) { //First run  
        x_axis = d3.axisBottom(create_x_scales(data, 0));
    }
    else {
        x_axis = d3.axisBottom(create_x_scales(data, xOption));
    } 

    svg.append('g')
        .attr('class', 'x-axis')
        .attr(
            'transform',
            'translate(0,' + (chart_height - padding) + ')'
        )
        .call(x_axis);

    // ********* 
    // X Labels for initial run
    // *********
    if (xOption == -1) {
        console.log("=========INITIAL x-label(s) SETUP===========");
        xAxisLabel_text.forEach(function (item, index) {
            svg.append("text")
                .attr('id', xAxis[index])
                .classed('active', function(){
                    if(index == 0){
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .classed('inactive', function(){
                    if(index == 0){
                        return false;
                    }
                    else {
                        return true;
                    }
                })
                .classed('X_Label', true)
                .attr("transform",
                    "translate(" + (chart_width / 2) + " ," +
                    (chart_height + (margin.bottom - (70 - (index * 20)))) + ")")
                .style("text-anchor", "middle")
                .text(xAxisLabel_text[index]);
        });
    } 
}

/**
 * create_y_axis, create and draw the y-axis
 * @param {*} svg 
 * @param {*} data 
 * @param {*} yOption 
 */
function create_y_axis(svg, data, yOption) {
    // console.log("create_y_axis: y_OPTION = " + yOption);
    // Create Scales
    //Y Scales
    var y_axis = '';
    if(yOption == -1) { //First run
        y_axis = d3.axisLeft(create_y_scales(data, 0));
    }
    else {
        y_axis = d3.axisLeft(create_y_scales(data, yOption));
    } 

    svg.append('g')
        .attr('class', 'y-axis')
        .attr(
            'transform',
            //'translate( ' + (50+padding) + ', 0 )'
            'translate( ' + (50 + padding) + ', 0 )'
        )
        .call(y_axis);

    // ********* 
    // Y Labels for initial run
    // *********
    if (yOption == -1) {
        // console.log("=========INITIAL y-label(s) SETUP===========");
        yAxisLabel_text.forEach(function (item, index) {
            svg.append("text")
                .attr('id', yAxis[index])
                .classed('active', function(){
                    if(index == 0){
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .classed('inactive', function(){
                    if(index == 0){
                        return false;
                    }
                    else {
                        return true;
                    }
                })
                .classed('Y_Label', true)
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - (margin.left / 20) + (50 - (index * 20)))
                .attr("x", 0 - (chart_height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                // .style("font-weight", function(){
                //     if(index == 0){
                //         return "bold";
                //     }
                //     else {
                //         "normal";
                //     }
                // })
                .text(yAxisLabel_text[index]);
        });
    } 
}

/**
 * create_x_scales, create the x-axis scales
 * @param {*} data 
 * @param {*} xOption 
 */
function create_x_scales(data, xOption) {

    //console.log("create_X_scales: x_OPTION = " + xOption);
    //xAxisLabel_text = ['In Poverty(%)', 'Age(Median)', 'Household Income (Median)'];
    // Create Scales
    //X Scales
    if(x_scale == '') {
        x_scale = d3.scaleLinear()
                    .domain([d3.min(data, function (d) {
                        return d[x_data_csv_col_names[xOption]];
                    }), d3.max(data, function (d) {
                        return d[x_data_csv_col_names[xOption]];
                    })])
                    .range([padding + 50, chart_width - padding * 3]);
    }
    else {
        x_scale = x_scale
                .domain([d3.min(data, function (d) {
                    return d[x_data_csv_col_names[xOption]];
                }), d3.max(data, function (d) {
                    return d[x_data_csv_col_names[xOption]];
                })]);
    }

    return x_scale;
}

/**
 * create_y_scales, create the x-axis scales
 * @param {*} data 
 * @param {*} yOption 
 */
function create_y_scales(data, yOption) {
    //yAxisLabel_text = ['Lacks Healthcare(%)', 'Smokes(%)', 'Obese(%)'];
    // Y scales
    if(y_scale == '') {
        y_scale = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return d[y_data_csv_col_names[yOption]];
            }), d3.max(data, function (d) {
                return d[y_data_csv_col_names[yOption]];
            })])
            .range([chart_height - padding, padding]);
    }
    else {
        y_scale = y_scale
                .domain([d3.min(data, function (d) {
                    return d[y_data_csv_col_names[yOption]];
                }), d3.max(data, function (d) {
                    return d[y_data_csv_col_names[yOption]];
                })]);
    }

    return y_scale;
}