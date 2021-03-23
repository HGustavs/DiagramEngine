var service =[];
var auto_update=null;
var uidArr=[];

//------------------------------------=======############==========----------------------------------------
//                           Defaults, mouse variables and zoom variables
//------------------------------------=======############==========----------------------------------------

var mb,startX,startY;
var startTop,startLeft;
var sscrollx,sscrolly;
var cwidth,cheight;
var colors = ["white","Gold","pink","yellow","CornflowerBlue"];
var hasRecursion=false;

// Zoom variables
var zoomfact=1.0;
var scrollx=100;
var scrolly=100;

// Constants
var elementwidth=200;
var elementheight=50;
var textheight=16;
var strokewidth=3;

// Arrow drawing stuff - diagram elements and diagram lines
var lines=[];
var elements=[];

// Example entities and attributes
var data=[
	{name:"Person",x:100,y:100,width:200,height:50,kind:"Entity"},
	{name:"Car",x:500,y:140,width:200,height:50,kind:"Entity"},	
	{name:"Has",x:400,y:100,width:50,height:50,kind:"ERRelation"},
];

//------------------------------------=======############==========----------------------------------------
//                                           Mouse events
//------------------------------------=======############==========----------------------------------------

function mdown(event)
{
		// React to mouse down on container
		if(event.target.id=="container"){
				mb=1;		
				sscrollx=scrollx;
				sscrolly=scrolly;
				startX=event.clientX;
				startY=event.clientY;
		}else{
				
		}
}

function mup(event)
{
		deltaX=startX-event.clientX;
		deltaY=startY-event.clientY;
		
		mb=0;
}

function mmoving(event)
{
		// Click started in container
		if(mb==1){
				// Compute new scroll position
				deltaX=startX-event.clientX;
				deltaY=startY-event.clientY;
				scrollx=sscrollx-Math.round(deltaX*zoomfact);
				scrolly=sscrolly-Math.round(deltaY*zoomfact);
			
				// Update scroll position
				updatepos();
		}
}

function fab_action()
{
    if(document.getElementById("options-pane").className=="show-options-pane"){
				document.getElementById('optmarker').innerHTML="&#9660;Options";
        document.getElementById("options-pane").className="hide-options-pane";
    }else{
				document.getElementById('optmarker').innerHTML="&#x1f4a9;Options";
				document.getElementById("options-pane").className="show-options-pane";
    }    
}

//------------------------------------=======############==========----------------------------------------
//                                           Zoom handling
//------------------------------------=======############==========----------------------------------------

//-------------------------------------------------------------------------------------------------
// zoomin/out - functions for updating the zoom factor and scroll positions
//-------------------------------------------------------------------------------------------------

function zoomin()
{
		scrollx=scrollx/zoomfact;
		scrolly=scrolly/zoomfact;
	
		if(zoomfact==0.125) zoomfact=0.25
		else if(zoomfact==0.25) zoomfact=0.5
		else if(zoomfact==0.5) zoomfact=0.75
		else if(zoomfact==0.75) zoomfact=1.0
		else if(zoomfact==1.0) zoomfact=1.25
		else if(zoomfact==1.25) zoomfact=1.5
		else if(zoomfact==1.5) zoomfact=2.0
		else if(zoomfact==2.0) zoomfact=4.0;

		scrollx=scrollx*zoomfact;
		scrolly=scrolly*zoomfact;
	
		// Update scroll position - missing code for determining that center of screen should remain at nevw zoom factor
		showdata();
}

function zoomout()
{
		scrollx=scrollx/zoomfact;
		scrolly=scrolly/zoomfact;
	
		if(zoomfact==0.25) zoomfact=0.125
		else if(zoomfact==0.5) zoomfact=0.25
		else if(zoomfact==0.75) zoomfact=0.5
		else if(zoomfact==1.0) zoomfact=0.75
		else if(zoomfact==1.25) zoomfact=1.0
		else if(zoomfact==1.5) zoomfact=1.25
		else if(zoomfact==2.0) zoomfact=1.5
		else if(zoomfact==4.0) zoomfact=2.0;

		scrollx=scrollx*zoomfact;
		scrolly=scrolly*zoomfact;

		// Update scroll position - missing code for determining that center of screen should remain at new zoom factor
		showdata();
}

var ctx;

//-------------------------------------------------------------------------------------------------
// Showdata iterates over all programs/years/periods/courses
//-------------------------------------------------------------------------------------------------

