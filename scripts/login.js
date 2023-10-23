 import { signInWithPopup, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
 import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

 const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const provider = new GoogleAuthProvider();
 const signInButton = document.getElementById('fbauth');

 const signIn = () => {
    signInWithPopup(auth, provider).then(() => {
        location.href = "game.html"
   }).catch((error) => {
    console.error(error);
   });
 };

 const signInWithPersistence = () => setPersistence(auth, browserSessionPersistence)
  .then(() => {
    return signIn();
  })
  .catch((error) => {
    console.error(error);
  });

 signInButton.addEventListener('click', signInWithPersistence);