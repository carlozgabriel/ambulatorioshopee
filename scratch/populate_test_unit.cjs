const { initializeApp } = require('firebase/app');
const { 
    getFirestore, 
    collection, 
    addDoc, 
    setDoc, 
    doc, 
    getDocs, 
    query, 
    where 
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const firebaseConfig = require('../firebase-applet-config.json');

const UNITY_ID = '7CP4q3HIxS0sWRImfswL';
const ADMIN_EMAIL = 'adminc3ambulatorio@c3.com.br';
const ADMIN_PASS = 'Admin@c3';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const categoriesNames = ['Medicamentos', 'Curativos', 'EPIs', 'Equipamentos', 'Higiene'];
const suppliers = ['MedSul', 'Hospidrogas', 'Distribuidora Saúde', 'MaxMed', 'BioLogística'];
const units = ['Un', 'Cx', 'Fr', 'Pct', 'Rl', 'Pr'];

async function populate() {
    console.log('Autenticando...');
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    console.log('Autenticado como:', auth.currentUser.email);

    const RESPONSIBLE_NAME = auth.currentUser.displayName || 'ADMIN SEED';
    const RESPONSIBLE_UID = auth.currentUser.uid;

    console.log('Iniciando população da unidade:', UNITY_ID);

    // 1. Criar Categorias
    const categories = [];
    for (const name of categoriesNames) {
        const catRef = await addDoc(collection(db, 'categories'), {
            name,
            unityId: UNITY_ID
        });
        categories.push({ id: catRef.id, name });
        console.log(`Categoria criada: ${name}`);
    }

    // 2. Criar 400 Itens
    console.log('Gerando 400 itens...');
    for (let i = 1; i <= 400; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const unit = units[Math.floor(Math.random() * units.length)];
        
        const itemName = `${cat.name} Item ${String(i).padStart(3, '0')}`;
        
        const itemData = {
            name: itemName,
            categoryId: cat.id,
            supplier: supplier,
            unit: unit,
            currentQuantity: 0,
            minQuantity: Math.floor(Math.random() * 20) + 5,
            indication: `Indicação genérica para o item ${itemName}. Uso sob prescrição.`,
            unityId: UNITY_ID
        };

        const itemRef = await addDoc(collection(db, 'items'), itemData);
        const itemId = itemRef.id;

        // 3. Adicionar uma ENTRADA inicial
        const qtyEntry = Math.floor(Math.random() * 100) + 50;
        const lotNumber = `LOTE-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + 12 + Math.floor(Math.random() * 12));
        
        // Criar o Batch
        const batchRef = await addDoc(collection(db, 'batches'), {
            itemId,
            lotNumber,
            expirationDate: expDate.toISOString(),
            quantity: qtyEntry,
            unityId: UNITY_ID,
            itemName: itemName // Conforme rules: hasRequiredFields(['itemId', 'itemName', 'lotNumber', 'expirationDate', 'quantity'])
        });

        // Registrar Movimento de Entrada
        const invoiceNum = String(Math.floor(Math.random() * 100000)).padStart(6, '0');
        const entryValue = (Math.random() * 1000 + 100).toFixed(2);
        
        await addDoc(collection(db, 'movements'), {
            type: 'ENTRADA',
            itemId,
            batchId: batchRef.id,
            lotNumber,
            quantity: qtyEntry,
            responsibleName: RESPONSIBLE_NAME,
            responsibleUid: RESPONSIBLE_UID,
            timestamp: new Date().toISOString(),
            notes: 'Carga inicial de teste',
            unityId: UNITY_ID,
            invoiceNumber: invoiceNum,
            invoiceSeries: '001',
            invoiceSupplier: supplier,
            invoiceIssueDate: new Date().toISOString().split('T')[0],
            invoiceTotalValue: parseFloat(entryValue)
        });

        // Atualizar saldo do item
        let currentTotal = qtyEntry;

        // 4. Adicionar uma SAIDA aleatória (em 60% dos itens)
        if (Math.random() > 0.4) {
            const qtyExit = Math.floor(Math.random() * 20) + 1;
            await addDoc(collection(db, 'movements'), {
                type: 'SAIDA',
                itemId,
                batchId: batchRef.id,
                lotNumber,
                quantity: qtyExit,
                responsibleName: RESPONSIBLE_NAME,
                responsibleUid: RESPONSIBLE_UID,
                timestamp: new Date().toISOString(),
                notes: 'Saída de teste',
                unityId: UNITY_ID
            });

            // Atualizar batch e item
            currentTotal -= qtyExit;
            await setDoc(batchRef, { quantity: qtyEntry - qtyExit }, { merge: true });
        }

        await setDoc(itemRef, { currentQuantity: currentTotal }, { merge: true });

        if (i % 50 === 0) console.log(`${i} itens processados...`);
    }

    console.log('População concluída com sucesso!');
    process.exit(0);
}

populate().catch(err => {
    console.error('Erro ao popular:', err);
    process.exit(1);
});