// Generate all courses at appropriate zoom level
function showdata() {
		var container=document.getElementById("container");
		var containerbox=container.getBoundingClientRect();	
    
		// Compute bounds of 
		cwidth=containerbox.width;
		cheight=containerbox.height;
	
		canvas=document.getElementById('canvasOverlay');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	
		ctx = canvas.getContext('2d');	
			
		var str="";
		var courses=[];
		
		// Iterate over programs
		for(var i=0;i<data.length;i++){
				var element=data[i];
				console.log(element);

				str+=`
				<div id='${element.name}' onclick='logReqe(event);'	class='element' style='
						left:${Math.round(element.x*zoomfact)}px;
						top:${Math.round(element.y*zoomfact)}px;
						width:${Math.round(element.width*zoomfact)}px;
						height:${Math.round(element.height*zoomfact)}px;
						font-size:${Math.round(zoomfact*textheight)}px; 
				'>`;
				str+=`<svg width='${Math.round(element.width*zoomfact)}' height='${Math.round(element.height*zoomfact)}' >`;
				if(element.kind=="Entity"){
						str+="<rect x='"+Math.round(strokewidth*zoomfact)+"' y='"+Math.round(strokewidth*zoomfact)+"' width='"+Math.round((element.width*zoomfact)-(strokewidth*zoomfact*2))+"' height='"+Math.round((element.height*zoomfact)-(strokewidth*zoomfact*2))+"' stroke-width='"+Math.round(strokewidth*zoomfact)+"' stroke='black' fill='pink' />";
				}else{
						str+=element.name;
				}
				str+="</svg>"
				str+="</div>";

		}

		container.innerHTML=str;
		updatepos();
	
}

//-------------------------------------------------------------------------------------------------
// updatepos - Update positions of all elements based on the zoom level and view space coordinate
//-------------------------------------------------------------------------------------------------

function updatepos()
{
		for(var i=0;i<data.length;i++){
				var element=data[i];
				
				var elementbox=document.getElementById(element.name);
			
				if(elementbox!=null){
						elementbox.style.left=Math.round((element.x*zoomfact)+(scrollx*(1.0/zoomfact)))+"px";
						elementbox.style.top=Math.round((element.y*zoomfact)+(scrolly*(1.0/zoomfact)))+"px";
				}
		}
		redrawArrows();
}

//-------------------------------------------------------------------------------------------------
// findIndex - Returns index of object with certain ID
//-------------------------------------------------------------------------------------------------

function findIndex(arr,id)
{
		for(var i=0;i<arr.length;i++){
				if(arr[i].id==id) return (i+1);
		}
		return -1;
}

//-------------------------------------------------------------------------------------------------
// redrawArrows - Redraws arrows based on rprogram and rcourse variables
//-------------------------------------------------------------------------------------------------


