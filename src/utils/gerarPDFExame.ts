import jsPDF from 'jspdf';

interface PecadoIdentificado {
  mandamentoNumero: number;
  mandamentoTitulo: string;
  perguntas: string[];
}

export const gerarPDFExame = (pecados: PecadoIdentificado[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Função auxiliar para adicionar texto com quebra de linha
  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: [number, number, number] = [0, 0, 0],
    align: 'left' | 'center' = 'left'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      const xPosition = align === 'center' ? pageWidth / 2 : margin;
      doc.text(line, xPosition, yPosition, { align });
      yPosition += fontSize * 0.5;
    });

    yPosition += 3;
  };

  const addSpace = (mm: number) => {
    yPosition += mm;
  };

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  // HEADER
  doc.setDrawColor(30, 58, 95);
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('✝ EXAME DE CONSCIÊNCIA', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Realizado em ${dataAtual}`, pageWidth / 2, 25, { align: 'center' });

  yPosition = 45;

  // CONTEÚDO PRINCIPAL
  if (pecados.length > 0) {
    addText('ÁREAS IDENTIFICADAS PARA CONFISSÃO', 14, true, [30, 58, 95]);
    addSpace(2);
    addLine();
    addSpace(3);

    addText(
      'As seguintes áreas foram identificadas durante seu exame. Reflita sobre elas antes da confissão:',
      10,
      false,
      [74, 85, 104]
    );
    addSpace(5);

    pecados.forEach((pecado, index) => {
      // Círculo com número
      const circleX = margin + 5;
      const circleY = yPosition - 3;
      doc.setFillColor(201, 169, 97);
      doc.circle(circleX, circleY, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(pecado.mandamentoNumero.toString(), circleX, circleY + 1, { align: 'center' });

      // Título do mandamento
      const titleX = circleX + 8;
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      const mandamentoText = pecado.mandamentoNumero > 0 
        ? `${pecado.mandamentoNumero}º Mandamento`
        : 'Mandamentos da Igreja';
      doc.text(mandamentoText, titleX, yPosition);
      yPosition += 6;

      // Descrição
      doc.setTextColor(201, 169, 97);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const descLines = doc.splitTextToSize(pecado.mandamentoTitulo, contentWidth - 15);
      descLines.forEach((line: string) => {
        doc.text(line, titleX, yPosition);
        yPosition += 5;
      });

      yPosition += 2;

      // Perguntas
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Perguntas de reflexão:', titleX, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      pecado.perguntas.forEach((pergunta) => {
        const bulletX = titleX + 3;
        const perguntaX = bulletX + 5;

        doc.setTextColor(201, 169, 97);
        doc.text('•', bulletX, yPosition);

        doc.setTextColor(50, 50, 50);
        const perguntaLines = doc.splitTextToSize(pergunta, contentWidth - 25);
        perguntaLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, perguntaX, yPosition);
          yPosition += 4.5;
        });
        yPosition += 1;
      });

      yPosition += 5;

      // Linha divisória entre mandamentos (se não for o último)
      if (index < pecados.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    });
  } else {
    addText('CONSCIÊNCIA EM PAZ', 14, true, [72, 187, 120], 'center');
    addSpace(3);
    addText(
      'Nenhuma área específica foi identificada neste exame. Continue cultivando sua vida espiritual.',
      11,
      false,
      [74, 85, 104],
      'center'
    );
  }

  // NOVA PÁGINA PARA ATO DE CONTRIÇÃO
  doc.addPage();
  yPosition = margin;

  // Box decorativo para o Ato de Contrição
  doc.setDrawColor(30, 58, 95);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin - 5, yPosition - 5, contentWidth + 10, 120, 3, 3, 'FD');

  yPosition += 5;

  addText('🙏 ATO DE CONTRIÇÃO', 16, true, [30, 58, 95], 'center');
  addSpace(8);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');

  const atoDeContricao = `"Meu Deus, eu me arrependo, de todo o coração, de todos os meus pecados, e os detesto, porque, pecando, ofendi a Vós que sois o sumo Bem e digno de ser amado sobre todas as coisas.

Proponho firmemente, com a ajuda da vossa graça, nunca mais pecar e fugir das ocasiões próximas de pecado.

Senhor, tende piedade de mim, pecador. Ámen."`;

  const atoLines = doc.splitTextToSize(atoDeContricao, contentWidth - 10);
  atoLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  });

  // FOOTER
  yPosition = pageHeight - 25;
  addLine();

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('📱 Gerado pelo app Fides - Fortalecendo sua jornada de fé', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 5;

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    '🔒 Este documento é privado e pessoal. Guarde-o com cuidado.',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  // Salvar o PDF
  const nomeArquivo = `exame-consciencia-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
};
