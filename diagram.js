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

// Currently clicked object list
var context=[];

//-------------------------------------------------------------------------------------------------
// makeRandomID - Random hex number
//-------------------------------------------------------------------------------------------------

function makeRandomID()
{
		var str="";
		var characters       = 'ABCDEF0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < 6; i++ ) {
				str += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return str;
}

// Example entities and attributes

var PersonID=makeRandomID();
var IDID=makeRandomID();

var data=[
	{name:"Person",x:100,y:100,width:200,height:50,kind:"Entity",id:PersonID},
	{name:"Car",x:500,y:140,width:200,height:50,kind:"Entity",id:makeRandomID()},	
	{name:"Has",x:400,y:100,width:50,height:50,kind:"ERRelation",id:makeRandomID()},
	{name:"ID",x:30,y:30,width:90,height:40,kind:"Attr",id:IDID},	
];

var lines=[{fromID:PersonID,toID:IDID}];

//------------------------------------=======############==========----------------------------------------
//                                           Mouse events
//------------------------------------=======############==========----------------------------------------

function mdown(event)
{
		console.log(mb,event.target.id);
	
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

function ddown(event)
{
		startX=event.clientX;
		startY=event.clientY;
		mb=8;
	
		updateSelection(data[findIndex(data,event.currentTarget.id)],null,null);
	
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
				updatepos(null,null);
		}else if(mb==8){
				// Moving object
				deltaX=startX-event.clientX;
				deltaY=startY-event.clientY;
			
				// We update position of connected objects
				updatepos(deltaX,deltaY);

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

//-------------------------------------------------------------------------------------------------
// findIndex - Returns index of object with certain ID
//-------------------------------------------------------------------------------------------------

function findIndex(arr,id)
{
		for(var i=0;i<arr.length;i++){
				if(arr[i].id==id) return i;
		}
		return -1;
}

//-------------------------------------------------------------------------------------------------
// Showdata iterates over all diagram elements
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
			
				// Compute size variables
				var linew=Math.round(strokewidth*zoomfact);
				var boxw=Math.round(element.width*zoomfact);
				var boxh=Math.round(element.height*zoomfact);
				var texth=Math.round(zoomfact*textheight);
				var hboxw=Math.round(element.width*zoomfact*0.5);
				var hboxh=Math.round(element.height*zoomfact*0.5);
			
				str+=`
				<div id='${element.id}'	class='element' onmousedown='ddown(event);' style='
						left:0px;
						top:0px;
						width:${boxw}px;
						height:${boxh}px;
						font-size:${texth}px; 
				'>`;
				str+=`<svg width='${boxw}' height='${boxh}' >`;
				if(element.kind=="Entity"){
						str+=`<rect x='${linew}' y='${linew}' width='${boxw-(linew*2)}' height='${boxh-(linew*2)}' stroke-width='${linew}' stroke='black' fill='pink' />`;
				}else{
						str+=`<path d="M${linew},${hboxh} 
                           Q${linew},${linew} ${hboxw},${linew} 
                           Q${boxw-linew},${linew} ${boxw-linew},${hboxh} 
                           Q${boxw-linew},${boxh-linew} ${hboxw},${boxh-linew} 
                           Q${linew},${boxh-linew} ${linew},${hboxh}" 
                    stroke='black' fill='pink' />`;
				}
				str+="</svg>"
				str+="</div>";

		}

		container.innerHTML=str;
		updatepos(null,null);
	
}

//-------------------------------------------------------------------------------------------------
// updateselection - Update context according to selection parameters or clicked element
//-------------------------------------------------------------------------------------------------

function updateSelection(ctxelement,x,y)
{
		// Clear list of selected elements
		context=[];
	
		console.log(ctxelement);
	
		if(ctxelement!=null){
				// if we pass a context object e.g. we clicked in object
				context.push(ctxelement);
		}else if(typeof x != "undefined" && typeof y != "undefined"){
				// Or if x and y are both defined
		}
}


//-------------------------------------------------------------------------------------------------
// updatepos - Update positions of all elements based on the zoom level and view space coordinate
//-------------------------------------------------------------------------------------------------

function updatepos(deltaX,deltaY)
{
		for(var i=0;i<data.length;i++){
				
				var element=data[i];
				var elementbox=document.getElementById(element.id);
						
				if(elementbox!=null){
						if(deltaX!=null&&findIndex(context,element.id)!=-1){
								elementbox.style.left=(Math.round((element.x*zoomfact)+(scrollx*(1.0/zoomfact)))-deltaX)+"px";
								elementbox.style.top=(Math.round((element.y*zoomfact)+(scrolly*(1.0/zoomfact)))-deltaY)+"px";
						}else{
								elementbox.style.left=Math.round((element.x*zoomfact)+(scrollx*(1.0/zoomfact)))+"px";
								elementbox.style.top=Math.round((element.y*zoomfact)+(scrolly*(1.0/zoomfact)))+"px";
						}
				}
		}
		redrawArrows();
}

//-------------------------------------------------------------------------------------------------
// overlapBox - Redraws arrows based on rprogram and rcourse variables
//-------------------------------------------------------------------------------------------------

function overlapBox(from,to)
{
    // Center kinds C CT CB CL CR L R T B
}

//-------------------------------------------------------------------------------------------------
// redrawArrows - Redraws arrows based on rprogram and rcourse variables
//-------------------------------------------------------------------------------------------------

function redrawArrows()
{
    str="";

		// Clear all lines and update with dom object dimensions
		for(var i=0;i<data.length;i++){
				var element=data[i];
				element.left=[];
				element.right=[];
				element.top=[];
				element.bottom=[];

        // Get data from dom elements
        var domelement=document.getElementById(element.id);
        element.x1=domelement.clientX;
        element.y1=domelement.clientY;
        element.x2=domelement.clientX+domelement.width;
        element.y2=domelement.clientY+domelement.width;
        element.cx=element.x1+(domelement.width*0.5);
        element.cy=element.y1+(domelement.height*0.5);

		}
		
		// Make list of all connectors?
		connectors=[];

    console.log(elements);

    for(var i=0;i<lines.length;i++){
        var currentline=lines[i];
        var from=findIndex(data,currentline.fromID);
        var to=findIndex(data,currentline.toID);
        var felem=data[from];
        var toelem=data[to];

        console.log("from: "+felem.name+" to: "+toelem.name)

      }

    // Center
    // Center X Top
    // Center X Bottom
    // Center Y Left
    // Center Y Right

	
		
/*
		if(rprogram!="UNK"&&rcourse!="UNK"){

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
