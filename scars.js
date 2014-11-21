var viacreate=0,viagmobj=[],mevia=[],labelarr=[];
var autocomplete=[], bookingloc={},directionsDisplay, calculatedfare=0;//must save fare on going to other page else lost 
var jobmileage;
var baserate=2.5, minfare=5, longmilestartsfrom=60;longmileagerate=2;//can be getten from the server
var directionsService = new google.maps.DirectionsService();
var myfavy=[];//global cache for favourites
var myoldbookings=[];//global cache for oldbookings
var activebookinghist=[];//global cache for active booking
var telcust;//customer telephone
var vehicleclass;
var emailmevar;
var jobref;

///////////////////////////////////////////////////////////////
function initialize() {
  // Create the autocomplete object,  restricting the search
  // to geographical location types.
  bookingloc.from = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('from')), 
      { types: ['geocode'] });
      
  google.maps.event.addListener(bookingloc.from,  'place_changed',  function() {
    fillInAddress(this,"from");
  });
  
bookingloc.to = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('to')), 
      { types: ['geocode'] });
      
    google.maps.event.addListener(bookingloc.to,  'place_changed',  function() {
    fillInAddress(this,"to");
  });

  
directionsDisplay = new google.maps.DirectionsRenderer();

//////check if there is stored email and telephone if so populate it in their fields
if(window.localStorage.email)//if it exist read in
  {
     emailmevar=JSON.parse(window.localStorage.email);
     document.getElementById('emailme').value=emailmevar;
   }
    




if(window.localStorage.tel)//if it exist read in
  {
     telcust=JSON.parse(window.localStorage.tel);
     document.getElementById('telme').value=telcust;
   }
    
  
//////////check if there is value in session storage from draggable markers


if(window.sessionStorage.ssdragmapfrom){
 var dragmapfrom= JSON.parse(window.sessionStorage.ssdragmapfrom);
document.getElementById('from').value=dragmapfrom.address;
   bookingloc.from=dragmapfrom;
//test code end
}

//////////check if there is value in session storage from draggable markers for TO
if(window.sessionStorage.ssdragmapto){
  var dragmapto= JSON.parse(window.sessionStorage.ssdragmapto);
document.getElementById('to').value=dragmapto.address;
 bookingloc.to=dragmapto;
//test code end
}

initasaphidecalnclock();  
nomyoldbookings();
nofavy();
}
//////////////////////////////////////


function addVia(){
    viacreate++;
    var viastr=(viagmobj.length+1).toString();
    var parent = document.getElementById('content');;
    var div = document.createElement('div');
    var label=document.createElement('h4');
    label.innerHTML="Via:"+ viastr;
    label.id="l"+viastr;
    div.appendChild(label);
    var input = document.createElement('input');
    input.type='text';
    input.id=viastr;
    div.appendChild(input);
    var removeButton = document.createElement("button");
    removeButton.innerHTML = "Remove";
    removeButton.onclick = function(e) {
       	var vindex=this.previousElementSibling.previousElementSibling.id.substr(1,1);
        var vlimit=viagmobj.length+1;
	var vsplice=vindex-1;
        viagmobj.splice(vsplice,1);
	if(mevia[vsplice])
	{
	mevia.splice(vsplice,1);
	}
        
	var vnext=parseInt(vindex)+1;
	for(vnext;vnext<vlimit;vnext++)
	{
	  var nextid="l"+vnext;
	  var iky=document.getElementById(nextid);
	  var newinner=vnext-1;
	  iky.innerHTML="Via:"+newinner;
	  iky.id="l"+newinner;
	  
	}
	this.parentNode.parentNode.removeChild(this.parentNode);
	calcRoute();
        return(false);
    };
    div.appendChild(removeButton);
    var mybr=document.createElement("br");
    div.appendChild(mybr);
    parent.appendChild(div);
    /////////////////////////////
    
    var arrhold= new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById(viastr)), 
      { types: ['geocode'] });
      google.maps.event.addListener(arrhold,"place_changed", function(){
	fillInAddress(arrhold,'via');
	
      });
      viagmobj.push(arrhold);
}