var rprogram="UNK";
var rcourse="UNK";
function redrawArrows()
{
/*
		if(rprogram!="UNK"&&rcourse!="UNK"){

				var courseforrk=forrk[rcourse];

        // Clear previously selected courses and highlight current
        const scors = document.querySelectorAll(".selected-course");
	    	for (let i = 0; i < scors.length; i++) {
            let scor=scors[i];
            scor.style.backgroundColor=colors[0];
            scor.classList.remove("selected-course");
        }
        document.getElementById(rprogram+rcourse).classList.add("selected-course");

				// Clear all top/left/bottom/right arrays for all courses in affected program and add to courses array
				for(var i=0;i<data.length;i++){
						var program=data[i];
						for(var j=0;j<program.years;j++){
							var periods=program.year[j];
								for(var k=0;k<4;k++){
										var period=0;
										if(k==0) period=periods["4"];
										if(k==1) period=periods["5"];
										if(k==2) period=periods["1"];							
										if(k==3) period=periods["2"];
										if(typeof period!="undefined"){
												for(var l=0;l<period.length;l++){
														var course=period[l];
														course.left=[];
														course.right=[];
														course.top=[];
														course.bottom=[];
														// Assign to courses array
														courses[rprogram+course.code]=course;
												}
										}
								}
						}
				}

				// Clear all arrows
				arrows=[];

				str = logReqRow(courseforrk,rprogram,rcourse,"and");	

				ctx.clearRect(0,0,2000,2000);
				console.log(arrows.length);
			
				var col="#841";

				// Draw all arrows
				for(var i=0;i<arrows.length;i++){
						var arrow=arrows[i];

						// if(arrow.from.course=="IT311G"||arrow.to.course=="IT311G") console.log(arrow);
						if(arrow.from.arr.issorted==false){
								arrow.from.arr.issorted=true;
								arrow.from.arr.sort(function(a, b){return Math.atan2(a.dy,a.dx)-Math.atan2(b.dy,b.dx)});
						}
						if(arrow.to.arr.issorted==false){			
								arrow.to.arr.issorted=true;
								arrow.to.arr.sort(function(a, b){return Math.atan2(a.dy,a.dx)-Math.atan2(b.dy,b.dx)});			
						}

						// I believe that left/right should have x-major sorting instead of y major sorting
						// Further testing needed to figure out if we have any situations with many crossing arrows?
						if(arrow.from.side=="top"){
								var x1=arrow.from.box.left+((arrow.from.box.width/(arrow.from.arr.length+1))*findIndex(arrow.from.arr,arrow.id));
								var y1=arrow.from.box.top;
						}
						if(arrow.from.side=="bottom"){
								var x1=arrow.from.box.left+((arrow.from.box.width/(arrow.from.arr.length+1))*findIndex(arrow.from.arr,arrow.id));
								var y1=arrow.from.box.bottom;
						}
						if(arrow.from.side=="left"){
								var x1=arrow.from.box.left;
								var y1=arrow.from.box.top+((arrow.from.box.height/(arrow.from.arr.length+1))*findIndex(arrow.from.arr,arrow.id));
						}
						if(arrow.from.side=="right"){
								var x1=arrow.from.box.right;
								var y1=arrow.from.box.top+((arrow.from.box.height/(arrow.from.arr.length+1))*findIndex(arrow.from.arr,arrow.id));
						}			
						if(arrow.to.side=="top"){
								arrow.to.arr.sort(function(a, b){return Math.atan2(b.dy,b.dx)-Math.atan2(a.dy,a.dx)});			
								//arrow.to.arr.sort(function(a, b){if(a.dy==b.dy){return a.dx-b.dx}else{return b.dy-a.dy}});
								var x2=arrow.to.box.left+((arrow.to.box.width/(arrow.to.arr.length+1))*findIndex(arrow.to.arr,arrow.id));
								var y2=arrow.to.box.top;
						}
						if(arrow.to.side=="bottom"){
								var x2=arrow.to.box.left+((arrow.to.box.width/(arrow.to.arr.length+1))*findIndex(arrow.to.arr,arrow.id));
								var y2=arrow.to.box.bottom;
						}
						if(arrow.to.side=="left"){
								var x2=arrow.to.box.left;
								var y2=arrow.to.box.top+((arrow.to.box.height/(arrow.to.arr.length+1))*findIndex(arrow.to.arr,arrow.id));
						}
						if(arrow.to.side=="right"){
								var x2=arrow.to.box.right;
								var y2=arrow.to.box.top+((arrow.to.box.height/(arrow.to.arr.length+1))*findIndex(arrow.to.arr,arrow.id));

						}
						drawArrow(x1,y1,x2,y2,col);
				}
		}
*/
}

//-------------------------------------------------------------------------------------------------
// logReq - Click event for course, find course parameters from element id, and recurse into requirements 
//-------------------------------------------------------------------------------------------------

function logReqe(event){
		rprogram=event.target.id.substr(0,5);
		rcourse=event.target.id.substr(5);
	
		redrawArrows();
}

//-------------------------------------------------------------------------------------------------
// logReqRow - Recursive function for course requirements 
//-------------------------------------------------------------------------------------------------

