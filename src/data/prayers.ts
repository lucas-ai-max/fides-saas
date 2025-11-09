export interface Prayer {
  id: string;
  title: string;
  category: string;
  content: string;
  duration: number; // em minutos
  tags: string[];
  isFavorite?: boolean;
}

export const prayersData: Prayer[] = [
  {
    id: 'pai-nosso',
    title: 'Pai Nosso',
    category: 'Orações Tradicionais',
    content: `Pai Nosso que estais nos Céus, 
santificado seja o vosso Nome, 
venha a nós o vosso Reino, 
seja feita a vossa vontade 
assim na terra como no Céu. 
O pão nosso de cada dia nos dai hoje, 
perdoai-nos as nossas ofensas 
assim como nós perdoamos 
a quem nos tem ofendido, 
e não nos deixeis cair em tentação, 
mas livrai-nos do Mal.`,
    duration: 1,
    tags: ['essencial', 'jesus', 'diária'],
  },
  {
    id: 'ave-maria',
    title: 'Ave Maria',
    category: 'Orações Tradicionais',
    content: `Avé Maria, cheia de graça, 
o Senhor é convosco, 
bendita sois vós entre as mulheres 
e bendito é o fruto do vosso ventre, Jesus. 
Santa Maria, Mãe de Deus, 
rogai por nós pecadores, 
agora e na hora da nossa morte. Ámen`,
    duration: 1,
    tags: ['essencial', 'maria', 'rosário'],
  },
  {
    id: 'credo-apostolos',
    title: 'Credo (Símbolo dos Apóstolos)',
    category: 'Orações Tradicionais',
    content: `Creio em Deus, Pai todo-poderoso, Criador do Céu e da Terra

E em Jesus Cristo, seu único Filho, nosso Senhor
que foi concebido pelo poder do Espírito Santo;
nasceu da Virgem Maria; 
padeceu sob Pôncio Pilatos, 
foi crucificado, morto e sepultado; 
desceu à mansão dos mortos; 
ressuscitou ao terceiro dia; 
subiu aos Céus; 
está sentado à direita de Deus Pai todo-poderoso, 
de onde há-de vir a julgar os vivos e os mortos.

Creio no Espírito Santo; 
na santa Igreja Católica; 
na comunhão dos Santos; 
na remissão dos pecados; 
na ressurreição da carne; 
e na vida eterna.

Ámen`,
    duration: 2,
    tags: ['essencial', 'profissão de fé', 'missa'],
  },
  {
    id: 'anjo-da-guarda',
    title: 'Oração ao Anjo da Guarda',
    category: 'Orações Tradicionais',
    content: `Santo Anjo do Senhor, 
meu zeloso guardador, 
pois que a ti me confiou a Piedade divina, 
hoje e sempre 
me governa, rege, guarda e ilumina. 
Ámen`,
    duration: 1,
    tags: ['proteção', 'anjos', 'diária'],
  },
  {
    id: 'gloria-ao-pai',
    title: 'Glória ao Pai',
    category: 'Orações Tradicionais',
    content: `Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio, agora e sempre. Ámen.`,
    duration: 1,
    tags: ['essencial', 'trindade', 'louvor'],
  },
  {
    id: 'salve-rainha',
    title: 'Salve Rainha',
    category: 'Orações Marianas',
    content: `Salve, Rainha, Mãe de misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos, os degredados filhos de Eva;
a vós suspiramos, gemendo e chorando
neste vale de lágrimas.
Eia, pois, advogada nossa,
esses vossos olhos misericordiosos a nós volvei;
e depois deste desterro
mostrai-nos Jesus,
bendito fruto do vosso ventre,
ó clemente, ó piedosa,
ó doce sempre Virgem Maria.

V. Rogai por nós, santa Mãe de Deus.
R. Para que sejamos dignos das promessas de Cristo.`,
    duration: 2,
    tags: ['maria', 'intercessão', 'rosário'],
  },
  {
    id: 'ato-contricao',
    title: 'Ato de Contrição',
    category: 'Orações de Penitência',
    content: `Meu Deus, eu me arrependo, de todo o coração,
de todos os meus pecados,
e os detesto, porque, pecando,
ofendi a Vós que sois o sumo Bem
e digno de ser amado sobre todas as coisas.
Proponho firmemente, com a ajuda da vossa graça,
nunca mais pecar e fugir das ocasiões próximas de pecado.
Senhor, tende piedade de mim, pecador. Ámen.`,
    duration: 1,
    tags: ['penitência', 'confissão', 'arrependimento'],
  },
  {
    id: 'angelus',
    title: 'Angelus',
    category: 'Orações Tradicionais',
    content: `V. O Anjo do Senhor anunciou a Maria.
R. E Ela concebeu pelo Espírito Santo.

Ave Maria...

V. Eis aqui a serva do Senhor.
R. Faça-se em mim segundo a vossa palavra.

Ave Maria...

V. E o Verbo se fez carne.
R. E habitou entre nós.

Ave Maria...

V. Rogai por nós, Santa Mãe de Deus.
R. Para que sejamos dignos das promessas de Cristo.

Oremos:
Infundi, Senhor, em nossos corações a vossa graça,
para que nós, a quem o anjo anunciou a encarnação de Cristo,
vosso Filho, pela sua paixão e cruz, sejamos levados
à glória da ressurreição. Por Cristo, nosso Senhor. Ámen.`,
    duration: 3,
    tags: ['encarnação', 'maria', 'tradição'],
  },
  {
    id: 'oracao-sao-francisco',
    title: 'Oração de São Francisco',
    category: 'Orações dos Santos',
    content: `Senhor, fazei-me instrumento de vossa paz.
Onde houver ódio, que eu leve o amor;
Onde houver ofensa, que eu leve o perdão;
Onde houver discórdia, que eu leve a união;
Onde houver dúvida, que eu leve a fé;
Onde houver erro, que eu leve a verdade;
Onde houver desespero, que eu leve a esperança;
Onde houver tristeza, que eu leve a alegria;
Onde houver trevas, que eu leve a luz.

Ó Mestre, fazei que eu procure mais:
consolar, que ser consolado;
compreender, que ser compreendido;
amar, que ser amado.
Pois é dando que se recebe,
é perdoando que se é perdoado,
e é morrendo que se vive para a vida eterna. Ámen.`,
    duration: 2,
    tags: ['paz', 'santos', 'caridade'],
  },
  {
    id: 'magnificat',
    title: 'Magnificat (Cântico de Maria)',
    category: 'Orações Marianas',
    content: `A minha alma glorifica ao Senhor,
e o meu espírito se alegra em Deus, meu Salvador,
porque olhou para a humildade de sua serva.
Sim! Doravante todas as gerações me chamarão bem-aventurada,
porque o Todo-Poderoso fez grandes coisas em meu favor.
Santo é o seu nome,
e sua misericórdia se estende, de geração em geração,
sobre aqueles que o temem.
Manifestou o poder de seu braço:
dispersou os soberbos de coração.
Derrubou os poderosos de seus tronos
e elevou os humildes.
Encheu de bens os famintos,
e despediu os ricos de mãos vazias.
Socorreu Israel, seu servo,
lembrando-se de sua misericórdia,
conforme prometera aos nossos pais,
em favor de Abraão e de sua descendência, para sempre.`,
    duration: 2,
    tags: ['maria', 'louvor', 'cântico'],
  },
];

