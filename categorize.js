import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =============================================
// CATEGORIAS INTELIGENTES
// =============================================
const CATEGORIES = [
  { name: 'Analgésico / Antitérmico', color: '#ef4444' },
  { name: 'Cólica / Antiespasmódico',  color: '#f97316' },
  { name: 'Digestivo / Gástrico',      color: '#eab308' },
  { name: 'Anti-inflamatório',         color: '#ec4899' },
  { name: 'Cardiovascular',            color: '#8b5cf6' },
  { name: 'Alergia / Gripe',           color: '#06b6d4' },
  { name: 'Antibiótico / Antifúngico', color: '#10b981' },
  { name: 'Curativo / Assepsia',       color: '#3b82f6' },
  { name: 'Equipamentos / Aparelhos',  color: '#64748b' },
  { name: 'Suprimentos / Insumos',     color: '#78716c' },
];

// =============================================
// MAPA: nome do item → { categoria, indicação }
// =============================================
const ITEM_MAP = [
  // Analgésico / Antitérmico
  { name: 'Dipirona',        cat: 'Analgésico / Antitérmico',    indication: 'Indicado para alívio de dores em geral (dor de cabeça, muscular, dental) e redução de febre (antitérmico).' },
  { name: 'Paracetamol',     cat: 'Analgésico / Antitérmico',    indication: 'Analgésico e antitérmico. Indicado para dores leves a moderadas e estados febris.' },

  // Cólica / Antiespasmódico
  { name: 'Buscopan simples',  cat: 'Cólica / Antiespasmódico',  indication: 'Antiespasmódico. Indicado para alívio de cólicas intestinais, gástricas e urinárias.' },
  { name: 'Torsilax',          cat: 'Cólica / Antiespasmódico',  indication: 'Associação de relaxante muscular e analgésico. Indicado para contraturas musculares, torcicolos e dores lombares.' },

  // Anti-inflamatório
  { name: 'Diclofenaco sódio', cat: 'Anti-inflamatório',         indication: 'Anti-inflamatório não esteroidal. Indicado para dores musculares, articulares, pós-operatórias e dismenorreia.' },
  { name: 'Ibuprofeno',        cat: 'Anti-inflamatório',         indication: 'Anti-inflamatório não esteroidal. Indicado para febre, dor e inflamação de origem diversa.' },
  { name: 'Diclofenaco Spray', cat: 'Anti-inflamatório',         indication: 'Anti-inflamatório tópico. Indicado para dores musculares e articulares localizadas, aplicação externa.' },
  { name: 'Predinisolona',     cat: 'Anti-inflamatório',         indication: 'Corticosteroide. Indicado para processos inflamatórios e alérgicos intensos, sob orientação médica.' },

  // Digestivo / Gástrico
  { name: 'Epocler',                    cat: 'Digestivo / Gástrico', indication: 'Solução hepatoprotetora (ampola). Indicado para ressaca, intoxicações leves e suporte hepático.' },
  { name: 'omeprazol',                  cat: 'Digestivo / Gástrico', indication: 'Inibidor de bomba de prótons. Indicado para gastrite, úlcera gástrica, refluxo e azia.' },
  { name: 'Eno',                        cat: 'Digestivo / Gástrico', indication: 'Antiácido efervescente. Indicado para alívio rápido de azia, má digestão e estômago pesado.' },
  { name: 'Myalanta',                   cat: 'Digestivo / Gástrico', indication: 'Antiácido e antiflatulento. Indicado para azia, refluxo, gases e desconforto gástrico.' },
  { name: 'Simeticona',                 cat: 'Digestivo / Gástrico', indication: 'Antiflatulento. Indicado para excesso de gases intestinais, flatulência e distensão abdominal.' },
  { name: 'Sccharomyces boulardii',     cat: 'Digestivo / Gástrico', indication: 'Probiótico (levedura). Indicado para prevenção e tratamento de diarreia associada a antibióticos e colite.' },
  { name: 'Flomisin/ Repoflor/Floratil',cat: 'Digestivo / Gástrico', indication: 'Probiótico. Indicado para restauração da flora intestinal após uso de antibióticos ou episódios de diarreia.' },

  // Alergia / Gripe
  { name: 'Vonau',      cat: 'Alergia / Gripe', indication: 'Antiemético (ondansetrona). Indicado para náuseas e vômitos, inclusive associados a quimioterapia ou cirurgia.' },
  { name: 'Bilastina',  cat: 'Alergia / Gripe', indication: 'Anti-histamínico de 2ª geração. Indicado para rinite alérgica, urticária e outras manifestações alérgicas.' },
  { name: 'Cimegripe',  cat: 'Alergia / Gripe', indication: 'Associação de antigripal com analgésico, antitérmico e descongestionante. Indicado para sintomas de gripe e resfriado.' },
  { name: 'Cinarizina', cat: 'Alergia / Gripe', indication: 'Anti-histamínico / antivertiginoso. Indicado para labirintite, vertigens, cinetose (enjoo em viagens) e náuseas.' },
  { name: 'Pastilha Benalet', cat: 'Alergia / Gripe', indication: 'Antisséptico oral e anestésico local. Indicado para alívio de dores de garganta, faringite e rouquidão.' },

  // Cardiovascular
  { name: 'anlodipino',  cat: 'Cardiovascular', indication: 'Bloqueador de canal de cálcio. Indicado para hipertensão arterial e angina pectoris.' },
  { name: 'Captopril',   cat: 'Cardiovascular', indication: 'Inibidor da ECA. Indicado para hipertensão arterial (inclusive crises hipertensivas) e insuficiência cardíaca.' },
  { name: 'losartana',   cat: 'Cardiovascular', indication: 'Bloqueador do receptor de angiotensina (BRA). Indicado para hipertensão arterial e proteção renal em diabéticos.' },

  // Antibiótico / Antifúngico
  { name: 'Pomada Sulfato de neomicina', cat: 'Antibiótico / Antifúngico', indication: 'Antibiótico tópico. Indicado para prevenção e tratamento de infecções bacterianas superficiais da pele e feridas.' },

  // Curativo / Assepsia
  { name: 'Glicose 10ml',                cat: 'Curativo / Assepsia', indication: 'Solução de glicose para uso oral ou tópico. Usada para hidratação rápida em quadros de hipoglicemia leve.' },
  { name: 'digliconato de clorexidina',  cat: 'Curativo / Assepsia', indication: 'Antisséptico de amplo espectro. Indicado para higienização das mãos, limpeza de feridas e desinfecção de pele antes de procedimentos.' },
  { name: 'Digloconato de cloroxidina',  cat: 'Curativo / Assepsia', indication: 'Antisséptico de amplo espectro. Indicado para higienização das mãos, limpeza de feridas e desinfecção de pele antes de procedimentos.' },
  { name: 'Sf09%',                       cat: 'Curativo / Assepsia', indication: 'Soro Fisiológico 0,9%. Indicado para limpeza e irrigação de feridas, lavagem nasal e hidratação.' },
  { name: 'Alcool Gel',                  cat: 'Curativo / Assepsia', indication: 'Antisséptico. Indicado para higienização das mãos sem água, eliminando bactérias e vírus.' },
  { name: 'Alcool liquido 70%',          cat: 'Curativo / Assepsia', indication: 'Antisséptico e desinfetante. Indicado para desinfecção de superfícies, equipamentos e antissepsia de pele.' },
  { name: 'Iodopoliviona 10%',           cat: 'Curativo / Assepsia', indication: 'Antisséptico à base de iodo (PVPI). Indicado para desinfecção de feridas, pele e mucosas antes de procedimentos.' },
  { name: 'Antseptico',                  cat: 'Curativo / Assepsia', indication: 'Antisséptico tópico. Indicado para prevenção de infecções em feridas e procedimentos de curativos.' },
  { name: 'Band- Aid',                   cat: 'Curativo / Assepsia', indication: 'Curativo adesivo. Indicado para proteção de pequenos cortes, arranhões e feridas superficiais.' },
  { name: 'Gase',                        cat: 'Curativo / Assepsia', indication: 'Compressa de gaze. Indicada para absorção de exsudatos, cobertura de feridas e curativos em geral.' },
  { name: 'Ataduras 10cm',              cat: 'Curativo / Assepsia', indication: 'Atadura de crepe 10cm. Utilizada para imobilização, compressão e fixação de curativos.' },
  { name: 'Ataduras 12Cm',             cat: 'Curativo / Assepsia', indication: 'Atadura de crepe 12cm. Utilizada para imobilização, compressão e fixação de curativos.' },
  { name: 'Ataduras 20cm',             cat: 'Curativo / Assepsia', indication: 'Atadura de crepe 20cm. Utilizada para imobilização, compressão e fixação de curativos em áreas maiores.' },
  { name: 'Fita Transparente  microperfurada', cat: 'Curativo / Assepsia', indication: 'Fita adesiva microperfurada. Utilizada para fixação de curativos e compresas na pele, permitindo respiração.' },
  { name: 'Álcool Swab',              cat: 'Curativo / Assepsia', indication: 'Swab umedecido com álcool 70%. Indicado para antissepsia da pele antes de injeções ou coletas.' },
  { name: 'Cotonotes',                cat: 'Curativo / Assepsia', indication: 'Hastes flexíveis com ponta de algodão. Utilizadas para limpeza de pequenas cavidades, aplicação de medicamentos tópicos e curativos.' },

  // Suprimentos / Insumos
  { name: 'Algodão',          cat: 'Suprimentos / Insumos', indication: 'Algodão hidrófilo. Utilizado para aplicação e remoção de antissépticos, curativos e procedimentos de enfermagem.' },
  { name: 'Absorvente',       cat: 'Suprimentos / Insumos', indication: 'Absorvente descartável. Utilizado como curativo para feridas com grande exsudato ou para fins de higiene.' },
  { name: 'Luvas',            cat: 'Suprimentos / Insumos', indication: 'Luvas de procedimento descartáveis. Equipamento de proteção individual (EPI) essencial para todos os procedimentos.' },
  { name: 'Mascara',          cat: 'Suprimentos / Insumos', indication: 'Máscara de proteção facial. EPI utilizado para proteção contra partículas e gotículas em procedimentos.' },
  { name: 'Tira Teste',       cat: 'Suprimentos / Insumos', indication: 'Fitas reagentes para glicosímetro. Utilizadas para medição rápida dos níveis de glicose no sangue (glicemia capilar).' },
  { name: 'Lancetas',         cat: 'Suprimentos / Insumos', indication: 'Lancetas descartáveis para punção digital. Utilizadas para coleta de pequena amostra de sangue na glicemia capilar.' },
  { name: 'Descarpack 13L',   cat: 'Suprimentos / Insumos', indication: 'Recipiente para descarte de materiais perfurocortantes (agulhas, lancetas). Obrigatório por normas de biossegurança.' },
  { name: 'suplemetO alimentar', cat: 'Suprimentos / Insumos', indication: 'Suplemento alimentar. Indicado para reposição nutricional e suporte calórico/proteico conforme prescrição.' },

  // Equipamentos / Aparelhos
  { name: 'Aparelho de P.A. (Braço)',            cat: 'Equipamentos / Aparelhos', indication: 'Esfigmomanômetro digital de braço. Utilizado para aferição da pressão arterial em adultos.' },
  { name: 'Aparelho de P.A. (Braço Obeso)',      cat: 'Equipamentos / Aparelhos', indication: 'Esfigmomanômetro digital com manguito extra-grande. Indicado para pacientes obesos ou com braço de circunferência maior.' },
  { name: 'Aparelho de P.A. (Punho Automático)', cat: 'Equipamentos / Aparelhos', indication: 'Esfigmomanômetro digital de pulso. Alternativa para aferição da pressão arterial quando o braço não é acessível.' },
  { name: 'Balanca Digital',                    cat: 'Equipamentos / Aparelhos', indication: 'Balança digital. Utilizada para aferição do peso corporal dos pacientes, dado essencial na triagem.' },
  { name: 'Bateria 2032 - Pilha',               cat: 'Equipamentos / Aparelhos', indication: 'Bateria tipo moeda CR2032. Utilizada como fonte de energia em equipamentos como glicosímetros e relógios de ponto.' },
  { name: 'DEA',                                cat: 'Equipamentos / Aparelhos', indication: 'Desfibrilador Externo Automático. Equipamento de emergência para tratar parada cardiorrespiratória por fibrilação ventricular.' },
  { name: 'Fita Métrica',                       cat: 'Equipamentos / Aparelhos', indication: 'Fita métrica flexível. Utilizada para medição de circunferências (abdominal, cefálica) em avaliações clínicas.' },
  { name: 'Glicosímetro',                       cat: 'Equipamentos / Aparelhos', indication: 'Aparelho para medição de glicemia capilar. Utilizado no controle glicêmico de pacientes diabéticos e triagem.' },
  { name: 'Termogel Bolsa P/ Compressa',        cat: 'Equipamentos / Aparelhos', indication: 'Bolsa de gel reutilizável. Utilizada como compressa quente ou fria para alívio de dores musculares e contusões.' },
  { name: 'Tambor INOX',                        cat: 'Equipamentos / Aparelhos', indication: 'Tambor de aço inoxidável para esterilização. Utilizado para guardar e esterilizar materiais de curativos e procedimentos.' },
  { name: 'Termômetro',                         cat: 'Equipamentos / Aparelhos', indication: 'Termômetro clínico. Utilizado para aferição da temperatura corporal durante triagem e avaliação de pacientes.' },
  { name: 'Tesoura sem ponta',                  cat: 'Equipamentos / Aparelhos', indication: 'Tesoura de ponta romba para uso clínico. Utilizada para cortar curativos, ataduras e materiais sem risco de punctura.' },
  { name: 'Lanterna',                           cat: 'Equipamentos / Aparelhos', indication: 'Lanterna clínica. Utilizada para exame de garganta, ouvidos, olhos e em situações de falta de energia.' },
  { name: 'Maleta Primeiros Socorros',          cat: 'Equipamentos / Aparelhos', indication: 'Kit completo de primeiros socorros. Contém materiais essenciais para atendimento inicial em emergências.' },
  { name: 'Otoscopio',                          cat: 'Equipamentos / Aparelhos', indication: 'Otoscópio. Instrumento óptico utilizado para exame visual do canal auditivo e membrana timpânica.' },
  { name: 'Oxímetro de Pulso',                  cat: 'Equipamentos / Aparelhos', indication: 'Oxímetro de dedo. Mede a saturação de oxigênio no sangue (SpO2) e a frequência cardíaca de forma não invasiva.' },
  { name: 'Pinça Anatomica',                    cat: 'Equipamentos / Aparelhos', indication: 'Pinça anatômica sem dentes. Instrumento cirúrgico utilizado para manipulação de tecidos e curativos.' },
  { name: 'Suporte para Descarpack',            cat: 'Equipamentos / Aparelhos', indication: 'Suporte de parede ou mesa para o recipiente de descarte de perfurocortantes. Facilita o acesso e aumenta a segurança.' },
  { name: 'Suporte para o DEA',                 cat: 'Equipamentos / Aparelhos', indication: 'Suporte de parede para o DEA. Garante que o desfibrilador esteja sempre visível e acessível em caso de emergência.' },
];

