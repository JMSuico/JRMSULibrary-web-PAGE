import { useState } from 'react';
import { useToast } from './useToast';

export function usePdfExport() {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const { showToast } = useToast();

  const exportPdf = async (elementId: string, filenamePrefix: string, periodStr: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    let clone: HTMLElement | null = null;
    try {
      setIsPdfGenerating(true);
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas-pro'),
      ]);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering failed (zero width/height).');
      }
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${filenamePrefix}-${periodStr}-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('PDF downloaded successfully', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsPdfGenerating(false);
    }
  };

  return { isPdfGenerating, exportPdf };
}
