var bookingref, userid, metable, dataSet = [],
    firstime = 0,
    myjson = {},
    netstatus, controllerque, myobj, S = ["S", "L"],
    E = ["S", "E"],
    M = ["S", "E", "M"],
    X = ["X", "S"],
    L = ["S", "L"],
    filterstr = "flag=0",
    timeval, officename;
window.app = {};
document.addEventListener("apiReady", checkSession, !0);
window.addEventListener("offline", function (a) {
    document.getElementById("networkconnectivity").innerHTML = "NETWORK:OFFLINE <br>";
    netstatus = !1
}, !1);
window.addEventListener("online", function (a) {
    document.getElementById("networkconnectivity").innerHTML = "NETWORK:ONLINE<br>";
    netstatus = !0
}, !1);

function checkSession() {
    iky();
    window.df.apis.user.getSession({
        body: {}
    }, function (a) {
        a.session_id = JSON.parse(sessionStorage.getItem("dfsess"));
        userid = JSON.parse(sessionStorage.getItem("dfuser"));
        officename = JSON.parse(sessionStorage.getItem("dfoffice"));
        null === a.session_id || "" == a.session_id ? (document.getElementById("login").style.display = "", logIn()) : (a = new ApiKeyAuthorization("X-Dreamfactory-Session-Token", a.session_id, "header"), window.authorizations.add("X-DreamFactory-Session-Token", a), document.getElementById("login").style.display = "none", document.getElementById("menumain").style.display = "block", document.getElementById("que").style.display = "block",document.getElementById("jobinfo").style.display = "block",document.getElementById("deptchtxt").style.display = "block", document.getElementById("topmenu").style.display = "block", document.getElementById("loginbg").style.cssText = "", document.getElementById("loginmain").style.display = "none", alert("Welcome back"),document.getElementById("officename").innerHTML=officename,document.getElementById("userid").innerHTML=userid, mysocketinit(), runApp())
    }, function (a) {
        document.getElementById("login").style.display = "";
        document.getElementById("boldStuff").innerHTML = "Please Login!";
        logIn()
    })
}

function runApp() {
    getRecords()
}

function getRecords() {
    var a = (new Date).toISOString(),
        a = Date.parse(a) + timeval;
    filterstr = 0 < timeval ? "flag=0 AND datentime<=" + a : "flag=0";
    window.df.apis.localmongo.getRecordsByFilter({
        table_name: "scarscollection",
        filter: filterstr
    }, function (a) {
        buildItemList(a)
    }, crudError)
}

function createRecord() {
    var a = $("#itemname").val();
    "" !== a && df.apis.localmongo.createRecords({
        table_name: "scarscollection",
        body: {
            record: [{
                name: a,
                complete: !1
            }]
        }
    }, function (a) {
        $("#itemname").val("");
        getRecords()
    }, crudError)
}

function updateRecord(a, c) {
    df.apis.localmongo.updateRecords({
        table_name: "scarscollection",
        body: {
            record: [{
                _id: a,
                complete: c
            }]
        }
    }, function (a) {
        getRecords()
    }, crudError)
}

function deleteRecord(a) {
    df.apis.localmongo.deleteRecords({
        table_name: "scarscollection",
        ids: a
    }, function (a) {
        getRecords()
    }, crudError)
}