async function categorize() {
  try {
    console.log("Autenticando...");
    await signInWithEmailAndPassword(auth, 'ambulatoriosocmg2@shopee.com', 'shopee@2026');
    console.log("Autenticado!");

    // 1. Criar as categorias e guardar mapa nome→id
    console.log("\n📂 Criando categorias inteligentes...");
    const catIdMap = {};

    // Busca categorias existentes
    const existingCats = await getDocs(collection(db, 'categories'));
    existingCats.forEach(d => { catIdMap[d.data().name] = d.id; });

    for (const cat of CATEGORIES) {
      if (!catIdMap[cat.name]) {
        const ref = await addDoc(collection(db, 'categories'), { name: cat.name, color: cat.color });
        catIdMap[cat.name] = ref.id;
        console.log(`  + Categoria criada: ${cat.name}`);
      } else {
        console.log(`  = Categoria já existe: ${cat.name}`);
      }
    }

    // 2. Atualizar os itens
    console.log("\n💊 Atualizando itens com categorias e indicações...");
    const allItemsSnap = await getDocs(collection(db, 'items'));

    for (const itemDoc of allItemsSnap.docs) {
      const itemData = itemDoc.data();
      const itemName = itemData.name?.trim();

      // Encontrar correspondência no mapa
      const match = ITEM_MAP.find(m =>
        itemName?.toLowerCase().includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(itemName?.toLowerCase())
      );

      if (match) {
        const newCatId = catIdMap[match.cat];
        if (!newCatId) {
          console.log(`  ⚠ Categoria não encontrada para: ${itemName}`);
          continue;
        }
        await updateDoc(doc(db, 'items', itemDoc.id), {
          categoryId: newCatId,
          indication: match.indication
        });
        console.log(`  ✓ ${itemName} → [${match.cat}]`);
      } else {
        console.log(`  ? Sem mapeamento para: ${itemName}`);
      }
    }

    console.log("\n✅ Categorização concluída com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

categorize();
