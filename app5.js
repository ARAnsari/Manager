var firstime=0;var myjson={};var jobcontent={};var latlngar=[];var mapvar,mylayer;var userid,officename;window.app={};document.addEventListener('apiReady',checkSession,true);function checkSession(){iky();window.df.apis.user.getSession({"body":{}},function(response){response.session_id=JSON.parse(sessionStorage.getItem("dfsess"));userid=JSON.parse(sessionStorage.getItem("dfuser"));officename=JSON.parse(sessionStorage.getItem("dfoffice"));if(response.session_id===null||response.session_id==""){document.getElementById("login").style.display="";logIn();}else
{var session=new ApiKeyAuthorization("X-Dreamfactory-Session-Token",response.session_id,'header');window.authorizations.add("X-DreamFactory-Session-Token",session);document.getElementById("login").style.display="none";document.getElementById("loginmain").style.display="none";document.getElementById("mapdiv").style.display="block";document.getElementById("loginbg").style.cssText="";document.getElementById('boldStuff').innerHTML=userid+"_"+officename;alert("Welcome back");runApp();}},function(response){document.getElementById("login").style.display="";document.getElementById('boldStuff').innerHTML="Please Login!";logIn();});}
function runApp(){document.getElementById("mapdiv").style.display="none";mylayer=new L.LayerGroup();L.Icon.Default.imagePath='./';mapvar=L.map('mapdiv');mapLink='<a href="http://openstreetmap.org">OpenStreetMap</a>';L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; '+mapLink+' Contributors',maxZoom:18,}).addTo(mapvar);var overlays={"LiveDrivers":mylayer};L.control.layers(overlays).addTo(mapvar);getRecords();setInterval(getRecords,30000);}
function getRecords(){window.df.apis.localmongo.getRecords({"table_name":"Driverloc"},function(response){buildItemList(response);},crudError);}
function buildItemList(json){myjson=json;var latlngar=[];var oms=new OverlappingMarkerSpiderfier(mapvar);if(json.record.length>0)
{document.getElementById("mapdiv").style.display="block";json.record.forEach(function(entry){var formatter=[];formatter.push(entry["latitude"]);formatter.push(entry["longitude"]);var ms=Date.now()-entry["timestamp"];var M=Math.floor(ms/60000);ms-=M*60000;var S=ms/1000;var htime=parseInt(M)+"minutes::"+parseInt(S)+" seconds ago";var mylabel="Drv:"+entry["uniqueid"]+"<br>last movement:"+htime+"<br>State:"+entry["state"]+"<br>"+"Speed:"+entry["speed"]+"<br>accuracy:"+entry["accuracy"];marker=new L.marker(formatter).bindPopup(mylabel).openPopup().addTo(mylayer);oms.addMarker(marker);latlngar.push(formatter);});}
else{document.getElementById("mapdiv").style.display="none";}
if(latlngar.length>0){var bounds=new L.LatLngBounds(latlngar);mapvar.fitBounds(bounds);}}
function getErrorString(response){var msg="An error occurred, but the server provided no additional information.";if(response.content&&response.content.data&&response.content.data.error){msg=response.content.data.error[0].message;}
msg=msg.replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&').replace(/&apos;/g,'\'');return msg;}
function crudError(response){if(response.status==401||response.status==403){logIn();}else{alert(getErrorString(response));}}
function logIn(){var email=document.getElementById('UserEmail').value;var pw=document.getElementById('Password').value;if(!email||!pw){return;}
var body={"email":email,"password":pw};window.df.user.login({"body":body},function(response){var session=new ApiKeyAuthorization("X-Dreamfactory-Session-Token",response.session_id,'header');window.authorizations.add("X-DreamFactory-Session-Token",session);userid=response.email;officename=response.last_name;document.getElementById("login").style.display="none";document.getElementById("loginmain").style.display="none";document.getElementById("mapdiv").style.display="block";document.getElementById("loginbg").style.cssText="";alert("Welcome you are now logged in");document.getElementById('boldStuff').innerHTML=userid+"_"+officename;runApp();},function(response){alert("Error getting session");});}