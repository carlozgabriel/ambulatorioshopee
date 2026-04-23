const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, updateDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fixUserRole() {
  await signInWithEmailAndPassword(auth, 'adminc3ambulatorio@c3.com.br', 'Admin@c3');
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', 'carlosgabriel.camppos@gmail.com'));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    const userDoc = snap.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), { role: 'user' });
    console.log('Usuário carlosgabriel.camppos@gmail.com alterado para role: user');
  } else {
    console.log('Usuário não encontrado no Firestore.');
  }
}

fixUserRole().catch(console.error);
