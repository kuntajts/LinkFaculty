//ajax call for all faculty just for test
(function($){
	Renderer = function(canvas){
		var dom = $(canvas);
		var canvas = dom.get(0);
		var ctx = canvas.getContext("2d");
		var particleSystem = null;
		
		var that = {
			init:function(system){
				particleSystem = system;
				
				//give the system the screen dimensions so it can map coords
				//a canvas resize will automatically get new dimentions
				particleSystem.screen({size:{width:dom.width(), height:dom.height()}, padding:[80,80,80,80]});
				$(window).resize(that.resize);
				that.resize();
				
				
				//handler for node-dragging
				that.initMouseHandling();
			},

			resize:function() {
				canvas.width = $(window).width();
				canvas.height = $(window).height();
				particleSystem.screen({size:{width:canvas.width, height:canvas.height}});
				that.redraw();
			},
			
			redraw:function(){
			
				//redraw is called repeatedly when the position of a node changes
				
				//canvas attributes for drawing the canvas
				//create a filled rectangle filled with the color white
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				
				particleSystem.eachEdge(function(edge,pt1,pt2) {
					// edge: {source:Node, target:Node, length:#, data:{}}
					// pt1:  {x:#, y:#}  source position in screen coords
					// pt2:  {x:#, y:#}  target position in screen coords
				

					//line from pt1 to pt2
					ctx.strokeStyle = (edge.data.bold) ?  "rgba(0,0,0, .666)" : "rgba(0,0,0, .333)";
					ctx.lineWidth = (edge.data.bold) ? 3 : 1;
					ctx.beginPath();
					ctx.moveTo(pt1.x, pt1.y);
					ctx.lineTo(pt2.x, pt2.y);
					ctx.stroke();
				});
				
				particleSystem.eachNode(function(node, pt) {
					var newname = node.data.name;
					//draw rectangle at pt
					var w = 10;
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, w, 0, 2 * Math.PI, false);
					ctx.fillStyle = (node.data.alone) ? "orange" : "darkblue";
					ctx.fill();

					ctx.font = "12px Helvetica";
					ctx.textAlign = "center";
            		ctx.fillStyle = "black";
            		

            		ctx.fillText(newname, pt.x, pt.y-12);
				});
				
			},
			
			initMouseHandling:function() {
				// no-nonsense drag and drop
				var dragged = null;
				
				// set up a handler object that will initially listen for mousedowns then
				// for moves and mouseups while dragging
				var handler = {
					clicked:function(e) {
						var pos = $(canvas).offset();
						_mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
						dragged = particleSystem.nearest(_mouseP);
						
						if (dragged && dragged.node !== null) {
							// while we're dragging, don't let physics move the node
							dragged.node.fixed = true;
						}
						
						$(canvas).bind('mousemove', handler.dragged);
						$(window).bind('mouseup', handler.dropped);
						
						return false;
					},
					
					dragged:function(e){
						var pos = $(canvas).offset();
						var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
						
						if (dragged && dragged.node !== null) {
						
							var p = particleSystem.fromScreen(s);
							dragged.node.p = p;
							
						}
						
						return false;
						
					},
					
					dropped:function(e){
						if (dragged === null || dragged.node === undefined) return;
						if (dragged.node !== null) dragged.node.fixed = false;
						
						dragged.node.tempMass = 1000;
						dragged = null;
						
						$(canvas).unbind('mousemove' , handler.dragged);
						$(window).unbind('mouseup' , handler.dropped);
						
						_mouseP = null;
						return false;
					}
				}
				
				//start listening
				$(canvas).mousedown(handler.clicked);
				
			},
		};
		
		return that;
	};



	$(document).ready(function() {

		var sys = arbor.ParticleSystem(); //create system with params
		sys.parameters({stiffness:300, friction:.5, repulsion:7000, gravity:true})//use center of gravity to make graph settle nicely
		sys.renderer = Renderer("#viewport"); //our newly created renderer will have its .init() method called shortly by sys..
		
		sys.addNode('Ithaca College', {alone:true, name:"Ithaca College"});

	   	var request = $.ajax({
			type: "POST",
			url: "faculty.php",
			data: { displayConnections: true},
			dataType: 'json',
			async: false,
			success: function(result){
				sys.graft(result);
			}
		});

    	
	});
	
})(this.jQuery)
