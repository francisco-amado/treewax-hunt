 import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
 import { doc, setDoc, collection,  addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
 import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
 
 const firebaseConfig = {
     apiKey: "",
     authDomain: "",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: ""
 };
 
 let puzzleDoc = {};
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const db = getFirestore(app);
 const puzzleRef = collection(db, "puzzle");
 const timestampRef = collection(db, "finishDate");
 const finalPuzzle = ["url_qr1", "url_qr2", "url_qr3", "url_qr4"];
 const video = document.getElementById('qr-video');
 const camList = document.getElementById('cam-list');
 const camQrResult = document.getElementById('cam-qr-result');
 const scanAgain = document.getElementById('scan-again');
 const logoutButton = document.getElementById('log-out');
 const puzzleImage = document.getElementById('puzzle-image');

 const createPuzzle = async (userId) => {
    await addDoc(puzzleRef, {
        puzzlePieces: [],
        userId: userId
    });
 };

 const createTimestamp = async (userName) => {
    const currentDate = new Date();
    const timestamp = currentDate.toString();

    await addDoc(timestampRef, {
        finishDate: timestamp,
        username: userName
    });
 };

 const getPuzzleDoc = async (userId) => {
    const querySnapshot = await getDocs(
        query(puzzleRef, where("userId", "==", userId))
    );

    if (querySnapshot.empty === false) {
        puzzleDoc = querySnapshot.docs[0].data();
        if (puzzleDoc.puzzlePieces.length !== 0) {
            const puzzleImageUrl = puzzleDoc.puzzlePieces.slice(-1)[0];
            puzzleImage.src = puzzleImageUrl;
        };
    } else {
        createPuzzle(userId);
    };
 };

 onAuthStateChanged(auth, (user) => {
    if (user) {
        getPuzzleDoc(user.uid);
    };
 });

 function setResult(label, result) {
    label.textContent = result.data;
    label.style.color = 'teal';
    clearTimeout(label.highlightTimeout);
    label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);
    updateGameInterface(result);
 };

 const scanner = new QrScanner(
    video, 
    result => setResult(camQrResult, result), {
    onDecodeError: error => {
        camQrResult.textContent = error;
        camQrResult.style.color = 'inherit';
    },

    highlightScanRegion: true,
    highlightCodeOutline: true,
 });

 const startScanner = () => {
    scanner.start().then(() => {
        QrScanner.listCameras(true).
            then(cameras => 
                cameras.forEach(camera => {
                    const option = document.createElement('option');
                    option.value = camera.id;
                    option.text = camera.label;
                    camList.add(option);
         }));
     });
 };

 const savePuzzle = async (puzzlePieces) => {
    const querySnapshot = await getDocs(
        query(puzzleRef, where("userId", "==", auth.currentUser.uid)));
    const puzzleDocRef = doc(db, "puzzle", querySnapshot.docs[0]._key.path.segments[6]);

    await setDoc(
        puzzleDocRef, { puzzlePieces: puzzlePieces }, { merge: true }, 
    );
 };

 startScanner();

 function updateGameInterface(result) {
     const puzzlePieces = puzzleDoc.puzzlePieces;
     const gameMessages = document.getElementById('game-messages');
     const resultIndex = finalPuzzle.findIndex(piece => piece === result.data);

     if (finalPuzzle.find(piece => piece === result.data) === undefined) {
        gameMessages.innerHTML = "Wrong code! Try again.";
        scanner.stop();
     } else if (puzzlePieces.includes(result.data)) {
        gameMessages.innerHTML = "You already have this piece! Try again.";
        scanner.stop();
     } else {
        const previousPieces = finalPuzzle.slice(0, resultIndex);

        if ((previousPieces.every(piece => puzzlePieces.includes(piece))) || (puzzlePieces.length === 0 && finalPuzzle[0] === result.data)) {
            puzzlePieces.push(result.data);
            savePuzzle(puzzlePieces);
            
            const puzzleImageUrl = puzzlePieces.slice(-1)[0];

            puzzleImage.src = puzzleImageUrl;
            gameMessages.innerHTML = "Congratulations, you found a new piece!";
            if (puzzlePieces.length === finalPuzzle.length) {
                createTimestamp(auth.currentUser.displayName);
                gameMessages.innerHTML = `Congratulations, you have collected all puzzle pieces!
                If you were the first to finish, keep an eye on your e-mail inbox, you will be notified! 
                In the meantime, enjoy your Bandcamp discount code (15%):<br> discountcode`;
             };
        } else {
            gameMessages.innerHTML = "You need to find the previous pieces!";
        };
     };

     scanner.stop();
 };

 scanAgain.addEventListener('click', startScanner);

 const logout = () => {
    const auth = getAuth();
    
    signOut(auth).then(() => {
    location.href = "login.html"
 }).catch((error) => {
    console.error(error);
 });
};

 logoutButton.addEventListener('click', logout);