import { jsPDF } from 'jspdf';
import {
  calculateInvoiceTotals,
  formatInvoiceDate,
  formatMoney,
} from '../data/defaults';
import { CompanyProfile, InvoiceDraft } from '../types/invoice';
import { getCleanPaidStampDataUrl } from './paidStamp';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return [r, g, b];
    }
  }
  return [16, 126, 135];
}

function drawTkmVectorLogo(
  doc: jsPDF,
  rightX: number,
  topY: number,
  brandTitle: string,
  brandSubtitle: string,
  accentHex: string,
  logoWidthPct: number,
  logoHeightPct: number
): number {
  const [r, g, b] = hexToRgb(accentHex);
  const scaleX = Math.min(2.2, Math.max(0.4, (logoWidthPct || 100) / 100));
  const scaleY = Math.min(2.2, Math.max(0.4, (logoHeightPct || 100) / 100));
  const avgScale = (scaleX + scaleY) / 2;
  const isDefaultTkm = brandTitle.trim().toUpperCase() === 'TKM';

  if (isDefaultTkm) {
    const logoWidth = 36 * scaleX;
    const logoHeight = (36 * 52) / 136 * scaleY;
    const x0 = rightX - logoWidth;
    const sx = logoWidth / 136;
    const sy = logoHeight / 52;

    doc.setFillColor(r, g, b);
    doc.rect(x0 + 2 * sx, topY + 4 * sy, 32 * sx, 7 * sy, 'F');
    doc.rect(x0 + 14 * sx, topY + 15 * sy, 8 * sx, 33 * sy, 'F');

    doc.rect(x0 + 41 * sx, topY + 4 * sy, 8 * sx, 44 * sy, 'F');
    doc.triangle(
      x0 + 49 * sx,
      topY + 27 * sy,
      x0 + 67 * sx,
      topY + 4 * sy,
      x0 + 77 * sx,
      topY + 4 * sy,
      'F'
    );
    doc.triangle(
      x0 + 49 * sx,
      topY + 27 * sy,
      x0 + 77 * sx,
      topY + 4 * sy,
      x0 + 57 * sx,
      topY + 26 * sy,
      'F'
    );
    doc.triangle(
      x0 + 49 * sx,
      topY + 27 * sy,
      x0 + 57 * sx,
      topY + 26 * sy,
      x0 + 78 * sx,
      topY + 48 * sy,
      'F'
    );
    doc.triangle(
      x0 + 49 * sx,
      topY + 27 * sy,
      x0 + 78 * sx,
      topY + 48 * sy,
      x0 + 68 * sx,
      topY + 48 * sy,
      'F'
    );

    doc.rect(x0 + 84 * sx, topY + 14 * sy, 8 * sx, 34 * sy, 'F');
    doc.rect(x0 + 124 * sx, topY + 14 * sy, 8 * sx, 34 * sy, 'F');
    doc.triangle(
      x0 + 84 * sx,
      topY + 14 * sy,
      x0 + 94 * sx,
      topY + 4 * sy,
      x0 + 101 * sx,
      topY + 14 * sy,
      'F'
    );
    doc.triangle(
      x0 + 115 * sx,
      topY + 14 * sy,
      x0 + 122 * sx,
      topY + 4 * sy,
      x0 + 132 * sx,
      topY + 14 * sy,
      'F'
    );
    doc.triangle(
      x0 + 93 * sx,
      topY + 10 * sy,
      x0 + 101 * sx,
      topY + 10 * sy,
      x0 + 108 * sx,
      topY + 28 * sy,
      'F'
    );
    doc.triangle(
      x0 + 115 * sx,
      topY + 10 * sy,
      x0 + 123 * sx,
      topY + 10 * sy,
      x0 + 108 * sx,
      topY + 28 * sy,
      'F'
    );
    doc.triangle(
      x0 + 104 * sx,
      topY + 26 * sy,
      x0 + 112 * sx,
      topY + 26 * sy,
      x0 + 108 * sx,
      topY + 16 * sy,
      'F'
    );

    let bottomY = topY + logoHeight;
    if (brandSubtitle.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5 * avgScale);
      doc.setTextColor(26, 26, 26);
      doc.text(
        brandSubtitle.toUpperCase(),
        rightX - logoWidth / 2,
        bottomY + 4.5 * avgScale,
        {
          align: 'center',
          charSpace: 0.7 * scaleX,
        }
      );
      bottomY += 6.8 * avgScale;
    }
    return bottomY;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22 * avgScale);
  doc.setTextColor(r, g, b);
  doc.text(brandTitle || 'BRAND', rightX, topY + 8 * scaleY, {
    align: 'right',
  });
  let bottomY = topY + 10 * scaleY;
  if (brandSubtitle.trim()) {
    doc.setFontSize(9.5 * avgScale);
    doc.setTextColor(26, 26, 26);
    doc.text(brandSubtitle.toUpperCase(), rightX, bottomY + 4 * scaleY, {
      align: 'right',
      charSpace: 0.6 * scaleX,
    });
    bottomY += 6 * scaleY;
  }
  return bottomY;
}