function logReqRow(row,program,course, mode, color_idx=1){
    let str = "";
//		console.log("call: ",row,program,course,mode);
    for(let i=0;i<row.length;i++){
        let r = row[i];
				if(i>0){
						str+=" "+mode+" ";
				}
        if(Array.isArray(r)){
						// For now we assume all second level arrays are "or" - this may need to be revised to support more "exotic" configs
						str +=" ( "+logReqRow(r,program,course,"or",color_idx++)+" ) ";
        }else{
						fromreq=startpoint=document.getElementById(program+r.code);
						toreq=document.getElementById(program+course);
						// Highlight requirement course
            if(fromreq!=null&&toreq!=null){
								frbox=fromreq.getBoundingClientRect();
								tobox=toreq.getBoundingClientRect();
							
								// Depending on the overlap situation we compute distance between extremes of boxes rather than euclidian midpoints
								// If no overlap in X / Y
								if((frbox.left>tobox.right)||(frbox.right<tobox.left)){
										if(frbox.left>tobox.right){
												dx=tobox.right-frbox.left;
										}else{
												dx=tobox.left-frbox.right;
										}
								}else{
										dx=0;		
								}
								if((frbox.top>tobox.bottom)||(frbox.bottom<tobox.top)){
										if(frbox.top>tobox.bottom){
												dy=tobox.bottom-frbox.top;
										}else{
												dy=tobox.top-frbox.bottom;
										}
								}else{
										dy=0;		
								}		
							
								// This id lets us search for connectors
								var currid=makeRandomID();
							
								// Top left to top left dx,dy for sorting
								fdx=tobox.left-frbox.left;
								fdy=tobox.top-frbox.top;
								fromobj={id:currid,dx:fdx,dy:fdy,course:r.code,box:frbox};
								toobj={id:currid,dx:-fdx,dy:-fdy,course:course,box:tobox};

								// Detect interconnection variant - overlap or else
								if(dx==0){
										if(dy<0){
												fromobj.side="top";
												toobj.side="bottom";
										}else{
												fromobj.side="bottom";
												toobj.side="top";
										}
								}else if(dy==0){
										if(dx<0){
												fromobj.side="left";
												toobj.side="right";											
										}else{
												fromobj.side="right";
												toobj.side="left";												
										}
								}else{
										if(dx<0){
												fromobj.side="left";
										}else{
												fromobj.side="right";										
										}
										if(dy<0){
												toobj.side="bottom";												
										}else{
												toobj.side="top";												
										}
								}
							
								// Add to objects!
								if(fromobj.side=="right")  fromobj.arr=courses[program+r.code].right;
								if(fromobj.side=="left")   fromobj.arr=courses[program+r.code].left;
								if(fromobj.side=="top")    fromobj.arr=courses[program+r.code].top;
								if(fromobj.side=="bottom") fromobj.arr=courses[program+r.code].bottom;
								if(toobj.side=="right")    toobj.arr=courses[program+course].right;
								if(toobj.side=="left")     toobj.arr=courses[program+course].left;
								if(toobj.side=="top")      toobj.arr=courses[program+course].top;
								if(toobj.side=="bottom")   toobj.arr=courses[program+course].bottom;
							
								fromobj.arr.issorted=false;
								toobj.arr.issorted=false;
							
								// Store current arrow - we only push new arrows to stack
								var found=false;
								for(var ct=0;ct<arrows.length;ct++){
										if(arrows[ct].from.course==r.code&&arrows[ct].to.course==course) found=true;
								}
								if(!found){
										// Push data to use for sorting connection points to each end of arrow
										fromobj.arr.push({dx:tobox.left,dy:tobox.top,id:currid});
										toobj.arr.push({dx:frbox.left,dy:frbox.top,id:currid});
								
										arrows.push({id:currid,from:fromobj,to:toobj});
								}
							
								// Update styling
                fromreq.classList.add("selected-course");                 
                fromreq.style.backgroundColor=colors[color_idx];
							
                                // If this course was found we recurse further
                                if(hasRecursion){
                                    logReqRow(forrk[r.code],program,r.code,"and");
                                }
            }
            str += r.credits + " " + r.code;
        }
    }
    return str; 
}

//-------------------------------------------------------------------------------------------------
// drawArrow - Canvas code for drawing a filled arrow
//-------------------------------------------------------------------------------------------------

function drawArrow(x1,y1,x2,y2,col)
{
		ctx.lineWidth=2.0;
	
		ctx.strokeStyle=col;
		ctx.fillStyle=col;
	
		// Reflect vector and make unit length * 3
		dx=-(y2-y1);
		dy=x2-x1;
		len=Math.sqrt((dx*dx)+(dy*dy));
		adx=(dx/len)*4.5;
		ady=(dy/len)*4.5;
	
		// Shorten vector to unit length * 8
		dx=x2-x1;
		dy=y2-y1;
		len=Math.sqrt((dx*dx)+(dy*dy));
		pdx=(dx/len)*8;
		pdy=(dy/len)*8;
	
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();	

		ctx.beginPath();
		ctx.moveTo(x2,y2);
		ctx.lineTo(x2-pdx-adx,y2-pdy-ady);
		ctx.lineTo(x2-pdx+adx,y2-pdy+ady);
		ctx.lineTo(x2,y2);	
		ctx.fill();	
}

//-------------------------------------------------------------------------------------------------
// makeRandomID - Random hex number
//-------------------------------------------------------------------------------------------------

function makeRandomID()
{
		var str="";
		var characters       = 'ABCDEF0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < 16; i++ ) {
				str += characters.charAt(Math.floor(Math.random() * charactersLength));
		}	
		return str;
}

//------------------------------------=======############==========----------------------------------------
//                                    Default data display stuff
//------------------------------------=======############==========----------------------------------------

function getData() {
		showdata();
}

function data_returned(ret) {
    if (typeof ret.data !== "undefined") {
        service=ret;
        showdata();			
		} else {
        alert("Error receiveing data!");
    }
}