function buildItemList(a) {
    var autolwdespatch = [];
    myjson = a;
    dataSet = [];
    0 < a.record.length && a.record.forEach(function (a) {
        var b = [];
        var entryarr = [];
        currentdatetime = (new Date).toISOString();
        currentdatetimeparse = Date.parse(currentdatetime);
        b.push(a.datentime - 3E5 - currentdatetimeparse);
        entryarr.push(a.datentime - 3E5 - currentdatetimeparse);
        b.push(a.date);
        b.push(a.time);
        b.push(a.curstatus);
        b.push(a.jobref);
        b.push(a.fromtovia[0].address);
        b.push(a.fromtovia[1].address);
        b.push(a.vehicletype);
        b.push(a.fare);
        b.push(a.tel);
        b.push(a.email);
        b.push(a.jobmileage);
        b.push(a.drvnote);
        b.push(a._id);
        b.push(a.custname);
        b.push(a.account); 	 	
        b.push(a.accuser); 	 	
        b.push(a.flightno); 	 	
        b.push(a.orderno); 
        if(a.hold==undefined){b.push("false");}else{b.push(a.hold);}
        entryarr.push(a._id);
        entryarr.push(a.hold);
        autolwdespatch.push(entryarr);
        dataSet.push(b)
    });
    if (autolwdespatch.length > 0) {
        autolwdespatch = autolwdespatch.sort(function (a, b) {
            return a[0] > b[0];
        });
        if (document.getElementById("myonoffswitch").checked) {
            autolwdespatch.forEach(function (entry) {
                if (entry[2]=="true") {return;}  
                if (entry[0] < 0) {
                    bookingref = entry[1];
                    myjson.record.forEach(function (a) {
                        a._id === bookingref && (myobj = a)
                    });
                    despatchmelw();
                }
            });
        }
    }
    firstime ? (metable.fnClearTable(), dataSet.length && metable.fnAddData(dataSet)) : (metable = $("#example").dataTable({
        dom: 'TC<"clear">lfrtip',
        tableTools: {
            sRowSelect: "single",
            sSwfPath: "../swf/copy_csv_xls_pdf.swf"
        },
        colReorder: {
            realtime: !0
        },
        data: dataSet,
        columns: [{
            title: "Time2Despatch"
        }, {
            title: "Date"
        }, {
            title: "Time"
        }, {
            title: "Status"
        }, {
            title: "Jobref"
        }, {
            title: "From"
        }, {
            title: "To"
        }, {
            title: "Vehicle"
        }, {
            title: "Fare"
        }, {
            title: "Tel"
        }, {
            title: "Email"
        }, {
            title: "Jobmileage"
        }, {
            title: "DrvNote"
        }, {
            title: "DBhash"
        }, {
            title: "CustName"
        }, {
            title: "Account" 	 	
        }, { 	 	
            title: "AccUser" 	 	
        }, { 	 	
            title: "flightno" 	 	
        }, { 	 	
            title: "orderno" 	 	
        }, { 
            title: "Hold"
        }],
        aoColumnDefs: [{
            aTargets: [3],
            fnCreatedCell: function (a, b, d, e, f) {
                "rejected" != b && "reverted" != b || $(a).css("background-color", "red")
            }
        }, 
{     aTargets: [0,4,8,9,10,11,12,13,14,15,16,17,18], bVisible: false},
{
            aTargets: [0],
            fnCreatedCell: function (a, b, d, e, f) {
                0 >= b && $(a).css("background-color", "red")
            }
        }]
    }), firstime += 1, setInterval(getRecords, 3E4))

////////
$('#example tbody').on('click', 'tr', function () {
        selectval();
        document.getElementById("accountinfo").innerHTML=myobj.account;
        document.getElementById("bookinfo").innerHTML=myobj.jobref;
        document.getElementById("comtinfo").innerHTML=myobj.drvnote;
        document.getElementById("custinfo").innerHTML="&pound"+myobj.fare;
        document.getElementById("drvinfo").innerHTML="&pound"+myobj.fare;
        document.getElementById("bkedbyinfo").innerHTML=myobj.accuser;
        document.getElementById("ordinfo").innerHTML=myobj.orderno;
        document.getElementById("telnoinfo").innerHTML=myobj.tel;
        document.getElementById("flightnoinfo").innerHTML=myobj.flightno;
        var numofvia = (myobj.fromtovia.length) - 2;
        if (numofvia) 
        {
        document.getElementById("viainfo").innerHTML = myobj.fromtovia[2].address;
        
        }
        else { document.getElementById("viainfo").innerHTML ="";}
    } );
//////
}