//////////////////////////
function fillInAddress(i,option) {
  //dest=> from, to,via

  // Get the place details from the autocomplete object.
 var addaray={};
    
    var place = i.getPlace();
    if (place==undefined){return;}
    var address = place.formatted_address;
    
    //the order is important it needs to be before geocoder
    
    //checking types in place.address_components for postal code
 addaray["address"] = address;
 place.address_components.forEach(function(entry){
   if(entry.types=="postal_code"){
     addaray["postcode"]=entry["long_name"];
  }
 });
  
 if(addaray["postcode"]==undefined)
 {
 alert("exact address not given so quote is just rough estimate");
 }
 
    
    
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address},  function(results,  status) {
    if (status == google.maps.GeocoderStatus.OK) {
       addaray["lat"]=results[0].geometry.location.k; 
       addaray["lon"]=results[0].geometry.location.B; 
       //https://developers.google.com/maps/documentation/javascript/geocoding
       
       }
     else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
 
 if(option=="via"){
  var viactual=viagmobj.indexOf(i);
  //arr.splice(2, 0, "Lene");
  mevia.splice(viactual,0,addaray);//dumping entire array lat@ lon @full @address @postcode
  bookingloc["via"]=mevia;
  }
 if(option=="from")
 {
 bookingloc.from=addaray;
 }
 if(option=="to")
 {
 bookingloc.to=addaray;
 }
  calcRoute();//whenever filed changes it calculates for fare [saloon is selected by default]
  }
// [END region_fillform]


///////////////////////////////////////////


//////calculate distance using gmap directionsDisplay
function calcRoute()
{
      //check if user has blanked the field
  
  if((document.getElementById('from').value==="") || (typeof bookingloc.from=='undefined')||(document.getElementById('to').value==="")||(typeof bookingloc.to=='undefined')){
    document.getElementById('total').innerHTML="";
    return;
    
  }
  
  var start = bookingloc.from.address;
  var end = bookingloc.to.address;
  var waypts = [];
  if(viagmobj.length>0)
  {
  
  bookingloc.via.forEach(function(entry){
  waypts.push({
          location:entry.address, 
          stopover:true});
  });
  }
    var request = {
      origin: start, 
      destination: end, 
      waypoints: waypts, 
      optimizeWaypoints: true, 
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request,  function(response,  status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      computeTotalDistance(directionsDisplay.getDirections());
     //bookingsavetolocalstorage();//save bookings to localstorage as history
     
    }
  });
}

/////////mileage calculate
function computeTotalDistance(result) {
  var total = 0, resultr=0;
  var myroute = result.routes[0];
  for (var ic = 0; ic < myroute.legs.length; ic++) {
	total += myroute.legs[ic].distance.value;
  }
  total = total / 1000.0;
  total = total * 0.62;//km to miles
  resultr=total.toFixed(1);
  jobmileage=resultr;
  var costofjourney= (resultr*baserate);//base rate
  if( resultr > longmilestartsfrom){ costofjourney=resultr*longmileagerate;} //for long journey, lower base rate
  
  if (costofjourney < minfare){ costofjourney=minfare;} //minimum fare
  var costofestate =  costofjourney+5; //£5 on the top
  var costofmpv = costofjourney*1.5; //fare and a half
  var costofexecutive= costofjourney*1.8; //80% more than normal
  var Costofwaitnreturn= costofjourney*1.5;//for a saloon for all others it needs to be 1.5 times of the fare
  //optionval=parseInt(document.getElementById('vehicletype').selectedIndex);redundant code
  var optionval=document.getElementById('vehicletype').selectedIndex;
  var istringval="";
//    var img = document.createElement("IMG");
  
  switch( optionval)
 {
case 0:
  istringval = "Cost is £"+ costofjourney.toFixed(2);
  calculatedfare=costofjourney.toFixed(2);
  vehicleclass="S";
//  img = "images/SALOON.png";
 break;
case 1:
 istringval = "Cost is £"+ costofestate.toFixed(2);
 calculatedfare=costofestate.toFixed(2);
 vehicleclass="E";
 // img= "images/ESTATE.png";
 break;
case 2:
  istringval ="Cost is £"+ costofexecutive.toFixed(2);
  calculatedfare=costofexecutive.toFixed(2);
  vehicleclass="X";
//  img = "images/EXECUTIVE.png";
break;
case 3:
 istringval ="Cost is £"+ costofmpv.toFixed(2);
 calculatedfare=costofmpv.toFixed(2);
 vehicleclass="M";
 //  img = "images/MPV.png";

break;
case 4:
  istringval = "Cost is £"+ costofjourney.toFixed(2);
  calculatedfare=costofjourney.toFixed(2);
 vehicleclass="L";
 

break;
default:{}



}

//document.getElementById('image').innerHTML="<img src="+img+">";
document.getElementById('total').innerHTML = istringval;
// document.getElementById('but').innerHTML = "<img src="+"images/but.png"+">";
 

}

