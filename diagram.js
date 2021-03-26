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
var NameID=makeRandomID();
var SizeID=makeRandomID();

var data=[
    {name:"Person",x:100,y:100,width:200,height:50,kind:"EREntity",id:PersonID},
    {name:"Car",x:500,y:140,width:200,height:50,kind:"EREntity",id:makeRandomID()},	
    {name:"Has",x:420,y:60,width:50,height:50,kind:"ERRelation",id:makeRandomID()},
    {name:"ID",x:30,y:30,width:90,height:40,kind:"Attr",id:IDID},
    {name:"Name",x:170,y:30,width:90,height:40,kind:"Attr",id:NameID},
    {name:"Size",x:320,y:120,width:90,height:40,kind:"Attr",id:SizeID},
];

var lines=[
    {id:makeRandomID(),fromID:PersonID,toID:IDID},
    {id:makeRandomID(),fromID:PersonID,toID:NameID},
    {id:makeRandomID(),fromID:PersonID,toID:SizeID}
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
				if(element.kind=="EREntity"){
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
        var domelementpos=domelement.getBoundingClientRect();
        element.x1=domelementpos.left;
        element.y1=domelementpos.top;
        element.x2=domelementpos.left+domelementpos.width;
        element.y2=domelementpos.top+domelementpos.height;
        element.cx=element.x1+(domelementpos.width*0.5);
        element.cy=element.y1+(domelementpos.height*0.5);
		}
		
		// Make list of all connectors?
		connectors=[];

    for(var i=0;i<lines.length;i++){
        var currentline=lines[i];
        var felem,telem,dx,dy;
        
        felem=data[findIndex(data,currentline.fromID)];
        telem=data[findIndex(data,currentline.toID)];
        dx=felem.cx-telem.cx;
        dy=felem.cy-telem.cy;

        // Figure out overlap - if Y overlap we use sides else use top/bottom
        var overlapY=true;
        if(felem.y1>telem.y2||felem.y2<telem.y1) overlapY=false;
        var overlapX=true;
        if(felem.x1>telem.x2||felem.x2<telem.x1) overlapX=false;        
        var majorX=true;
        if(Math.abs(dy)>Math.abs(dx)) majorX=false;

        // Determine connection type (top to bottom / left to right or reverse - (no top to side possible)
        var ctype=0;
        if(overlapY||((majorX)&&(!overlapX))){
            if(dx>0) currentline.ctype="LR"
            else currentline.ctype="RL"; 
        }else{
            if(dy>0) currentline.ctype="TB";
            else currentline.ctype="BT"; 
        }

        // Add accordingly to association end
        if(currentline.ctype=="LR"){
            if(felem.kind=="EREntity") felem.left.push(currentline.id);
            if(telem.kind=="EREntity") telem.right.push(currentline.id);
        }else if(currentline.ctype=="RL"){
          if(felem.kind=="EREntity") felem.right.push(currentline.id);
          if(telem.kind=="EREntity") telem.left.push(currentline.id);
        }else if(currentline.ctype=="TB"){
          if(felem.kind=="EREntity") felem.top.push(currentline.id);
          if(telem.kind=="EREntity") telem.bottom.push(currentline.id);
        }else if(currentline.ctype=="BT"){
          if(felem.kind=="EREntity") felem.bottom.push(currentline.id);
          if(telem.kind=="EREntity") telem.top.push(currentline.id);
        }
    
    }

    // Sort all association ends that number above 0 according to direction of line

    // Draw each line using sorted line ends when applicable
    for(var i=0;i<lines.length;i++){
        var currentline=lines[i];
        var felem,telem,dx,dy;
        
        felem=data[findIndex(data,currentline.fromID)];
        telem=data[findIndex(data,currentline.toID)];

        // Draw each line - compute end coordinate from position in list compared to list count
        fx=felem.cx;
        fy=felem.cy;
        tx=telem.cx;
        ty=telem.cy;

        // Collect coordinates
        if(currentline.ctype=="BT"){
            fy=felem.y2;
            fx=felem.x1+(((felem.x2-felem.x1)/(felem.bottom.length+1))*(felem.bottom.indexOf(currentline.id)+1));
        }else if(currentline.ctype=="TB"){
            fy=felem.y1;
            fx=felem.x1+(((felem.x2-felem.x1)/(felem.top.length+1))*(felem.top.indexOf(currentline.id)+1));
        }else if(currentline.ctype=="RL"){
            fx=felem.x2;
        }else if(currentline.ctype=="LR"){
            fx=felem.x1;
        }

        str+=`<line x1='${fx}' y1='${fy}' x2='${tx}' y2='${ty}' stroke='#f44' stroke-width='2' />`;
    }

    document.getElementById("svgoverlay").innerHTML=str;

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