export const categories = [
  { id: 'todas', name: 'Todas', icon: '📿' },
  { id: 'tradicionais', name: 'Tradicionais', icon: '✝️' },
  { id: 'marianas', name: 'Marianas', icon: '🌹' },
  { id: 'santos', name: 'Dos Santos', icon: '⭐' },
  { id: 'penitencia', name: 'Penitência', icon: '🙏' },
  { id: 'louvor', name: 'Louvor', icon: '🎵' },
];

export const intentions = [
  { id: 'trabalho', name: 'Trabalho', icon: '💼', color: 'from-blue-500/20 to-blue-600/20' },
  { id: 'saude', name: 'Saúde', icon: '💚', color: 'from-green-500/20 to-green-600/20' },
  { id: 'paz', name: 'Paz', icon: '🕊️', color: 'from-purple-500/20 to-purple-600/20' },
  { id: 'discernimento', name: 'Discernimento', icon: '🎯', color: 'from-yellow-500/20 to-yellow-600/20' },
  { id: 'familia', name: 'Família', icon: '👨‍👩‍👧', color: 'from-pink-500/20 to-pink-600/20' },
  { id: 'estudos', name: 'Estudos', icon: '📚', color: 'from-indigo-500/20 to-indigo-600/20' },
];

export interface PrayerHistory {
  prayerId: string;
  prayerTitle: string;
  prayedAt: Date;
  duration?: number;
}
