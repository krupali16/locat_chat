function click(elementId,fn){
  var element=document.getElementById(elementId);
  if(element){
    element.addEventListener("click",fn);
  }
}

function loginWithGoogle(){
  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider).then(function(result) {
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
    redirect("chats.html");
  });
}

function createGroup()
{
	//ifUserIsLoggedIn();
	//alert(window.currentUser.id);
  alert();
	var user = firebase.auth().currentUser;

	  var group_name = document.getElementById("txt_grpName").value;
	  var database = firebase.database();

	  var groupsRef=database.ref("groups");
	  var group_id = database.ref("groups").push().key;
	  var group={
	    group_id: group_id,
	    name:group_name,
	    admin: user.uid,
      members:""
	    //admin: window.currentUser.id
	  }

	  groupsRef.child(group_id).set(group);
 
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

function fetchGroups()
{
  var database=firebase.database();
  
  var groupRef=database.ref("groups");
  
  groupRef.on('value',function(snapshot){

    var groups=snapshot.val();
    
    for(var gid in groups){

      var group = groups[gid];

      var newlabel = document.createElement("Button");
      
      newlabel.innerHTML = group.name;
    
      newlabel.setAttribute("id", group.group_id);
      newlabel.setAttribute("name", group.name);

      newlabel.onclick = function(){
        joinGroup(this.id, this.name); 
      }

      document.getElementById("groups").appendChild(newlabel);
    }

  });
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
}

function loadMsgs(grp_id)
{
   var database=firebase.database();
  var chatsRef=database.ref('/groups/'+grp_id+'/messages');

  chatsRef.on('value',function(snapshot){
    var messages=snapshot.val();

    for(var mid in messages){
        var msg = messages[mid];

        var newlabel = document.createElement("Label");
        newlabel.innerHTML = msg.message;  
        document.getElementById("msgs").appendChild(newlabel);      
        linebreak = document.createElement("br");
        document.getElementById("msgs").appendChild(linebreak);      
    }


    
  });
}