//ajax call for all faculty just for test
(function($){
	var sys = arbor.ParticleSystem(); //create system with params
	sys.parameters({stiffness:300, repulsion:7000, gravity:true})//use center of gravity to make graph settle nicely
	
	Renderer = function(canvas) {
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
				canvas.height = $(window).height() - 76;
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
					ctx.fillStyle = node.data.alone;
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
				var last = null;
				
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
						
						
						if (dragged.node.data.alone == "darkblue" || dragged.node.data.alone == "orange") {
							var request = $.ajax({
								type: "POST",
								url: "faculty.php",
								data: {
									displayFaculty: dragged.node.name,
									sourceName: dragged.node.data.name,
									sourceAlone: dragged.node.data.alone
								},
								dataType: 'json',
								async: false,
								success: function(result){
									console.log(result);
									sys.merge(result);
									$("#back").show();
								},
								error: function(result) {
									console.log("error");
								}
							});
						}

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
		sys.renderer = Renderer("#viewport"); //our newly created renderer will have its .init() method called shortly by sys..
		var i = 0;
		$("#back").hide();
		
		sys.addNode('Ithaca College', {alone:"orange", name:"Ithaca College"});

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

		var theUI = { 
			nodes: {
				"arbor.js": {
					name:"ARBOR", alone:"orange"
				}
			},
			edges:{
				"arbor.js":{
					"Ithaca College" : {}
				}
			}
		}

		//sys.graft(theUI);

		$("#addNode").click(function(){
			sys.addNode(i, {name: i});
			if (i > 0) {
				sys.addEdge(i, i-1);
				sys.addEdge(i, 1);
			}
			i++;
		});

		$("#deleteNode").click(function(){
			if(i > 0) {
				i--;
				sys.pruneNode(i)
			}
		});



		$('#feedback').bind('fade-cycle', function() {
			$(this).fadeOut(1000, function() {
				$(this).fadeIn(1000, function() {
					$(this).trigger('fade-cycle');
				});
			});
		});

		$('#feedback').each(function(index, elem) {
			setTimeout(function() {
				$(elem).trigger('fade-cycle');
			}, index * 500);
		});

		$("#feedback").click(function() {
			window.location="https://docs.google.com/forms/d/1J0jU2ZHPln4_5Z1BLpU2FbliFGLvoxThfm9S2pn5cQk/viewform?usp=send_form";
		});


		$("#back").click(function() {
			var request = $.ajax({
				type: "POST",
				url: "faculty.php",
				data: { displayConnections: true},
				dataType: 'json',
				async: false,
				success: function(result){
					sys.merge(result);
					sys.addNode('Ithaca College', {alone:"orange", name:"Ithaca College"});
					$("#back").hide();
				}
			});
		});

    	
	});
	
})(this.jQuery)
