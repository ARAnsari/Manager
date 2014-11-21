var bookingref;
var userid;
var metable;
var dataSet = [];
var firstime = 0;
var myjson = {};
var jobcontent = {};
var netstatus;
var myobj;
var officename;
window.app = {};
document.addEventListener('apiReady', checkSession, true);
window.addEventListener("offline", function(e) {
    document.getElementById('networkconnectivity').innerHTML = "NETWORK:OFFLINE <br>";
    netstatus = false;
}, false);
window.addEventListener("online", function(e) {
    document.getElementById('networkconnectivity').innerHTML = "NETWORK:ONLINE<br>";
    netstatus = true;
}, false);
function checkSession() {
    iky();
    window.df.apis.user.getSession({"body": {}}, function(response) {
        response.session_id = JSON.parse(sessionStorage.getItem("dfsess"));
        userid = JSON.parse(sessionStorage.getItem("dfuser"));
        officename = JSON.parse(sessionStorage.getItem("dfoffice"));
        if (response.session_id === null || response.session_id == "") {
            document.getElementById("login").style.display = "";
            logIn();
        } else 
        {
            var session = new ApiKeyAuthorization("X-Dreamfactory-Session-Token", response.session_id, 'header');
            window.authorizations.add("X-DreamFactory-Session-Token", session);
            document.getElementById("login").style.display = "none";
            document.getElementById("loginmain").style.display = "none";
            document.getElementById("loginbg").style.cssText = "";
            document.getElementById("auditmain").style.display = "block";
            document.getElementById("jobinfo").style.display = "block";
            document.getElementById('boldStuff').innerHTML = userid + "_" + officename;
            alert("Welcome back");
            runApp();
        }
    }, function(response) {
        document.getElementById("login").style.display = "";
        document.getElementById('boldStuff').innerHTML = "Please Login!";
        logIn();
    });
}
function runApp() {
    getRecords();
}
function getRecords() {
    json = JSON.stringify({"flag": 2});
    window.df.apis.localmongo.getRecordsByFilter({"table_name": "scarscollection",filter: json}, function(response) {
        buildItemList(response);
    }, crudError);
}
function updateRecord(id, complete) {
    var item = {"record": [{"_id": id,"complete": complete}]};
    df.apis.localmongo.updateRecords({"table_name": "scarscollection","body": item}, function(response) {
        getRecords();
    }, crudError);
}
function buildItemList(json) {
    myjson = json;
    dataSet = [];
    if (json.record.length > 0) {
        json.record.forEach(function(entry) {
            var formatter = [];
            formatter.push(entry["date"]);
            formatter.push(entry["time"]);
            formatter.push(entry["curstatus"]);
            formatter.push(entry["jobref"]);
            formatter.push(entry["fromtovia"][0].address);
            formatter.push(entry["fromtovia"][1].address);
            formatter.push(entry["vehicletype"]);
            formatter.push(entry["fare"]);
            formatter.push(entry["tel"]);
            formatter.push(entry["email"]);
            formatter.push(entry["jobmileage"]);
            formatter.push(entry["drvnote"]);
            formatter.push(entry["_id"]);
            formatter.push(entry["custname"]);
            formatter.push(entry.account); 	 	
            formatter.push(entry.accuser); 	 	
            formatter.push(entry.flightno);
            formatter.push(entry.orderno); 
            dataSet.push(formatter);
        });
    }
    if (!firstime) {
        metable = $('#example').dataTable({"dom": 'TC<"clear">lfrtip',tableTools: {"sRowSelect": "single","sSwfPath": "../swf/copy_csv_xls_pdf.swf"},colReorder: {realtime: true},"data": dataSet,"columns": [{"title": "Date"}, {"title": "Time"}, {"title": "Status"}, {"title": "Jobref"}, {"title": "From"}, {"title": "To"}, {"title": "Vehicle Type"}, {"title": "Fare"}, {"title": "Tel"}, {"title": "Email"}, {"title": "Jobmileage"}, {"title": "DrvNote"}, {"title": "DBhash"}, {"title": "CustName"},
             { 	 	
                "title": "Account" 	 	
            }, { 	 	
                "title": "AccUser" 	 	
            }, { 	 	
                "title": "flightno" 	 	
            }, { 	 	
                "title": "orderno" }],"aoColumnDefs": [{"aTargets": [2],"fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                        if (sData == "runner" || sData == "noshow" || (sData.search("cancelled") != -1)) {
                            $(nTd).css('background-color', 'red');
                        }
                        if (sData == "completed") {
                            $(nTd).css('background-color', 'blue');
                        }
                    }},{aTargets: [3,7,8,9,10,11,12,13,14,15,16,17], bVisible: false}]});
        firstime += 1;
        setInterval(getRecords, 30000);
    } 
    else {
        metable.fnClearTable();
        if (dataSet.length) {
            metable.fnAddData(dataSet);
        }
    }
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
function getErrorString(response) {
    var msg = "An error occurred, but the server provided no additional information.";
    if (response.content && response.content.data && response.content.data.error) {
        msg = response.content.data.error[0].message;
    }
    msg = msg.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&apos;/g, '\'');
    return msg;
}
function crudError(response) {
    if (response.status == 401 || response.status == 403) {
        logIn();
    } else {
        alert(getErrorString(response));
    }
}
function logIn() {
    var email = document.getElementById('UserEmail').value;
    var pw = document.getElementById('Password').value;
    if (!email || !pw) {
        return;
    }
    var body = {"email": email,"password": pw};
    window.df.user.login({"body": body}, function(response) {
        var session = new ApiKeyAuthorization("X-Dreamfactory-Session-Token", response.session_id, 'header');
        window.authorizations.add("X-DreamFactory-Session-Token", session);
        userid = response.email;
        officename = response.last_name;
        document.getElementById("login").style.display = "none";
        document.getElementById("loginmain").style.display = "none";
        document.getElementById("loginbg").style.cssText = "";
        document.getElementById("auditmain").style.display = "block";
        document.getElementById("jobinfo").style.display = "block";
        alert("Welcome you are now logged in");
        document.getElementById('boldStuff').innerHTML = userid + "_" + officename;
        mysocketinit();
        runApp();
    }, function(response) {
        alert("Error getting session");
    });
}
function selectval() 
{
    var rowval = $('#example').DataTable().row(".selected").data();
    bookingref = rowval[12];
    myjson.record.forEach(function(entry) {
        if (entry["_id"] === bookingref) {
            myobj = entry;
            return;
        }
    });
}
var socket;
function mysocketinit() {
    socket = io.connect("http://88.150.139.154:4000");
    socket.on('connect', addUser);
    socket.on('updateChat', proceesMessage);
    socket.on('updateUsers', updateUserList);
    $('#dataSend').click(sendMessage);
    $('#data').keypress(processEnterPress);
}
function processEnterPress(e) {
    if (e.which == 13) {
        e.preventDefault();
        $(this).blur();
        $('#dataSend').focus().click();
    }
}
function addUser() {
    socket.emit('addUser', userid);
}
function sendMessage() {
    var message = $('#data').val();
    socket.emit('sendChat', message);
    $('#data').val('');
    $('#data').focus();
}
function proceesMessage(username, data) {
    $('<b>' + username + ':</b>' + data + '<br/>').insertAfter($('#conversation'));
}
function updateUserList(userNames) {
    $('#users').empty();
    $.each(userNames, function(key, value) {
        $('#users').append('<div>' + key + '</div>');
    })
}
function ViewAudit() 
{
    selectval();
    document.getElementById("audit").innerHTML = "<pre>" + JSON.stringify(myobj, null, 4) + "</pre>";
}
function closejob() 
{
    audit("n/a", "closed", 2);
}