/////////////////////phase 2////////////////////////////////////////////
function mylocation()
{
window.location.href = "map.html";
}

///////////my local place search nearby
function mylocalplace()
{
window.location.href = "place.html";
}

function bufvar2localstorage(dir,bufvar,bufls)
{

//<button onclick="favtolocalstorage()">Save to Favourite</button> 
//save current gmap object in TO to local storage for favourites

//check index of fav and save accordingly

if(window.localStorage[bufls])//if it exist read in
  {
     bufvar=removedupinarray(JSON.parse(window.localStorage.bufls));//remove dups
     bufvar.push(bookingloc[dir]);
     window.localStorage.setItem(bufls, JSON.stringify(bufls)); //store it
   }
    
    
}
////////////////////////////////////////////////////////////////////
//pass the name of the element in which it will populate from localstorage
function populate(nameofselect,bufls,bufvar)
{

var select = document.getElementById(nameofselect);


if(select.length>0)
{
while (select.firstElementChild) {
    select.removeChild(select.firstElementChild);
    }
}


if(window.localStorage[bufls])//if it exist read in
  {
    bufvar=JSON.parse(window.localStorage[bufls]);
   }
///remove existing list banish it
 bufvar=removedupinarray(bufvar);//remove dups before loading
//reading array values in to the list
var optionsupdate=[];
for(var id = 0; id < myfavy.length; id++) {
    optionsupdate[id]=bufvar[id].address;//the full address of each entity is first array
    var optupdate = optionsupdate[id];
    var elupdate = document.createElement("option");
    elupdate.textContent = optupdate;
    elupdate.value = optupdate;
    select.appendChild(elupdate);
}
}


function selectfavput(nameofselect,dir,buffer)
{
var select = document.getElementById("nameofselect");

bookingloc[dir]=buffer[select.selectedIndex];
document.getElementById(dir).value=bookingloc[dir].address;
calcRoute();
}


function delfromlocalstorage(nameofselect,dir,bufvar,bufls)
{

var select = document.getElementById(nameofselect);
select.remove(select.selectedIndex);
bufvar.splice(select.selectedIndex, 1);
window.localStorage.setItem(bufls, JSON.stringify(bufvar));


}


//event handler on selecting index it assigned object to bookingloc[0], and full address
function selectbookingintonfrom()
{
// <select id="GetRepeatBooking" onClick="selectbookingintonfrom();">
//whatever is selectedIndex
//push it in 'to' and from  field    
//////////
var select = document.getElementById("GetRepeatBooking");
var fbto=select.selectedIndex;//it corresponds to myoldbookings[i]
bookingloc=myoldbookings[fbto];//so corresponding full object in booking loc
document.getElementById('from').value=bookingloc["from"].address;
document.getElementById('to').value=bookingloc["to"].address;
////////////////sorting out via if any//////////////////////////
popvia();
//call calcRoute() so that fare gets updated
calcRoute();
}///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////
//////////////exit wound the size of a tangerine
function popvia()
{
////////////////sorting out via if any//////////////////////////
document.getElementById('content').innerHTML = '';
bookingloc[via]=[];
viagmobj=[];


bookingloc[via].forEach(function(entry){
addVia();
document.getElementById(entry)=entry;
});
}



