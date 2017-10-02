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

function ifUserIsLoggedIn(fn){
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.currentUser={
      id: user.uid,
      name: user.displayName,
      email: user.email
    };
    fn();
  } else {
    // No user is signed in.
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

function createGroup(uid, uname, uemail)
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