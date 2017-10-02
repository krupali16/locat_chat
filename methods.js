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
	var user = firebase.auth().currentUser;

	  var group_name = document.getElementById("txt_grpName").value;
	  var database = firebase.database();

	  var groupsRef=database.ref("groups");
	  var group_id = database.ref("groups").push().key;
	  var group={
	    group_id: group_id,
	    name:group_name,
	    admin: user.uid
	    //admin: window.currentUser.id
	  }

	  groupsRef.child(group_id).set(group).then(function(){
	    redirect("chats.html");
	  });
	
}