function getErrorString(a) {
    var c = "An error occurred, but the server provided no additional information.";
    a.content && a.content.data && a.content.data.error && (c = a.content.data.error[0].message);
    return c = c.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").replace(/&apos;/g, "'")
}

function crudError(a) {
    401 == a.status || 403 == a.status ? logIn() : alert(getErrorString(a))
}

function logIn() {
    var a = document.getElementById("UserEmail").value,
        c = document.getElementById("Password").value;
    a && c && window.df.user.login({
        body: {
            email: a,
            password: c
        }
    }, function (a) {
        var c = new ApiKeyAuthorization("X-Dreamfactory-Session-Token", a.session_id, "header");
        window.authorizations.add("X-DreamFactory-Session-Token", c);
        userid = a.email;
        officename = a.last_name;
        document.getElementById("login").style.display = "none";
        document.getElementById("menumain").style.display = "block";
        document.getElementById("jobinfo").style.display = "block";
        document.getElementById("deptchtxt").style.display = "block";
        document.getElementById("que").style.display = "block";
        document.getElementById("topmenu").style.display = "block";
        document.getElementById("loginbg").style.cssText = "";
        document.getElementById("loginmain").style.display = "none";
        alert("Welcome you are now logged in");
       // document.getElementById("boldStuff").innerHTML = userid + "_" + officename;
       document.getElementById("officename").innerHTML=officename;
       document.getElementById("userid").innerHTML=userid;
        mysocketinit();
        runApp()
    }, function (a) {
        alert("Error getting session")
    })
}

function selectval() {
    bookingref = $("#example").DataTable().row(".selected").data()[13];
    myjson.record.forEach(function (a) {
        a._id === bookingref && (myobj = a)
    })
}

function despatchme() {
    var a;
    if (controllerque.drvclr.length) if (selectval(), a = controllerque.drvclr[0].split("@"), legit(a[2], myobj.vehicletype)) a = controllerque.drvclr[0], audit(a, "despatched", 1), myjson.record.forEach(function (a) {
        a._id === bookingref && (myobj = a)
    }), socket.emit("sendjobcon", myobj);
    else {
        var c = controllerque.drvclr,
            b = 0;
        c.forEach(function (a) {
            var e = a.split("@");
            legit(e[2], myobj.vehicletype) && (b = c.indexOf(a))
        });
        b ? (bumpup(b), a = controllerque.drvclr[b], audit(a, "despatched", 1), myjson.record.forEach(function (a) {
            a._id === bookingref && (myobj = a)
        }), socket.emit("sendjobcon", myobj), alert("Vehicle inadequate , found other driver in the queue despatching him")) : alert("No Driver in queue for the requested vehicle")
    } else alert("No Driver Available");
    myobj = []
}

function legit(a, c) {
    var b = !1;
    switch (a) {
    case "S":
    case "L":
        0 <= S.indexOf(c) && (b = !0);
        break;
    case "E":
        0 <= E.indexOf(c) && (b = !0);
        break;
    case "M":
        0 <= M.indexOf(c) && (b = !0);
        break;
    case "X":
        0 === X.indexOf(c) && (b = !0);
        break;
    default:
        alert("Please report this incident to Technical Team")
    }
    return b
}

function ManualD(mydiv) {
    var a = mydiv.id;
    selectval();
    var c = a.split("@");
    legit(c[2], myobj.vehicletype) && (audit(a, "despatched", 1), myjson.record.forEach(function (a) {
        a._id === bookingref && (myobj = a)
    }), socket.emit("sendjobcon", myobj), myobj = [])
}

function AutoD() {
    despatchme()
}
var socket;

