(function(_c){
        //Define 2PI
        var tau = Math.PI * 2;

        //Pad angle is the space between texts in the arc
        var padAngle = 0.05;
        
        //Define the area of the rect
        var w = 1280;
        var h = 720;
        var w2 = w / 2;
        var h2 = h / 2;
        
        //Defines the circle
        var arc = d3.arc()
            .innerRadius(h2 - 50)
            .outerRadius(h2);

        //Defines the curve used for the lines between nodes
        var curve = d3.line().curve(d3.curveBasis);

        /**
         * Checks if the provided mouse coordinates fall within the radius
         * and position of the provided node. Returns true / false
         * @param {Node} node 
         * @param {Number} mouseX 
         * @param {Number} mouseY 
         * @returns {Boolean}
         */
        var clickedNode = function(node, mouseX, mouseY){
            var dx = mouseX - parseFloat(node.attr('cx'));
            var dy = mouseY - parseFloat(node.attr('cy'));
            var r = parseFloat(node.attr('r'));
            //Square radius, prevents expensive SQRT calculations
            return (r * r > dx * dx + dy * dy);
        }

    
        /**
         * Holds the public methods for the visualization
         */
        _c.vis = {
            /**
             * Defined width and height for future use
             */
            width: w,
            height: h,

            /**
             * Color scheme
             */
            color: d3.scaleOrdinal(d3.schemeCategory10),

            /**
             * Reference to the SVg we will draw on
             */
            svg: undefined,

            /**
             * Initializes the visualization. Called on document read
             */
            init: function(){
                //hide the svg and clear it to be sure
                $('.svg-canvas').hide().html('');
                //save a reference to the svg
                comparativus.vis.svg = d3.select('.svg-canvas');
            },

            /**
             * Returns the angle (Radial) of where the node should be
             * placed on the text with the provided id.
             * @param {Object} node the node object to place
             * @param {String} id the id of the text we're placing it on
             */
            getNodeAngle: function(node, id){
                //Extract the necessary data. Index ratio is [0-1] for place in text
                var indexRatio = node.index / comparativus.text.getByID(id).clean.length;
                //Angles are the starting angle and angle of the arc of the text
                var angles = $('[text-id="' + id + '"]').attr('angle').split("+");
                //return the result
                return (parseFloat(angles[1]) * indexRatio) + parseFloat(angles[0]);
            },

            /**
             * Draws the visualisation
             */
            draw: function(){
                //Get all text ids
                var textIDS = comparativus.text.getAllIDs();

                //Fade in the svg div but clear it first
                $('.svg-canvas').html('').fadeIn(1000);
                
                //First draw the text circle parts
                comparativus.vis.drawTexts(textIDS);
                
                //Then draw the nodes on each text
                comparativus.vis.drawNodes(textIDS);
                
                //Now draw lines between them
                comparativus.vis.drawLines();

                //Add click handler on the canvas itself
                /*
                $('.svg-canvas').unbind('click').click(function(e){
                    var offset = $(this).offset();
                    //Relative to element ,and tranlsated to have 0,0 in the middle
                    var relX = e.pageX - offset.left - w2;
                    var relY = e.pageY - offset.top - h2;
                    $('.node').each(function(node){
                        console.log(clickedNode($(node), relX, relY));
                    });
                });*/
            },
            
            /**
             * Draws the lines between the nodes
             */
            drawLines: function(){
                //Create a holder for the lines
                var lineHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2 + "," + comparativus.vis.height / 2 + ")");
                
                //Now go through all match objects
                comparativus.matches.forEach(function(match){
                    //Create empty array of points;
                    var points = [];

                    //Grab beginngin and end point
                    var startNode = $('circle[comparativusURN="' + match.idA + match.urnA + '"]');
                    var endNode = $('circle[comparativusURN="' + match.idB + match.urnB + '"]');
                    
                    //Push beginning point to pathData
                    points.push([startNode.attr('cx'), startNode.attr('cy')]);
                    //Push middle point to pathData
                    points.push([0, 0]);

                    //Push end point to pathData
                    points.push([endNode.attr('cx'), endNode.attr('cy')]);

                    //Then draw a ling with the generated pathData
                    lineHolder.append("path")
                            .attr('d', curve(points))
                            .attr('comparativusURN', match.idA + match.urnA + "=" + match.idB + match.urnB)
                            .attr('class', 'matchLine');

                });
            },

            /**
             * Draws the nodes for each of the provided texts
             */
            drawNodes: function(textIDS){
                //Create a holder for the nodes
                var nodeHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2  + "," + comparativus.vis.height / 2 + ")");
                
                //For each text add all the nodes
                textIDS.forEach(function(id, index){
                    //All nodes for this text
                    var nodes = comparativus.nodes[id];
                    //Node color
                    var nColor = comparativus.vis.color(index);
                    
                    //Now draw each node onto the circle
                    nodes.forEach(function(node){
                        var angle = comparativus.vis.getNodeAngle(node, id);
                        nodeHolder.append("circle")
                            .style("stroke", "black")
                            .style("fill", nColor)
                            .attr("stroke-width", 1)
                            .attr("fill-opacity", 1)
                            .attr("class", "node")
                            .attr("cx", (Math.sin(angle) * (h2 - 50)))
                            .attr("cy", - (Math.cos(angle) * (h2 - 50)))
                            .attr("r", 6)
                            .attr("comparativusURN", id + node.urn);
                        
                    });
                });            
            },

            /**
             * Draws the texts and their info onto the screen
             */
            drawTexts: function(textIDS){
                //Create a holder for the texts
                var textHolder = comparativus.vis.svg.append("g")
                    .attr("transform", "translate(" + comparativus.vis.width / 2  + "," + comparativus.vis.height / 2 + ")");
            
                //Get all text objects
                var text, sAngle = 0, tAngle, legendY = 0;
                textIDS.forEach(function(id, index){
                    text = comparativus.text.getByID(id);
                    //Get the angle for this text in the circle
                    tAngle = (tau - (padAngle * comparativus.text.amt())) * comparativus.text.getPercentLength(id);
                    //Now add an arc to the text holder
                    var tColor = comparativus.text.getVisColor(id);
                    textHolder.append("path")
                        .datum({startAngle: sAngle, endAngle: sAngle + tAngle})
                        .style("fill", tColor)
                        .style("stroke", d3.rgb(tColor).darker())
                        .attr("d", arc)
                        .attr('text-id', id)
                        .attr('angle', sAngle + "+" + tAngle)
                        .attr("class", "textArc");
                    sAngle += tAngle + padAngle;

                    //Also draw a rect in the legend
                    textHolder.append("rect")
                        .style("fill", tColor)
                        .style("stroke", d3.rgb(tColor).darker())
                        .attr("x", -w2 + 10)
                        .attr("y", -h2 + legendY + 20)
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr('text-id', id)
                        .attr("class", "textLegend");

                    //Add the highlight action when they're hover over legend or arc
                    $('.textLegend, .textArc').mouseenter(function(){
                        $('[text-id="' + $(this).attr('text-id') + '"]').addClass('active');
                    }).mouseleave(function(){
                        $('[text-id="' + $(this).attr('text-id') + '"]').removeClass('active');
                    });
                    
                    //Now draw the name with the legend rect
                    textHolder.append("text")
                        .attr("x", -w2 + 40)
                        .attr("y", -h2 + legendY + 36)
                        .text(text.name);

                    //Now draw the character length with the name
                    textHolder.append("text")
                        .attr("x", -w2 + 40)
                        .attr("y", -h2 + legendY + 48)
                        .attr("class", "small")
                        .text(text.clean.length + " characters");

                    legendY += 50;
                });
            }
    
        
        };
    })(comparativus);