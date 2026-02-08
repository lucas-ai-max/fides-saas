import { useState } from "react";
import { ArrowLeft, BookOpen, Heart, Book, Church } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BottomNav } from "@/components/BottomNav";

type GuideId = "terco" | "confissao" | "biblia" | "missa" | null;

const GUIDES = [
  {
    id: "terco" as const,
    title: "Como rezar o Terço",
    subtitle: "Um passo a passo simples para começar",
    icon: Heart,
    gradient: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "confissao" as const,
    title: "Guia para uma boa Confissão",
    subtitle: "Sem medo: Deus te acolhe",
    icon: BookOpen,
    gradient: "from-primary/20 to-blue-500/10",
    iconColor: "text-primary-600 dark:text-primary-400",
  },
  {
    id: "biblia" as const,
    title: "Como ler a Bíblia",
    subtitle: "Dicas para quem está começando",
    icon: Book,
    gradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "missa" as const,
    title: "O que é a Santa Missa",
    subtitle: "Entenda cada parte da celebração",
    icon: Church,
    gradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const GUIDE_CONTENT: Record<NonNullable<GuideId>, { title: string; body: string }> = {
  terco: {
    title: "Como rezar o Terço",
    body: `O Terço é uma oração simples e poderosa. Não precisa ter pressa: Deus está com você a cada Ave-Maria.

**O que você vai precisar**
• Um terço (ou use os dedos da mão).
• Cerca de 15 a 20 minutos em um lugar tranquilo.

**Passo a passo**

1. **Sinal da Cruz** – Comece em nome do Pai, do Filho e do Espírito Santo.

2. **Credo dos Apóstolos** – Reze o Creio em Deus… (uma vez).

3. **Pai Nosso** – Uma vez.

4. **Três Ave-Marias** – Pelas virtudes da fé, esperança e caridade.

5. **Glória ao Pai** – Uma vez.

6. **Mistérios** – Em cada dia da semana, rezamos um conjunto de 5 mistérios (gozosos, dolorosos, gloriosos ou luminosos). Cada mistério é um momento da vida de Jesus e de Maria. Antes de cada um: anuncie o mistério (ex.: “Primeiro mistério gozoso: a Anunciação”) e reze 1 Pai Nosso, 10 Ave-Marias e 1 Glória ao Pai.

7. **Salve Rainha** – No final, reze a oração à Nossa Senhora.

**Dica**  
Se 5 dezenas parecerem muitas no início, reze só uma dezena (1 Pai Nosso + 10 Ave-Marias + 1 Glória). O importante é começar com o coração aberto.`,
  },
  confissao: {
    title: "Guia para uma boa Confissão",
    body: `A Confissão (ou Sacramento da Reconciliação) é um encontro de misericórdia. Deus não está ali para te condenar, e sim para te perdoar e te levantar.

**Por que confessar?**
Jesus deixou esse sacramento para que possamos receber o perdão dos pecados e a paz. É um presente, não um castigo.

**Como se preparar**

1. **Exame de consciência** – Reserve alguns minutos em silêncio e pergunte-se: onde falhei no amor a Deus e ao próximo? (Pode usar o Exame de Consciência do app.)

2. **Arrependimento** – Não é só “listar erros”: é reconhecer que magoou a Deus e ao próximo e quer mudar.

3. **Propósito** – Decida evitar o pecado e as ocasiões que te levam a ele.

**Durante a confissão**

• Cumprimente o padre e diga há quanto tempo não se confessa (ou se é a primeira vez).
• Confesse os pecados que lembrar, com simplicidade. Não precisa de detalhes desnecessários.
• O padre pode dar um conselho e uma penitência (oração ou gesto para ajudar na conversão).
• Reze o Ato de Contrição (o padre pode ajudar se não lembrar).
• Receba a absolvição: o padre estende a mão e pronuncia as palavras de perdão em nome de Cristo.

**Depois**
Cumpra a penitência com calma. Saia leve: você foi perdoado.`,
  },
  biblia: {
    title: "Como ler a Bíblia",
    body: `A Bíblia é a Palavra de Deus escrita para nós. Não é preciso ser especialista: basta começar com o coração aberto.

**Por onde começar?**

• **Os Evangelhos** – Mateus, Marcos, Lucas e João contam a vida de Jesus. Um bom começo é o Evangelho de Marcos (mais curto) ou de Lucas.
• Leia um trecho por dia: um capítulo ou até menos. Qualidade vale mais que quantidade.

**Antes de ler**

• Faça um momento de silêncio e peça ao Espírito Santo que ilumine sua leitura.
• Pode rezar: “Senhor, fala ao meu coração.”

**Durante a leitura**

• Não se preocupe em entender tudo de uma vez.
• Se um versículo chamar sua atenção, pare e reflita. Deus pode estar falando ali para você.
• Anote dúvidas ou frases que tocaram seu coração.

**Dica**
A Liturgia do dia (no app) já traz um trecho da Bíblia escolhido pela Igreja. É um ótimo jeito de ler a Palavra aos poucos, acompanhando o tempo litúrgico.`,
  },
  missa: {
    title: "O que é a Santa Missa",
    body: `A Missa é a celebração central da fé católica: é o mesmo sacrifício de Jesus na cruz, oferecido de forma incruenta, e o momento em que recebemos Jesus na Eucaristia.

**Estrutura básica**

1. **Ritos iniciais** – Canto de entrada, saudação, ato penitencial, Glória (aos domingos), oração do dia. É o “aquecer o coração” para o que vem a seguir.

2. **Liturgia da Palavra** – Leituras da Bíblia (geralmente uma do Antigo Testamento, Salmo, Epístola e Evangelho). O padre faz a homilia (reflexão). É Deus falando à assembleia.

3. **Liturgia Eucarística** – O momento mais sagrado.
   • Ofertório – Levamos pão e vinho ao altar.
   • Oração Eucarística – O padre, em nome de Cristo, consagra o pão e o vinho: eles se tornam o Corpo e o Sangue de Jesus.
   • Pai Nosso e gesto da paz.
   • Comunhão – Quem está em estado de graça pode receber a Eucaristia.

4. **Ritos finais** – Avisos (se houver), bênção e envio (“Ide em paz”).

**Por que participar?**
Jesus nos pede: “Fazei isto em memória de mim.” Na Missa, estamos unidos a Ele e a toda a Igreja. É alimento para a alma e força para a semana.`,
  },
};

const Library = () => {
  const navigate = useNavigate();
  const [openGuide, setOpenGuide] = useState<GuideId>(null);

  const content = openGuide ? GUIDE_CONTENT[openGuide] : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-semibold text-primary">
          Biblioteca
        </h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <p className="text-muted-foreground font-body text-sm mb-6">
          Guias essenciais para quem está começando na fé. Toque em um card para ler.
        </p>

        <h2 className="text-lg font-heading font-semibold text-primary mb-3">
          Guias Essenciais
        </h2>

        <div className="grid gap-4">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card
                key={guide.id}
                className="overflow-hidden border-border hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setOpenGuide(guide.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guide.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${guide.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-foreground">
                      {guide.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {guide.subtitle}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-sm">Ler →</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={openGuide !== null} onOpenChange={(open) => !open && setOpenGuide(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 pb-2 border-b border-border">
            <DialogTitle className="font-heading text-lg pr-8">
              {content?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[60vh] px-4 py-4">
            <div className="prose prose-sm dark:prose-invert max-w-none font-body text-foreground whitespace-pre-line">
              {content?.body.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="font-semibold text-foreground mt-4 mb-1">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("• ")) {
                  return (
                    <p key={i} className="pl-4 text-muted-foreground">
                      {line.slice(2)}
                    </p>
                  );
                }
                if (line.startsWith("# ")) {
                  return (
                    <h3 key={i} className="font-heading font-semibold text-primary mt-4 mb-2">
                      {line.slice(2)}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="text-muted-foreground mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Library;