function mysocketinit() {
    socket = io.connect("http://88.150.139.154:4000");
    socket.on("connect", addUser);
    socket.on("updateChat", proceesMessage);
    socket.on("updateUsers", updateUserList);
    socket.on("drvstat", drvque);
    socket.on("officeassist", function (a) {
        document.getElementById("emergencycomm").innerHTML = a + "=>requesting office assistance"
    });
    socket.on("emergency", function (a) {
        document.getElementById("emergencycomm").innerHTML = a + "=>got emergency"
    });
    socket.emit("actualloc", function (a) {
        document.getElementById("jobupdates").innerHTML = "actualloc=>" + a[driverinfo] + "jobid" + a[jobid] + "state" + a[drvstate]
    });
    socket.emit("jobchange", function (a) {
        document.getElementById("jobupdates").innerHTML = "jobchange=>" + a[driverinfo] + "jobid" + a[jobid] + "state" + a[drvstate]
    });
    $("#dataSend").click(sendMessage);
    $("#data").keypress(processEnterPress)
}

function processEnterPress(a) {
    13 == a.which && (a.preventDefault(), $(this).blur(), $("#dataSend").focus().click())
}

function addUser() {
    socket.emit("addUser", userid)
}

function sendMessage() {
    var a = $("#data").val();
    socket.emit("sendChat", a);
    $("#data").val("");
    $("#data").focus()
}

function proceesMessage(a, c) {
    $("<b>" + a + ":</b>" + c + "<br/>").insertAfter($("#conversation"))
}

function updateUserList(a) {
    $("#users").empty();
    $.each(a, function (a, b) {
        $("#users").append("<div>" + a + "</div>")
    })
}

function drvque(a) {
    controllerque = a;
    var c = a.drvclr,
        b = "";
    0 < c.length && c.forEach(function (a) {
        z = a;
        a = a.split("@");
        b += "<td id='queborder'><div onclick='ManualD(this)' id=" + z + " class='idv'>" + a[0] + "<br>" + a[2] + "<br></div>" + a[1] + "</td>"
    });
    a = a.drvengag;
    var d = "";
    0 < a.length && a.forEach(function (a) {
        a = a.split("@");
        d += "<td id='queborder'><div class='idv'>" + a[0] + "<br>" + a[2] + "<br></div>" + a[1] + "</td>"
    });
    document.getElementById("que").innerHTML = "<div class='lonwat'>Longest Waiting::</div><table id='tdrvclr'><tr>" + b + "</tr></table>";
    document.getElementById("que").innerHTML += "<div class='engaged'>Engaged::</div><table id='tdrveng'><tr>" + d + "</tr></table>";
    0 < c.length && (document.getElementById("tdrvclr").style.display = "block");
    0 < a.length && (document.getElementById("tdrveng").style.display = "block")
}

function bumpup(a) {
    socket.emit("bumpup", a)
}

function canceljob() {
    var cancelreason = prompt("Please enter reason for cancellation");
    var totcancel = "cancelled_" + cancelreason;
    audit("n/a", totcancel, 1);
}

function audit(a, c, b) {
    selectval();
    var d = [],
        e = (new Date).toISOString();
    d.push(e);
    d.push(c);
    d.push(userid);
    d.push(a);
    a = [];
    myobj.logc && a.push(myobj.logc);
    a.push(d);
    df.apis.localmongo.updateRecords({
        table_name: "scarscollection",
        body: {
            record: [{
                _id: bookingref,
                logc: a,
                flag: b,
                curstatus: c
            }]
        }
    }, function (a) {
        getRecords()
    }, crudError);
    myobj = []
}

function timehash() {
    switch (document.getElementById("timeahead").selectedIndex) {
    case 0:
        timeval = 9E5;
        break;
    case 1:
        timeval = 18E5;
        break;
    case 2:
        timeval = 27E5;
        break;
    case 3:
        timeval = 0
    }
    getRecords()
};

