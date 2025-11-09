export interface ExameQuestion {
  id: string;
  mandamento: string;
  numero: number;
  questions: string[];
}

export const exameData: ExameQuestion[] = [
  {
    id: '1-mandamento',
    mandamento: 'Amar a Deus sobre todas as coisas',
    numero: 1,
    questions: [
      'Duvidei da existência de Deus?',
      'Duvidei de alguma verdade de fé ou moral definida pela Igreja?',
      'Busquei ou acreditei em falsas doutrinas (astrologia, magia, espiritismo, etc)?',
      'Deixei de cumprir promessas ou votos que fiz?',
      'Recusei a obediência às autoridades da Igreja?',
      'Comunguei sabendo que estava em pecado mortal?',
    ],
  },
  {
    id: '2-mandamento',
    mandamento: 'Não tomar seu Santo Nome em vão',
    numero: 2,
    questions: [
      'Blasfemei a Deus ou as coisas de Deus?',
      'Desrespeitei a Deus ou as coisas de Deus?',
      'Jurei falso ou sem necessidade?',
    ],
  },
  {
    id: '3-mandamento',
    mandamento: 'Guardar domingos e festas de guarda',
    numero: 3,
    questions: [
      'Faltei à Santa Missa Dominical ou em festas de preceito?',
      'Trabalhei no domingo sem necessidade?',
    ],
  },
  {
    id: '4-mandamento',
    mandamento: 'Honrar pai e mãe',
    numero: 4,
    questions: [
      'Deixei de cumprir meus deveres com meus pais (respeito, gratidão, obediência e ajuda) e minha família?',
      'Não cumpri os justos deveres de um cidadão?',
    ],
  },
  {
    id: '5-mandamento',
    mandamento: 'Não matar',
    numero: 5,
    questions: [
      'Cometi homicídio voluntário?',
      'Abortei?',
      'Apoiei a eutanásia ou o suicídio?',
      'Levei outra pessoa a pecar, por ação ou omissão?',
      'Deixei de cuidar da minha saúde?',
      'Usei drogas?',
      'Expus a situação de risco a minha vida ou a de outras pessoas?',
      'Cometi atos contrários à dignidade da pessoa?',
      'Odiei, desprezei, maltratei alguém?',
      'Não perdoei?',
    ],
  },
  {
    id: '6-9-mandamento',
    mandamento: 'Não pecar contra a castidade / Não desejar a mulher do próximo',
    numero: 6,
    questions: [
      'Eu me masturbei?',
      '"Fiquei" sem a intenção de namorar com a pessoa?',
      'Traí meu namorado(a) ou fui cúmplice de traição?',
      'Tive relações sexuais antes do casamento?',
      'Cometi adultério?',
      'Cometi práticas homossexuais?',
      'Expus meu corpo com roupas escandalosas?',
      'Eu me expus a ocasiões de pecado (imagens pornográficas, locais, conversas, etc)?',
      'Consenti em olhares, pensamentos ou outros atos impuros?',
      'Utilizei métodos contraceptivos artificiais?',
      'Espacei o nascimento dos filhos sem razão justa?',
      'Fiz inseminação artificial?',
    ],
  },
  {
    id: '7-10-mandamento',
    mandamento: 'Não furtar / Não cobiçar as coisas alheias',
    numero: 7,
    questions: [
      'Roubei?',
      'Desrespeitei os bens das outras pessoas ou a justiça social?',
      'Desrespeitei a criação de Deus?',
    ],
  },
  {
    id: '8-mandamento',
    mandamento: 'Não levantar falso testemunho',
    numero: 8,
    questions: [
      'Menti?',
      'Pensei mal de alguém sem motivo?',
      'Caluniei ou difamei?',
    ],
  },
  {
    id: 'mandamentos-igreja',
    mandamento: 'Mandamentos da Santa Igreja',
    numero: 0,
    questions: [
      'Passei o ano sem me confessar?',
      'Deixei de comungar na Páscoa?',
      'Jejuei e abstive-me de carne na preparação das festas litúrgicas como manda a Igreja?',
      'Deixei de ajudar as necessidades materiais da Igreja segundo minhas possibilidades?',
    ],
  },
];

export interface ExameStorage {
  lastExamDate: string | null;
  lastConfessionDate: string | null;
  examsCompleted: number;
}
