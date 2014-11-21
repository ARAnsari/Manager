var autocomplete = [],
    bookingloc = [],
    numofvia = 0,
    directionsDisplay, calculatedfare = 0,
    jobmileage, baserate = 2.5,
    minfare = 5,
    longmilestartsfrom = 60;
longmileagerate = 2;
var directionsService = new google.maps.DirectionsService,
    telcust, vehicleclass, jobref, drvnote = "";

function initialize() {
    getacc(); 
    autocomplete[0] = new google.maps.places.Autocomplete(document.getElementById("autocomplete"), {
        types: ["geocode"]
    });
    autocomplete[1] = new google.maps.places.Autocomplete(document.getElementById("autocomplete1"), {
        types: ["geocode"]
    });
    for (var a = autocomplete.length, c = 0; c < a; ++c) google.maps.event.addListener(autocomplete[c], "place_changed", function () {
        fillInAddress(this)
    });
    directionsDisplay = new google.maps.DirectionsRenderer;
    initasaphidecalnclock()
}
function viafieldbind(a) {
    a += 1;
    autocomplete[a] = new google.maps.places.Autocomplete(document.getElementById("autocomplete" + a), {
        types: ["geocode"]
    });
    google.maps.event.addListener(autocomplete[a], "place_changed", function () {
        fillInAddress(this)
    })
}
function fillInAddress(a) {
    var c = {},
        b = autocomplete.indexOf(a);
    a = a.getPlace();
    var d = a.formatted_address;
    (new google.maps.Geocoder).geocode({
        address: d
    }, function (a, b) {
        b == google.maps.GeocoderStatus.OK ? (c.lat = a[0].geometry.location.k, c.lon = a[0].geometry.location.B) : alert("Geocode was not successful for the following reason: " + b)
    });
    c.address = a.formatted_address;
    a.address_components[5] ? c.postcode = a.address_components[5].long_name : alert("exact address not given so quote is just rough estimate");
    bookingloc[b] = c;
    calcRoute();
}
function addElement() {
    numofvia += 1;
    var a = document.getElementById("content"),
        c = document.createElement("div"),
        b = numofvia + 1;
    c.setAttribute("id", "strText" + numofvia);
    c.innerHTML = "Via " + numofvia + ": <input style='height: 25px;width: 99%;' type='text' id='autocomplete" + b + "' name='" + b + "'/ >";
    a.appendChild(c);
    viafieldbind(numofvia)
}
function removeElement() {
    if (0 !== numofvia) {
        var a = document.getElementById("strText" + numofvia);
        a.parentNode.removeChild(a);
        numofvia -= 1
        calcRoute();
    }
}
function calcRoute() {
    if ("" === document.getElementById("autocomplete").value) alert("Please input 'From'"), document.getElementById("total").innerHTML = "";
    else if ("" === document.getElementById("autocomplete1").value) document.getElementById("total").innerHTML = "";
    else if ("undefined" == typeof bookingloc[0]) document.getElementById("total").innerHTML = "";
    else if ("undefined" == typeof bookingloc[1]) document.getElementById("total").innerHTML = "";
    else {
////////////////////////////////
bookingloc[0].address=document.getElementById('autocomplete').value;
bookingloc[1].address=document.getElementById('autocomplete1').value;
for (var ki = 0; ki < numofvia; ki++) {
      var viaindexinbook=ki+2;
          var viaidme="autocomplete"+viaindexinbook;
          bookingloc[viaindexinbook].address=document.getElementById(viaidme).value; 
          
    
  }
/////////////////////////////////////
        for (var a = bookingloc[0].address, c = bookingloc[1].address, b = [], d = 0; d < numofvia; d++) b.push({
            location: bookingloc[d + 2].address,
            stopover: !0
        });
        directionsService.route({
            origin: a,
            destination: c,
            waypoints: b,
            optimizeWaypoints: !0,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (a, b) {
            b == google.maps.DirectionsStatus.OK && (directionsDisplay.setDirections(a), computeTotalDistance(directionsDisplay.getDirections()))
        })
    }
}
function computeTotalDistance(a) {
    var c = 0,
        b = 0,
        b = a.routes[0];
    for (a = 0; a < b.legs.length; a++) c += b.legs[a].distance.value;
    c = c / 1E3 * .62;
    jobmileage = b = c.toFixed(1);
    c = b * baserate;
    b > longmilestartsfrom && (c = b * longmileagerate);
    c < minfare && (c = minfare);
    b = c + 5;
    a = 1.5 * c;
    var d = 1.8 * c,
        e = "";
    switch (document.getElementById("vehicletype").selectedIndex) {
    case 0:
        e = "Cost is \u00a3" + c.toFixed(2);
        calculatedfare = c.toFixed(2);
        vehicleclass = "S";
        break;
    case 1:
        e = "Cost is \u00a3" + b.toFixed(2);
        calculatedfare = b.toFixed(2);
        vehicleclass = "E";
        break;
    case 2:
        e = "Cost is \u00a3" + d.toFixed(2);
        calculatedfare = d.toFixed(2);
        vehicleclass = "X";
        break;
    case 3:
        e = "Cost is \u00a3" + a.toFixed(2);
        calculatedfare = a.toFixed(2);
        vehicleclass = "M";
        break;
    case 4:
        e = "Cost is \u00a3" + c.toFixed(2), calculatedfare = c.toFixed(2), vehicleclass = "L"
    }
    document.getElementById("total").innerHTML = e
}
function cleanup() {
    var a = {};
    telcust = document.getElementById("telme").value;
    if ("" == telcust) alert("please put your contact and press 'Confirm' again");
    else {
        var c = telcust.replace(/\W+/g, "");
        if (7 > c.length) alert("Please Enter Telephone Number it's missing some digits and press 'Confirm' again");
        else if (0 == calculatedfare) alert("please calculate fare");
        else {
            var b = (new Date).toISOString(),
                d = Date.parse(b);
            if (!document.getElementById("myCheck").checked) {
                b = document.getElementById("metime").value;
                if ("" == b) {
                    alert("please set time");
                    return
                }
                d = document.getElementById("medate").value;
                if ("" == d) {
                    alert("please set date");
                    return
                }
                var e = d + " " + b,
                    b = (new Date(e)).toISOString(),
                    d = Date.parse(b);
                bookingloc[0] == bookingloc[1] && alert("origin cannot be same as destination");
                var e = Date.parse(e),
                    f = Date.parse(Date());
                if (0 > e - f) {
                    alert("past date n time bookings not allowed");
                    return
                }
            }
            a.datentime = d;
            b = b.split("T");
            d = b[1].split(".");
            a.date = b[0];
            a.time = d[0];
            a.tel = c;
            a.email = "";
            window.localStorage.setItem("tel", JSON.stringify(telcust));
            a.fromtovia = bookingloc;
            a.fare = calculatedfare;
            a.vehicletype = vehicleclass;
            jobref = referencegen(6, "0123456789");
            a.jobref = jobref;
            a.jobmileage = jobmileage;
            a.drvnote = drvnote;
            a.custname=document.getElementById("custname").value;
            a.account=document.getElementById("selacc").value; 	 	
            a.accuser=document.getElementById("selaccu").value; 	 	
            a.flightno=document.getElementById("flightno").value; 	 	
            a.orderno=document.getElementById("orderno").value; 
            window.localStorage.setItem("curactivebooking", JSON.stringify(a));
            createdf()
        }
    }
}
function asaphidemanual() {
    document.getElementById("myCheck").checked ? (document.getElementById("medate").style.display = "none", document.getElementById("metime").style.display = "none") : (document.getElementById("medate").style.display = "", document.getElementById("metime").style.display = "")
}
function initasaphidecalnclock() {
    document.getElementById("myCheck").checked = !0;
    document.getElementById("medate").style.display = "none";
    document.getElementById("metime").style.display = "none"
}
function myreturnfn() {
    if (document.getElementById("myreturn").checked) {
        bookingloc.reverse();
        document.getElementById("autocomplete").value = bookingloc[0].address;
        document.getElementById("autocomplete1").value = bookingloc[1].address;
        if (numofvia) for (var a = 0; a < numofvia; a++) removeElement();
        if (a = bookingloc.length - 2) for (var c = 0; c < a; c++) {
            addElement();
            var b = c + 2;
            document.getElementById("autocomplete" + b).value = bookingloc[b].address
        }
    }
}
function removedupinarray(a) {
    var c = {},
        b, d = a.length,
        e = [];
    for (b = 0; b < d; b += 1) c[a[b].address] = a[b];
    for (b in c) e.push(c[b]);
    return e
}
function referencegen(a, c) {
    for (var b = "", d = a; 0 < d; --d) b += c[Math.round(Math.random() * (c.length - 1))];
    return b
}
function resetme() {
    if(metableCLI!=undefined)
    {metableCLI.fnClearTable();}
    bookingloc = [];
    localStorage.clear();
    document.getElementById("autocomplete").value = "";
    document.getElementById("autocomplete1").value = "";
    document.getElementById("telme").value = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("custname").value= "";
    document.getElementById("flightno").value= ""; 
    document.getElementById("orderno").value= ""; 
    for (var a = numofvia; a;) removeElement(), a--;
    drvnote = ""
}
function manualfare() {
    0 != calculatedfare && (calculatedfare = prompt("Please enter manual fare"), document.getElementById("total").innerHTML = calculatedfare)
}
function noteme() {
    drvnote = prompt("Please Enter Driver's Note")
};