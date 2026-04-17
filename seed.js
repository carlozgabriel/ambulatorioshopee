import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawData = `
Epocler	Ampola
Dipirona 	Caixa
Paracetamol	Caixa
Diclofenaco sódio	Caixa
Torsilax	Caixa
Ibuprofeno	Caixa
Vonau	Caixa
Bilastina	Caixa
Cimegripe	Caixa
Sccharomyces boulardii	Caixa
Buscopan simples	Caixa
Pastilha Benalet	Caixa
Pomada Sulfato de neomicina 	Unidade
Glicose 10ml	Unidade
digliconato de clorexidina	Unidade
anlodipino	Caixa
Captopril	Caixa
suplemetO alimentar	Unidade
Flomisin/ Repoflor/Floratil	Caixa
Cinarizina	Caixa
Simeticona	Caixa
losartana	Caixa
Predinisolona 	Caixa
omeprazol	Caixa
Diclofenaco Spray	Unidade
Eno 	Caixa
Myalanta	Caixa
Sf09%	Unidade
Band- Aid	Caixa
Tira Teste 	Caixa
Mascara	Caixa
Algodão	Pacote
Gase	Pacote
Absorvente	Pacote
Fita Transparente  microperfurada	Unidade
Luvas 	Caixa
Ataduras 10cm	Unidade
Ataduras 12Cm	Unidade
Ataduras 20cm	Unidade
Alcool Gel 	Unidade
Alcool liquido 70%	Unidade
Digloconato de cloroxidina 	Unidade
Iodopoliviona 10%	Unidade
Antseptico	Unidade
Aparelho de P.A. (Braço)	Unidade
Aparelho de P.A. (Braço Obeso)	Unidade
Aparelho de P.A. (Punho Automático)	Unidade
Balanca Digital	Unidade
Bateria 2032 - Pilha	Unidade
Descarpack 13L	Unidade
DEA	Unidade
Fita Métrica	Unidade
Glicosímetro 	Unidade
Termogel Bolsa P/ Compressa	Unidade
Tambor INOX	Unidade
Termômetro	Unidade
Tesoura sem ponta	Unidade
Lanterna	Unidade
Maleta Primeiros Socorros	Unidade
Otoscopio	Unidade
Oxímetro de Pulso	Unidade
Pinça Anatomica	Unidade
Suporte para Descarpack	Unidade
Suporte para o DEA	Unidade
Álcool Swab	Unidade
Lancetas	Caixa
Cotonotes	Caixa
`;

const itemsList = rawData.trim().split('\n').map(line => {
  const parts = line.split('\t');
  return {
    name: parts[0].trim(),
    unit: parts[1] ? parts[1].trim() : 'Unidade',
  };
}).filter(i => i.name && i.name !== 'Insumos');

async function seed() {
  try {
    console.log("Autenticando...");
    await signInWithEmailAndPassword(auth, 'ambulatoriosocmg2@shopee.com', 'shopee@2026');
    console.log("Autenticado com sucesso!");

    // Ensure we have a default category
    let categoryId = 'geral';
    const catQuery = query(collection(db, 'categories'), where('name', '==', 'Geral'));
    const catDocs = await getDocs(catQuery);
    if (catDocs.empty) {
      console.log("Criando categoria Geral...");
      const docRef = await addDoc(collection(db, 'categories'), { name: 'Geral', color: '#6b7280' });
      categoryId = docRef.id;
    } else {
      categoryId = catDocs.docs[0].id;
    }

    console.log("Iniciando injeção de itens...");
    for (const item of itemsList) {
      // Check if item already exists to avoid duplicates
      const q = query(collection(db, 'items'), where('name', '==', item.name));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collection(db, 'items'), {
          name: item.name,
          categoryId: categoryId,
          supplier: 'Não informado',
          unit: item.unit,
          currentQuantity: 0,
          minQuantity: 5
        });
        console.log(`+ Adicionado: ${item.name} (${item.unit})`);
      } else {
        console.log(`- Ignorado (já existe): ${item.name}`);
      }
    }
    console.log("Injeção concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro durante a injeção:", error);
    process.exit(1);
  }
}

seed();