function cleanup()
{
var activebooking={};//current active booking
  //bookingloc; contains geography, calculatedfare; contains fare
//get current date and time for ASAP jobs
// put a check box for asap jobs and checks it put current date and time for it
//var successful will be used for validation at each step
telcust=document.getElementById("telme").value;
emailmevar=document.getElementById("emailme").value;
if(telcust==""){alert("please put your contact and press 'Confirm' again");return;}//break off function
 var telvalid=telcust.replace(/\W+/g, '');//remove non numeric anything from the phone
if(telvalid.length<7){alert("Please Enter Telephone Number it's missing some digits and press 'Confirm' again");return;}
if(!(/\S+@\S+\.\S+/.test(emailmevar))){alert("Please Enter a Valid Email address and press 'Confirm' again");return;}//one time valid email check some@body.com
if(calculatedfare==0){alert("please calculate fare");return;}//break off
//if(vehicleclass==0){alert("please select vehicle type");return;}//break off //not needed anymore
//if(emailmevar==""){alert("please put your email");return;}//break off function
//email is optional but tel is mandatory
/////////////////FOR ASAP JOBS/////////////////////  
var asapjob;//is it asap job
var currentdatetime= new Date().toISOString();//gives current date and time as ISO string
var currentdatetimeparse= Date.parse(currentdatetime);//to be used in calculation for asap jobs the integers value
asapjob=document.getElementById("myCheck").checked;
if (asapjob)
  {
  //save bookingloc; save date n time , 
  //flag it as active job in local storage
  //////////////////////////////////////////
    /////////////////////////////////////////
  activebooking["datentime"]=currentdatetimeparse;
  var timearr=currentdatetime.split("T");//split in to date and time
  var timemill=timearr[1].split(".");//get rid of milliseconds
  activebooking["date"]=timearr[0];
  activebooking["time"]=timemill[0];
   /////////////////////////////////////////

  }
  
  
  /////////////////////////////////////////

//////////if asap jobs skip this//////////////
else
  {  
//////////////////FOR FUTURE BOOKINGS/////////////////////////////
var usertime=document.getElementById("metime").value;
if (usertime==""){alert("please set time");return;}////////////////////time not set
var userdate=document.getElementById("medate").value;
if (userdate==""){alert("please set date");return;}////////////////////date not set
var combinedatentime=userdate+" "+usertime;
var futureisodnt=new Date(combinedatentime).toISOString();//future booking date n time as ISO string
var futureisodntparse=Date.parse(futureisodnt);//future booking date n time as ISO integers
//data validation must not be in past
if (bookingloc["from"]==bookingloc["to"]){alert("origin cannot be same as destination");}
///test code start
var vmedate=Date.parse(combinedatentime);//date parse will parse the string and gives the hash
var vnowdate=Date.parse(Date());//get Current Date
var datediff=vmedate-vnowdate;//this should be positive
if (datediff<0) {alert("past date n time bookings not allowed");return;}//break
  ////
  
  activebooking["datentime"]=futureisodntparse;
  var ftimearr=futureisodnt.split("T");//split in to date and time
  var ftimemill=ftimearr[1].split(".");//get rid of milliseconds
  activebooking["date"]=ftimearr[0];
  activebooking["time"]=ftimemill[0];
 
  }

activebooking["tel"]=telvalid;
activebooking["email"]=emailmevar;
window.localStorage.setItem("email", JSON.stringify(emailmevar)); //store it
window.localStorage.setItem("tel", JSON.stringify(telcust)); //store it
activebooking["fromtovia"]=bookingloc;
activebooking["fare"]=calculatedfare;//date ,time ,tel, bookingloc,fare,
activebooking["vehicletype"]=vehicleclass;//vehicle type 0 SALOON 1 ESTATE 2 EXECUTIVE 3 MPV
jobref=referencegen(6, '0123456789');//human friendly 6 digit ref for customer
activebooking["jobref"]=jobref;
activebooking["jobmileage"]=jobmileage;

//activebooking = datentime,tel,email,bookingloc,fare,vehicletype

///query server for booking id
//send date for job table
//if (successful, function should return booking ref)
////////
//connect to remote database 
//get primary id key for jobs

//if unsuccessful alert than break

//save it in bookingid;
////////////
//activebooking.push(bookingid); CODE
///save it to localstorage
//

//WARNING I HAVENT ADDED ANY (booking ref)ID YET BEFORE SAVING TO LOCALSTORAGE
if(window.localStorage.activebookingls)//if it exist read in
  {
activebookinghist=JSON.parse(window.localStorage.activebookingls);
//activebookinghistory  is global cache for holding activebookingls from localst
   }
    activebookinghist.push(activebooking);//TO add it to acitvebookinghist array
    window.localStorage.setItem("activebookingls", JSON.stringify(activebookinghist)); //store it
////////////////    
//activebooking;
//[1403109126000, "07947771751", "i@i.com",Array[2], "5.00", 1]

//////////
///////test code start
    //save curractivebooking in local storage by jsonifing the object
    window.localStorage.setItem("curactivebooking", JSON.stringify(activebooking)); //store it
    
   createdf();
/////////////test code end

}

