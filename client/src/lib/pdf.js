import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Rasterizes a full-size (794px wide) resume node and paginates it into A4 PDF pages.
 * The node should render the complete resume at natural height.
 */
export async function downloadResumePdf(node, filename = 'resume.pdf') {
  if (!node) throw new Error('Nothing to export yet.');

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 794,
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageHeightPx = Math.floor((canvas.width * pageHeight) / pageWidth);

  let offset = 0;
  let page = 0;
  while (offset < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceHeight;
    const ctx = slice.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (page > 0) pdf.addPage();
    const renderHeight = (sliceHeight * pageWidth) / canvas.width;
    pdf.addImage(slice.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, pageWidth, renderHeight);

    offset += sliceHeight;
    page += 1;
    if (page > 12) break;
  }

  pdf.save(filename);
}
