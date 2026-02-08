-- Tabela prayers: colunas alinhadas à interface Prayer (id, title, category, content, duration, tags)
CREATE TABLE IF NOT EXISTS public.prayers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}'
);

-- Índices para busca e filtro por categoria
CREATE INDEX IF NOT EXISTS idx_prayers_category ON public.prayers (category);
CREATE INDEX IF NOT EXISTS idx_prayers_tags ON public.prayers USING GIN (tags);

-- RLS: leitura pública (qualquer um pode ler orações)
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prayers_select_public"
  ON public.prayers FOR SELECT
  TO public
  USING (true);

-- Seed: inserir orações iniciais (mesmas do prayersData)
INSERT INTO public.prayers (id, title, category, content, duration, tags) VALUES
('pai-nosso', 'Pai Nosso', 'Orações Tradicionais', $$Pai Nosso que estais nos Céus,
santificado seja o vosso Nome,
venha a nós o vosso Reino,
seja feita a vossa vontade
assim na terra como no Céu.
O pão nosso de cada dia nos dai hoje,
perdoai-nos as nossas ofensas
assim como nós perdoamos
a quem nos tem ofendido,
e não nos deixeis cair em tentação,
mas livrai-nos do Mal.$$, 1, ARRAY['essencial', 'jesus', 'diária']),

('ave-maria', 'Ave Maria', 'Orações Tradicionais', $$Avé Maria, cheia de graça,
o Senhor é convosco,
bendita sois vós entre as mulheres
e bendito é o fruto do vosso ventre, Jesus.
Santa Maria, Mãe de Deus,
rogai por nós pecadores,
agora e na hora da nossa morte. Ámen$$, 1, ARRAY['essencial', 'maria', 'rosário']),

('credo-apostolos', 'Credo (Símbolo dos Apóstolos)', 'Orações Tradicionais', $$Creio em Deus, Pai todo-poderoso, Criador do Céu e da Terra

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

Ámen$$, 2, ARRAY['essencial', 'profissão de fé', 'missa']),

('anjo-da-guarda', 'Oração ao Anjo da Guarda', 'Orações Tradicionais', $$Santo Anjo do Senhor,
meu zeloso guardador,
pois que a ti me confiou a Piedade divina,
hoje e sempre
me governa, rege, guarda e ilumina.
Ámen$$, 1, ARRAY['proteção', 'anjos', 'diária']),

('gloria-ao-pai', 'Glória ao Pai', 'Orações Tradicionais', $$Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio, agora e sempre. Ámen.$$, 1, ARRAY['essencial', 'trindade', 'louvor']),

('salve-rainha', 'Salve Rainha', 'Orações Marianas', $$Salve, Rainha, Mãe de misericórdia,
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
R. Para que sejamos dignos das promessas de Cristo.$$, 2, ARRAY['maria', 'intercessão', 'rosário']),

('ato-contricao', 'Ato de Contrição', 'Orações de Penitência', $$Meu Deus, eu me arrependo, de todo o coração,
de todos os meus pecados,
e os detesto, porque, pecando,
ofendi a Vós que sois o sumo Bem
e digno de ser amado sobre todas as coisas.
Proponho firmemente, com a ajuda da vossa graça,
nunca mais pecar e fugir das ocasiões próximas de pecado.
Senhor, tende piedade de mim, pecador. Ámen.$$, 1, ARRAY['penitência', 'confissão', 'arrependimento']),

('angelus', 'Angelus', 'Orações Tradicionais', $$V. O Anjo do Senhor anunciou a Maria.
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
à glória da ressurreição. Por Cristo, nosso Senhor. Ámen.$$, 3, ARRAY['encarnação', 'maria', 'tradição']),

('oracao-sao-francisco', 'Oração de São Francisco', 'Orações dos Santos', $$Senhor, fazei-me instrumento de vossa paz.
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
e é morrendo que se vive para a vida eterna. Ámen.$$, 2, ARRAY['paz', 'santos', 'caridade']),

('magnificat', 'Magnificat (Cântico de Maria)', 'Orações Marianas', $$A minha alma glorifica ao Senhor,
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
em favor de Abraão e de sua descendência, para sempre.$$, 2, ARRAY['maria', 'louvor', 'cântico'])
ON CONFLICT (id) DO NOTHING;
