import './App.css';
import React from 'react';

// firebase SDK
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useEffect, useRef, useState } from 'react';


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
        <h1>Chat</h1>
        <SignOut />
        <p>Chat with Friend(s)!</p>
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
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef(); // to scroll to the bottom of the chat
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);
  // listens to updates
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const bannedWords = ["shit", "fuck", "meow", "woem"]; // Customize this list


  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // runs every time messages change


  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    // Censor bad words (case-insensitive, word boundaries)
    let cleanedText = formValue.trim();
    if (cleanedText.length === 0) {
      alert("Please enter a message");
      return;
    }
    // Replace each banned word with "***"
    bannedWords.forEach((word) => {
      // g = global, i = case-insensitive
      // \b = word boundary to ensure we only match whole words
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, "***");
    });

    await messagesRef.add({
      text: cleanedText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

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
      <img src={photoURL} alt="User" ></img>
      <p>{text}</p>
    </div>
  )
}

export default App;