function asaphidemanual()
{
if (document.getElementById("myCheck").checked)
  
  {
    //hide the manual date and time input
    document.getElementById("medate").style.display='none';
    document.getElementById("metime").style.display='none';
  }
 else
 {
  //show the manual date and time input
    document.getElementById("medate").style.display='';
    document.getElementById("metime").style.display='';
   
}
   
 
}
//////////////////////////////////////////////////
function initasaphidecalnclock()
{
  document.getElementById("myCheck").checked=true;
  //hide the manual date and time input
  document.getElementById("medate").style.display='none';
  document.getElementById("metime").style.display='none';
}
//////////////////////////////////////////////////
function myreturnfn()
{
  //id="myreturn" onchange="myreturnfn()
  if (document.getElementById("myreturn").checked)
  
  {
    //swap origin and destination
    bookingloc[via].reverse();//reverse array;
    //populating bookingloc in document.elements
    //redrawing via's as well
    document.getElementById('from').value=bookingloc["to"].address;
document.getElementById('to').value=bookingloc["from"].address;
////////////////sorting out via if any//////////////////////////
popvia();
}
}

/////////////////////////////////
///////unique booking history and favourites no duplicates
//Hash Sieving
//http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
function removedupinarray(iarr)
{
  var o = {}, i, l = iarr.length, r = [];
    for(i=0; i<l;i+=1) o[iarr[i].address] = iarr[i];
    for(i in o) r.push(o[i]);
    return r;
  }

/////////////////////////////////
//if no favourite then disable get and delete favourite
function nofavy()
{
  //   <button onclick="populatefavsfrom();" id="gff">Get Favourite</button>
  //<select id="GetFavouritebackfrom" onClick="selectfavputinfrom();">
 //   <button onclick="delfavfromlocalstoragefrom()" id="dff">delete from Favourite</button>
 //     <button onclick="populatefavsto();" id=gft>Get Favourite</button>
 //            <select id="GetFavouritebackto" onClick="selectfavputinto();">
 //            <button onclick="delfavfromlocalstorageto()" id="dft">delete from Favourite</button>
  if( (typeof window.localStorage.fav=='undefined')||(window.localStorage.fav.length==0) )
  {
   document.getElementById("gff").style.display='none';
   document.getElementById("GetFavouritebackfrom").style.display='none';
   document.getElementById("dff").style.display='none';
   document.getElementById("gft").style.display='none';
   document.getElementById("GetFavouritebackto").style.display='none';
   document.getElementById("dft").style.display='none';
  }
   
  else
  {
   document.getElementById("gff").style.display='';
   document.getElementById("GetFavouritebackfrom").style.display='';
   document.getElementById("dff").style.display='';
   document.getElementById("gft").style.display='';
   document.getElementById("GetFavouritebackto").style.display='';
   document.getElementById("dft").style.display='';
  }
}
//////////////////////////////////////////
function nomyoldbookings()
{
 if( (typeof window.localStorage.bookhist=='undefined')||(window.localStorage.bookhist.length==0))
 {
   //  <button id="repeatbk" onclick="myRepeatBooking()">Repeat Booking</button>
    //<select id="GetRepeatBooking" onClick="selectbookingintonfrom();">
    document.getElementById("repeatbk").style.display='none';
    document.getElementById("GetRepeatBooking").style.display='none';
   
  } 
  
  else
  {
  
    document.getElementById("repeatbk").style.display='';
    document.getElementById("GetRepeatBooking").style.display='';
    
  }
 
}
//////////////////////////////////////////
//function to go to the sdk generated index of dream factory



///////////////////////////////////////////////////////////////////////////////////
//function lsset(keyname,keyval){
  
//window.localStorage.setItem(keyname, JSON.stringify(keyval));
//}
  
//keyval= JSON.parse(window.localStorage.keyname);
//iky= {name:"imran",age:30};
//{address:,postcode:,lat:,lon:};

function referencegen(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
//var rString = referencegen(6, '0123456789abcdefghjkmnpqrstuvwxyz');

/////////////////////////////////////////////
function repbo(){
populate('GetRepeatBooking','bookhist',myoldbookings);
}