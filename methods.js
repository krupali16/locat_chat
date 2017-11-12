function click(elementId,fn){
  var element=document.getElementById(elementId);
  if(element){
    element.addEventListener("click",fn);
  }
}

function loginWithGoogle(){

  var database = firebase.database();
  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider).then(function(result) {
  var user = result.user;
  var displayName = user.displayName;
  var uuid = user.uid;
  var email = user.email;
  
  var usersRef=database.ref('/users');

  usersRef.once('value',function(snapshot){
    
   if (!snapshot.hasChild(uuid)) {
      
      var username = prompt("Please enter your Display Name");
      var gender = prompt("Please enter your Gender");
      var birth_date = prompt("Please enter your Birth date");      

      if (username != null && gender != null && birth_date != null) {
          
           var user={
              username: username,
              gender: gender,
              birth_date: birth_date,
              email: "",
              id: "",
              name: ""
            }

            usersRef.child(uuid).set(user);
      }
   }

   createUser(uuid, displayName, email); 

  });
  
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
  var database = firebase.database();
  var usersRef=database.ref("users");

  usersRef.child(uid).update({ id: uid, name: uname, email: uemail });
  redirect("chats.html");
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
}


function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function joinGroup(id, group_name)
{

  // var user = firebase.auth().currentUser;

  // var memb = user.uid;
  
  // var obj = {[memb]:true};
  // var grpRef = firebase.database().ref('/groups/'+id+'/members');
  // grpRef.update(obj);

  // var userRef = firebase.database().ref('/users/'+memb+'/groups');
  // var obj = {[id]:true};
  // userRef.update(obj);

  // localStorage.setItem("group", id+","+group_name);
  
  //  redirect("group.html");

  getJoinedGroups()

}

function getJoinedGroups()
{
  var user = firebase.auth().currentUser;
  var memb = user.uid;

  var arr = [];
  var database = firebase.database();
  var grpRef = database.ref('/users/'+memb+'/groups');
  
  grpRef.on('value',function(snapshot){
  var num_groups = snapshot.numChildren();
    var allgroups=[];
    var groups=snapshot.val();
    for(var gid in groups){

      var Ref = database.ref('/groups/'+gid);     

      Ref.on('value',function(snapshot){

         var data = snapshot.val();
         allgroups.push(data);
      });

    }
    for(let i in allgroups)
    {
       var newRef = database.ref('/messages/'+allgroups[i].group_id+'/message').orderByChild('timestamp').limitToLast(1);
       let grp_name = allgroups[i].name;
       newRef.on('value',function(snapshot){
          var msgs = snapshot.val();
          var last_msg = msgs[Object.keys(msgs)[0]].message;
          var sender_id = msgs[Object.keys(msgs)[0]].sender_id;

          var users = database.ref('/users/'+sender_id+'/username');
          
          users.on('value',function(snapshot){

                var details={
                  group_name: grp_name,
                  last_message:last_msg,
                  sender_id: sender_id,
                  sender_name: snapshot.val()                  
                }

                arr.push(details);

              });
        });

    }
  });
  
    console.log(arr);
}

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
  var grpRef = firebase.database().ref('/messages/'+res[0]+'/message');
  var msgid = firebase.database().ref('/messages/'+res[0]+'/message').push().key;
  var msg = document.getElementById("txt_msg").value;

  var message={
      message_id: msgid,
      sender_id: user.uid,
      message: msg,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    }

    grpRef.child(msgid).set(message);
    var msg = document.getElementById("txt_msg").value="";

    var ref = firebase.database().ref("messages/"+res[0]+"/message");

}

function loadMsgs(grp_id, fn)
{
  var database=firebase.database();
  var chatsRef=database.ref('/messages/'+grp_id+'/message');

  chatsRef.on('child_added',function(snapshot){
    var messages=snapshot.val();
    fn(messages);
  });
}

function renderMessage(messages){
  return messages['message'];
}