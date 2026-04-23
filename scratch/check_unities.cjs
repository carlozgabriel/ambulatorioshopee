const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function checkUnities() {
  await signInWithEmailAndPassword(auth, 'adminc3ambulatorio@c3.com.br', 'Admin@c3');
  const querySnapshot = await getDocs(collection(db, 'unities'));
  console.log('--- Unidades Encontradas ---');
  querySnapshot.forEach((doc) => {
    console.log(`ID: ${doc.id}`);
    console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
  });
}

checkUnities().catch(console.error);
