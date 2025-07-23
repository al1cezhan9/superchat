import './App.css';
import React, { use } from 'react';

// firebase SDK
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { SignInMethod } from 'firebase/auth';
import { useState } from 'react';

// Your web app's Firebase configuration
firebase.initializeApp({
  apiKey: "AIzaSyB9TORPtwkdZcvBND1-artevRDObiWfF3k",
  authDomain: "superchat-b5eef.firebaseapp.com",
  projectId: "superchat-b5eef",
  storageBucket: "superchat-b5eef.firebasestorage.app",
  messagingSenderId: "135834610246",
  appId: "1:135834610246:web:6037fb9a37443a8af5f847",
  measurementId: "G-C5YJGVPWCW"
})

// local variables
const auth = firebase.auth();
const firestore = firebase.firestore();

// signed-in = user is an object
// signed-out = user is null


function App() {
  const[user] = useAuthState(auth);
  return (
    <div className="App">
      <header>

      </header>
      <section >
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider =  new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = React.useRef(); // to scroll to the bottom of the chat
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);
  // listens to updates
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    // Call moderation API
    const res = await fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: formValue, uid }),
    });

    const result = await res.json();
    const textToSend = result.moderated ? result.cleaned : formValue;

    await messagesRef.add({
      text: textToSend,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    // Optional: Ban collection
    if (result.ban) {
      await firestore.collection("banned").doc(uid).set({});
    }

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        
        <button type="submit">Send</button>

      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  
  // to distinguish between sent and received messages
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';


  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p>
    </div>
  )
}

export default App;
