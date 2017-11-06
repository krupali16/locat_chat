function click(elementId,fn){
  var element=document.getElementById(elementId);
  if(element){
    element.addEventListener("click",fn);
  }
}

function loginWithGoogle(){
  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider).then(function(result) {
    console.log(result);
  var user = result.user;
  
  createUser(user.uid,user.displayName,user.email);
  // ...
}).catch(function(error) {
  console.log(error.message);
});
}

function ifUserIsLoggedIn(){
  
firebase.auth().onAuthStateChanged(function(user) {
  
  if (user) {
    window.currentUser={
      id: user.uid,
      name: user.displayName,
      email: user.email
    };
  } else {
  }
});
}

function logInUser(){
  loginWithGoogle();
}

function redirect(path) {
  window.location=path;
  return false;
}

function getElement(id){
  return document.getElementById(id);
}

function createUser(uid, uname, uemail)
{
  // Get a reference to the database service
  var database = firebase.database();

  var usersRef=database.ref("users");

  var user={
    id: uid,
    name:uname,
    email: uemail
  }

  usersRef.child(uid).set(user).then(function(){
   // redirect("chats.html");
  });
}

function createGroup()
{
  var database = firebase.database();
  var user = firebase.auth().currentUser;

    var group_name = document.getElementById("txt_grpName").value;  
    var radius = document.getElementById("txt_radius").value;    
    
    var group_id = database.ref("groups").push().key;
    var groupsRef=database.ref("groups");

     if (!navigator.geolocation){
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }

    function success(position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;      
      alert(longitude+" "+latitude);
      var group={
        group_id: group_id,
        name:group_name,
        admin: user.uid,
        latitude: latitude.toFixed(7),
        longitude: longitude.toFixed(7),
        radius: parseInt(radius),
        members:""
        //admin: window.currentUser.id
      }
    
       groupsRef.child(group_id).set(group);     

       document.getElementById("txt_grpName").value = "";  
    }

    function error() {
      output.innerHTML = "Unable to retrieve your location";
    }

    navigator.geolocation.getCurrentPosition(success, error);


     /*var output = document.getElementById('test');
    if (!navigator.geolocation){
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }

    function success(position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;


      //function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(latitude-23.181469);  // deg2rad below
  var dLon = deg2rad(longitude-72.566281); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(23.181469)) * Math.cos(deg2rad(latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  
//}
      output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>' + d;
    }

    function error() {
      output.innerHTML = "Unable to retrieve your location";
    }

    output.innerHTML = "<p>Locating…</p>";*/
}


function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function joinGroup(id, group_name)
{

  var user = firebase.auth().currentUser;

  var memb = user.uid;
  
  var obj = {[memb]:true};

  var grpRef = firebase.database().ref('/groups/'+id+'/members');
  
  grpRef.update(obj);

  localStorage.setItem("group", id+","+group_name);
  
  redirect("group.html");

}

// function fetchGroups()
// {
//   document.getElementById("groups").innerHTML = "";
//   var database=firebase.database();
  
//   var groupRef=database.ref("groups");
  
//   groupRef.on('value',function(snapshot){

//     var groups=snapshot.val();
    
//     for(var gid in groups){

//       var group = groups[gid];

//       var newlabel = document.createElement("Button");
      
//       newlabel.innerHTML = group.name;
    
//       newlabel.setAttribute("id", group.group_id);
//       newlabel.setAttribute("name", group.name);

//       newlabel.onclick = function(){
//         joinGroup(this.id, this.name); 
//       }

//       document.getElementById("groups").appendChild(newlabel);
//     }

//   });
// }

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function fetchGroups()
{
  var database=firebase.database();
  document.getElementById("groups").innerHTML = "";


   function success(position) {
      var latitude1  = position.coords.latitude;
      var longitude1 = position.coords.longitude;      

       var groupRef=database.ref("groups");
  
  groupRef.on('value',function(snapshot){

    var groups=snapshot.val();
    
    for(var gid in groups){

      var group = groups[gid];
      var latitude2 = group.latitude;
      var longitude2 = group.longitude;
      var radius = group.radius;
      // latitude2 = 23.229358;
      // longitude2 = 72.673874;  //5.5 km

      // latitude2 = 23.201205;
      // longitude2 = 72.665915;  //3.5 km

      var dist = getDistanceFromLatLonInKm(latitude1,longitude1,latitude2,longitude2);

      if(dist <= radius){

        var newlabel = document.createElement("Button");
        
        newlabel.innerHTML = group.name;
      
        newlabel.setAttribute("id", group.group_id);
        newlabel.setAttribute("name", group.name);

        newlabel.onclick = function(){
          joinGroup(this.id, this.name); 
        }

        document.getElementById("groups").appendChild(newlabel);
      }
    }

  });

    }

    function error() {
      output.innerHTML = "Unable to retrieve your location";
      
    }

    navigator.geolocation.getCurrentPosition(success, error);

}

function sendMsg()
{
  document.getElementById("msgs").innerHTML="";
  var user = firebase.auth().currentUser;
  var res = localStorage.getItem("group").split(",");
  var grpRef = firebase.database().ref('/groups/'+res[0]+'/messages');
  var msgid = firebase.database().ref('/groups/'+res[0]+'/messages').push().key;
  var msg = document.getElementById("txt_msg").value;
  
  var message={
      message_id: msgid,
      sender_id: user.uid,
      message: msg
    }

    grpRef.child(msgid).set(message);
    var msg = document.getElementById("txt_msg").value="";
    console.log('sendmsg');
}

function loadMsgs(grp_id, fn)
{
  var database=firebase.database();
  var chatsRef=database.ref('/groups/'+grp_id+'/messages');

  chatsRef.on('child_added',function(snapshot){
    var messages=snapshot.val();
    fn(messages);
    //console.log(messages);
  });

  // chatsRef.on('value',function(snapshot){
  //   var messages=snapshot.val();

  //   for(var mid in messages) {
  //       var msg = messages[mid];

  //       var newlabel = document.createElement("Label");
  //       newlabel.innerHTML = msg.message;  
  //       document.getElementById("msgs").appendChild(newlabel);      
  //       linebreak = document.createElement("br");
  //       document.getElementById("msgs").appendChild(linebreak);      
  //   }
  //   console.log('loadmsg');    
  // });
}

function renderMessage(messages){
  //var text=messages.message;
  console.log(messages);
  return messages['message'];
  //return messages.message;
  // var msgClass="message";

  // if(message.sender_id == window.currentUser.id){
  //   msgClass="message by-user";
  // }

  // var html='<div class="'+msgClass+'">' + text + '</div>';
  // return html;
}