function despatchmelw() {
    var driveridalloc;
    if (controllerque == undefined) {
        return;
    }
    if (controllerque.drvclr.length) {
        var vehiclechk = controllerque.drvclr[0].split("@");
        if (legit(vehiclechk[2], myobj["vehicletype"])) {
            driveridalloc = controllerque.drvclr[0];
            auditdlw(driveridalloc, "despatched", 1);
            myjson.record.forEach(function (entry) {
                if (entry["_id"] === bookingref) {
                    myobj = entry;
                    return;
                }
            });
            socket.emit('sendjobcon', myobj);
        } else {
            var searchbuff = controllerque.drvclr;
            var nextvmatch = 0;
            searchbuff.forEach(function (entry) {
                var eachdrv = entry.split("@");
                if (legit(eachdrv[2], myobj["vehicletype"])) {
                    nextvmatch = searchbuff.indexOf(entry);
                    return;
                }
            });
            if (nextvmatch) {
                bumpup(nextvmatch);
                driveridalloc = controllerque.drvclr[nextvmatch];
                auditdlw(driveridalloc, "despatched", 1);
                myjson.record.forEach(function (entry) {
                    if (entry["_id"] === bookingref) {
                        myobj = entry;
                        return;
                    }
                });
                socket.emit('sendjobcon', myobj);
                alert("Vehicle inadequate , found other driver in the queue despatching him");
            } else {
                alert("No Driver in queue for the requested vehicle")
            }
        }
    } else {
        console.log("No Driver Available");
    }
    myobj = [];
}

function auditdlw(a, c, b) {
    var d = [],
        e = (new Date).toISOString();
    d.push(e);
    d.push(c);
    d.push("autodlw");
    d.push(a);
    a = [];
    myobj.logc && a.push(myobj.logc);
    a.push(d);
    df.apis.localmongo.updateRecords({
        table_name: "scarscollection",
        body: {
            record: [{
                _id: bookingref,
                logc: a,
                flag: b,
                curstatus: c
            }]
        }
    }, function (a) {
        getRecords()
    }, crudError);
    myobj = []
}

var popupStatus = 0;
var isedit = 0;
$(document).ready(function () {
    document.getElementById("myonoffswitch").checked = false;
    document.getElementById("myoonoffswitch").checked = false;
    $('#myonoffswitch').on("click", function () {
        document.getElementById("myoonoffswitch").checked = false;
    });
    $('#myoonoffswitch').on("click", function () {
        document.getElementById("myonoffswitch").checked = false;
    });
    $("#Login_PopUp_Link,#Login_PopUp_Link1").click(function () {
        if (this.id == "Login_PopUp_Link1") {
            isedit = 1;
            editme();
        } else {
            isedit = 0;
            document.getElementById("telme").readOnly = false;
            $('#telme').on('keyup', function () {
                getRecordsCLI();
            });
        }
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        var popupHeight = $("#popupLogin").height();
        var popupWidth = $("#popupLogin").width();
        $("#popupLogin").css({
            "position": "absolute",
            "top": windowHeight / 2 - popupHeight / 2,
            "left": windowWidth / 2 - popupWidth / 2
        });
        $("#LoginBackgroundPopup").css({
            "height": windowHeight
        });
        if (popupStatus == 0) {
            $("#LoginBackgroundPopup").css({
                "opacity": "0.7"
            });
            $("#LoginBackgroundPopup").fadeIn("slow");
            $("#popupLogin").fadeIn("slow");
            popupStatus = 1;
        }
    });
    $("#popupLoginClose").click(function () {
        if (popupStatus == 1) {
            $("#LoginBackgroundPopup").fadeOut("slow");
            $("#popupLogin").fadeOut("slow");
            popupStatus = 0;
        }
    });
});

////////////////////logic for holding from autodespatch
function holdme(){
selectval();
var itemh = {"record":[{"_id":bookingref, "hold":"true"} ]};//prep record 
    df.apis.localmongo.updateRecords({"table_name":"scarscollection", "body":itemh}, function (response) {
        getRecords();
    }, crudError
    );
}
////////////////////////
function holdoff(){
selectval();
var itemh = {"record":[{"_id":bookingref, "hold":"false"} ]};//prep record 
    df.apis.localmongo.updateRecords({"table_name":"scarscollection", "body":itemh}, function (response) {
        getRecords();
    }, crudError
    );
}