function drawBottomWave(doc: jsPDF) {
  doc.setFillColor(183, 220, 225);
  const steps = 40;
  const p0 = { x: 0, y: 289.5 };
  const p1 = { x: 35, y: 281.5 };
  const p2 = { x: 82, y: 282.5 };
  const p3 = { x: 118, y: 297 };

  const points: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x =
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y;
    points.push([x, y]);
  }

  for (let i = 0; i < points.length - 1; i++) {
    doc.triangle(
      0,
      297,
      points[i][0],
      points[i][1],
      points[i + 1][0],
      points[i + 1][1],
      'F'
    );
  }
}

export async function generateInvoicePDF(
  invoice: InvoiceDraft,
  profile: CompanyProfile
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const leftMargin = 20;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin; // 170mm
  const totals = calculateInvoiceTotals(invoice);
  const logoW = profile.logoWidth ?? profile.logoSize ?? 100;
  const logoH = profile.logoHeight ?? profile.logoSize ?? 100;
  const scaleX = Math.min(2.2, Math.max(0.4, logoW / 100));
  const scaleY = Math.min(2.2, Math.max(0.4, logoH / 100));

  // --- Top Left: INVOICE Display Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(26, 26, 26);
  doc.text('INVOICE', leftMargin, 25);

  // --- Top Right: Scaled Logo & Address ---
  let logoBottomY = 14;
  if (profile.customLogoDataUrl) {
    try {
      const imgW = 38 * scaleX;
      const imgH = 15.5 * scaleY;
      doc.addImage(
        profile.customLogoDataUrl,
        'PNG',
        rightMargin - imgW,
        14,
        imgW,
        imgH,
        undefined,
        'FAST'
      );
      logoBottomY = 14 + imgH;
    } catch {
      logoBottomY = drawTkmVectorLogo(
        doc,
        rightMargin,
        14,
        profile.brandTitle,
        profile.brandSubtitle,
        profile.accentColor,
        logoW,
        logoH
      );
    }
  } else {
    logoBottomY = drawTkmVectorLogo(
      doc,
      rightMargin,
      14,
      profile.brandTitle,
      profile.brandSubtitle,
      profile.accentColor,
      logoW,
      logoH
    );
  }

  let addrY = logoBottomY + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(34, 34, 34);
  if (profile.addressLine1) {
    doc.text(profile.addressLine1, rightMargin, addrY, { align: 'right' });
    addrY += 4.4;
  }
  if (profile.addressLine2) {
    doc.text(profile.addressLine2, rightMargin, addrY, { align: 'right' });
    addrY += 4.4;
  }
  if (profile.phone) {
    doc.text(profile.phone, rightMargin, addrY, { align: 'right' });
    addrY += 4.4;
  }

  // --- Date & Invoice Number Row ---
  let curY = Math.max(38, addrY + 8);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 26, 26);
  doc.text('Date:', leftMargin, curY);
  const dateLblW = doc.getTextWidth('Date: ');
  doc.setFont('helvetica', 'normal');
  doc.text(formatInvoiceDate(invoice.dateISO) || '—', leftMargin + dateLblW + 1, curY);

  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber || 'INV-0001', rightMargin, curY, {
    align: 'right',
  });

  // --- Customer Details ---
  curY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', leftMargin, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName || '—', leftMargin + 16, curY);

  curY += 5.8;
  doc.setFont('helvetica', 'bold');
  doc.text('City:', leftMargin, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerCity || '—', leftMargin + 16, curY);

  if (invoice.customerPhone.trim()) {
    curY += 5.8;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', leftMargin, curY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerPhone, leftMargin + 16, curY);
  }

  // --- Items Table ---
  curY += 10;
  const colItemX = leftMargin + 3;
  const colQtyX = leftMargin + 94;
  const colPriceX = leftMargin + 130;
  const colAmtX = rightMargin - 3;

  const drawTableHeader = (headerY: number) => {
    doc.setFillColor(234, 234, 234);
    doc.rect(leftMargin, headerY, contentWidth, 9.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(26, 26, 26);
    doc.text('Product Name', colItemX, headerY + 6.3);
    doc.text('Quantity', colQtyX, headerY + 6.3, { align: 'center' });
    doc.text('Unit Price', colPriceX, headerY + 6.3, { align: 'right' });
    doc.text('Amount', colAmtX, headerY + 6.3, { align: 'right' });
  };

  drawTableHeader(curY);
  curY += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(34, 34, 34);

  if (invoice.items.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('No line items', leftMargin + contentWidth / 2, curY + 4, {
      align: 'center',
    });
    curY += 12;
  } else {
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const wrappedName = doc.splitTextToSize(
        item.name || 'Untitled Product',
        74
      );
      const rowHeight = Math.max(7.2, wrappedName.length * 4.8 + 2.2);

      if (curY + rowHeight > 220) {
        drawBottomWave(doc);
        doc.addPage();
        curY = 20;
        drawTableHeader(curY);
        curY += 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(34, 34, 34);
      }

      const amount = (item.quantity || 0) * (item.price || 0);
      doc.text(wrappedName, colItemX, curY);
      doc.text(String(item.quantity), colQtyX, curY, { align: 'center' });
      doc.text(formatMoney(item.price, profile), colPriceX, curY, {
        align: 'right',
      });
      doc.text(formatMoney(amount, profile), colAmtX, curY, {
        align: 'right',
      });

      curY += rowHeight;
    }
  }

  // Bottom border line under table
  curY += 2;
  doc.setDrawColor(226, 228, 232);
  doc.setLineWidth(0.35);
  doc.line(leftMargin, curY, rightMargin, curY);

  // --- Totals Section ---
  curY += 8.5;
  if (curY > 215) {
    drawBottomWave(doc);
    doc.addPage();
    curY = 24;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(26, 26, 26);

  const totalsTopY = curY;
  const labelRightX = rightMargin - 42;
  const valRightX = colAmtX;

  doc.text('Total', labelRightX, curY, { align: 'right' });
  doc.text(formatMoney(totals.subtotal, profile), valRightX, curY, {
    align: 'right',
  });

  if (totals.discountAmount > 0) {
    curY += 7.2;
    const discountLabel =
      invoice.discountType === 'percent'
        ? `Dis ${invoice.discountValue}%`
        : 'Discount';
    doc.text(discountLabel, labelRightX, curY, { align: 'right' });
    doc.text(formatMoney(totals.discountAmount, profile), valRightX, curY, {
      align: 'right',
    });
  }

  if (totals.deliveryCharges > 0) {
    curY += 7.2;
    doc.text('Delivery Charges', labelRightX, curY, { align: 'right' });
    doc.text(formatMoney(totals.deliveryCharges, profile), valRightX, curY, {
      align: 'right',
    });
  }

  if (totals.taxAmount > 0) {
    curY += 7.2;
    doc.setFontSize(11.5);
    doc.text(`Tax ${invoice.taxPercent}%`, labelRightX, curY, { align: 'right' });
    doc.text(formatMoney(totals.taxAmount, profile), valRightX, curY, {
      align: 'right',
    });
    doc.setFontSize(14.5);
  }

  curY += 7.5;
  doc.text('Grand Total', labelRightX, curY, { align: 'right' });
  doc.text(formatMoney(totals.grandTotal, profile), valRightX, curY, {
    align: 'right',
  });

  if (invoice.isPaid) {
    try {
      const stampDataUrl = await getCleanPaidStampDataUrl();
      const stampW = 49;
      const stampH = (stampW * 380) / 525;
      const stampY = Math.max(20, totalsTopY - 4);
      doc.addImage(
        stampDataUrl,
        'PNG',
        leftMargin + 3,
        stampY,
        stampW,
        stampH,
        undefined,
        'FAST'
      );
      curY = Math.max(curY, stampY + stampH);
    } catch {
      // Skip stamp if image decode fails
    }
  }

  if (invoice.notes.trim()) {
    curY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('Notes:', leftMargin, curY);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, 145);
    doc.text(noteLines, leftMargin + 12, curY);
    curY += noteLines.length * 4.2;
  }

  // --- Post-Total Footer Section: Thank You + Contact Details (Left) & Account Details (Right) ---
  const hasContactDetails = Boolean(
    profile.website?.trim() ||
      profile.email?.trim() ||
      profile.whatsapp?.trim()
  );
  const hasAccountDetails = Boolean(
    !invoice.isPaid &&
      (profile.companyName?.trim() ||
        profile.bankName?.trim() ||
        profile.accountNumber?.trim() ||
        profile.branchCode?.trim() ||
        profile.accountType?.trim())
  );
  const hasThankYou = Boolean(invoice.thankYouText?.trim());

  if (hasThankYou || hasContactDetails || hasAccountDetails) {
    // Anchor neatly in the lower portion above the stamp/wave, or push down if content is long
    const thankYouLines = hasThankYou
      ? doc.splitTextToSize(invoice.thankYouText.trim(), contentWidth)
      : [];
    const thankYouHeight = hasThankYou ? 6 + thankYouLines.length * 4.4 + 4 : 0;
    const footerBlockHeight = thankYouHeight + 34;
    const minFooterY = Math.max(curY + 10, 256 - footerBlockHeight);

    let fY = minFooterY;
    if (fY + footerBlockHeight > 260) {
      drawBottomWave(doc);
      doc.addPage();
      fY = 24;
    }

    // Hairline separator
    doc.setDrawColor(226, 228, 232);
    doc.setLineWidth(0.35);
    doc.line(leftMargin, fY, rightMargin, fY);
    fY += 6.5;

    if (hasThankYou) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      doc.text('Thank You', leftMargin, fY);
      fY += 4.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(51, 51, 51);
      doc.text(thankYouLines, leftMargin, fY);
      fY += thankYouLines.length * 4.3 + 5;
    }

    // Side-by-side Contact Details (Bottom Left) & Account Details For Payments (Bottom Right)
    const colTopY = fY;

    if (hasContactDetails) {
      let cY = colTopY;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      const contactTitle = 'Contact Details:';
      doc.text(contactTitle, leftMargin, cY);
      const contactW = doc.getTextWidth(contactTitle);
      doc.setDrawColor(17, 17, 17);
      doc.setLineWidth(0.3);
      doc.line(leftMargin, cY + 1, leftMargin + contactW, cY + 1);
      cY += 5.5;

      doc.setFontSize(9);
      if (profile.website?.trim()) {
        doc.setFont('helvetica', 'bold');
        const lbl = 'Website: ';
        doc.text(lbl, leftMargin, cY);
        doc.setFont('helvetica', 'normal');
        doc.text(profile.website.trim(), leftMargin + doc.getTextWidth(lbl), cY);
        cY += 4.5;
      }
      if (profile.email?.trim()) {
        doc.setFont('helvetica', 'bold');
        const lbl = 'Email: ';
        doc.text(lbl, leftMargin, cY);
        doc.setFont('helvetica', 'normal');
        doc.text(profile.email.trim(), leftMargin + doc.getTextWidth(lbl), cY);
        cY += 4.5;
      }
      if (profile.whatsapp?.trim()) {
        doc.setFont('helvetica', 'bold');
        const lbl = 'WhatsApp: ';
        doc.text(lbl, leftMargin, cY);
        doc.setFont('helvetica', 'normal');
        doc.text(profile.whatsapp.trim(), leftMargin + doc.getTextWidth(lbl), cY);
      }
    }

    if (hasAccountDetails) {
      let aY = colTopY;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      const acctTitle = 'Account Details For Payments:';
      doc.text(acctTitle, rightMargin, aY, { align: 'right' });
      const acctW = doc.getTextWidth(acctTitle);
      doc.setDrawColor(17, 17, 17);
      doc.setLineWidth(0.3);
      doc.line(rightMargin - acctW, aY + 1, rightMargin, aY + 1);
      aY += 5.5;

      doc.setFontSize(9);
      if (profile.companyName?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Account Title: ${profile.companyName.toUpperCase()}`,
          rightMargin,
          aY,
          {
            align: 'right',
          }
        );
        aY += 4.5;
      }
      if (profile.bankName?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Bank: ${profile.bankName}`, rightMargin, aY, {
          align: 'right',
        });
        aY += 4.5;
      }
      if (profile.accountNumber?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Account Number: ${profile.accountNumber}`, rightMargin, aY, {
          align: 'right',
        });
        aY += 4.5;
      }
      if (profile.branchCode?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Branch Code: ${profile.branchCode}`, rightMargin, aY, {
          align: 'right',
        });
        aY += 4.5;
      }
      if (profile.accountType?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Account Type: ${profile.accountType}`, rightMargin, aY, {
          align: 'right',
        });
      }
    }
  }

  // --- Bottom Wave ---
  drawBottomWave(doc);

  const safeFileName = (invoice.invoiceNumber || 'Invoice')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .trim();
  doc.save(`${safeFileName}.pdf`);
}
