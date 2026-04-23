const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TARGET_UNITY_ID = 'XG2XzaZU9YHAjCnBWcX1'; // ID da unidade SOC MG2

async function migrateData() {
  await signInWithEmailAndPassword(auth, 'adminc3ambulatorio@c3.com.br', 'Admin@c3');
  
  const collections = ['items', 'categories', 'batches', 'movements'];
  
  for (const colName of collections) {
    console.log(`Migrando coleção: ${colName}...`);
    const snap = await getDocs(collection(db, colName));
    let count = 0;
    
    for (const d of snap.docs) {
      const data = d.data();
      if (!data.unityId) {
        await updateDoc(doc(db, colName, d.id), { unityId: TARGET_UNITY_ID });
        count++;
      }
    }
    console.log(`- ${count} documentos atualizados em ${colName}.`);
  }
  
  console.log('Migração concluída com sucesso!');
}

migrateData().catch(console.error);
