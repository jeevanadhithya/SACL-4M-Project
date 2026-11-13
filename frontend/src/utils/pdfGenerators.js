import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Assets/SakthiLogo.png';

/**
 * Utility: Safe Date Formatter (DD/MM/YYYY)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB');
  } catch (e) {
    return dateStr;
  }
};

/**
 * Utility: Draw official Sakthi form header block
 */
const drawSakthiHeader = (doc, title, qfDocNo, rightMeta = {}) => {
  const startX = 10;
  const startY = 10;

  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);

  // Logo box (left 40mm)
  doc.rect(startX, startY, 40, 20);
  try {
    doc.addImage(logo, 'PNG', startX + 2, startY + 2, 36, 16);
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SAKTHI AUTO', startX + 20, startY + 9, { align: 'center' });
    doc.setFontSize(8);
    doc.text('COMPONENT LTD', startX + 20, startY + 15, { align: 'center' });
  }

  // Title Box (center 105mm)
  doc.rect(startX + 40, startY, 105, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SAKTHI AUTO COMPONENT LIMITED', startX + 40 + 52.5, startY + 7, { align: 'center' });
  doc.setFontSize(10);
  doc.text(title, startX + 40 + 52.5, startY + 14, { align: 'center' });

  // Right Meta Box (45mm)
  doc.rect(startX + 145, startY, 45, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (rightMeta.docNo) {
    doc.text(`Doc No: ${rightMeta.docNo}`, startX + 147, startY + 6);
  }
  if (rightMeta.date) {
    doc.text(`Date: ${formatDate(rightMeta.date)}`, startX + 147, startY + 11);
  }
  if (rightMeta.page) {
    doc.text(`Page: ${rightMeta.page}`, startX + 147, startY + 16);
  } else if (qfDocNo) {
    doc.setFontSize(6.5);
    doc.text(qfDocNo, startX + 147, startY + 16);
  }
};

/**
 * 1. PROCESS CHANGE REQUISITION FORM (QF/07/MRO-15 Rev. 03)
 */
export const generateProcessChangeRequisitionPDF = (formData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const startX = 10;
  let currentY = 10;

  // Header
  drawSakthiHeader(doc, 'PROCESS CHANGE REQUISITION FORM', 'QF/07/MRO-15', {
    docNo: formData.pcrfNo || '-',
    date: formData.date,
  });

  currentY = 32;

  // Meta Section 1
  const metaBody1 = [
    [
      { content: `REQUISITION BY: ${formData.requisitionBy || '-'}`, styles: { halign: 'left' } },
      { content: `REQUISITIONER SIGN: ${formData.requisitionerSign || '-'}`, styles: { halign: 'left' } },
      { content: `PCRF NO: ${formData.pcrfNo || '-'}`, styles: { halign: 'left' } },
    ],
    [
      { content: `DEPARTMENT: ${formData.department || '-'}`, styles: { halign: 'left' } },
      { content: `HOD SIGN: ${formData.hodSign || '-'}`, styles: { halign: 'left' } },
      { content: `DATE: ${formatDate(formData.date) || '-'}`, styles: { halign: 'left' } },
    ],
    [
      { content: `CUSTOMER: ${formData.customer || '-'}`, styles: { halign: 'left' } },
      { content: `PART NAME: ${formData.partName || '-'}`, styles: { halign: 'left' } },
      { content: `PART NO: ${formData.partNo || '-'}`, styles: { halign: 'left' } },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    body: metaBody1,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // 4M Classification Bar with Green Ticks
  const manChecked = !!formData.classification?.man;
  const mcChecked = !!formData.classification?.machine;
  const matChecked = !!formData.classification?.material;
  const methChecked = !!formData.classification?.method;

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    body: [
      [
        { content: 'CLASSIFICATION (4M):', styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [0, 0, 0] } },
        { content: manChecked ? '[✓] MAN' : '[ ] MAN', styles: { textColor: manChecked ? [22, 163, 74] : [80, 80, 80], fontStyle: manChecked ? 'bold' : 'normal' } },
        { content: mcChecked ? '[✓] MACHINE' : '[ ] MACHINE', styles: { textColor: mcChecked ? [22, 163, 74] : [80, 80, 80], fontStyle: mcChecked ? 'bold' : 'normal' } },
        { content: matChecked ? '[✓] MATERIAL' : '[ ] MATERIAL', styles: { textColor: matChecked ? [22, 163, 74] : [80, 80, 80], fontStyle: matChecked ? 'bold' : 'normal' } },
        { content: methChecked ? '[✓] METHOD' : '[ ] METHOD', styles: { textColor: methChecked ? [22, 163, 74] : [80, 80, 80], fontStyle: methChecked ? 'bold' : 'normal' } },
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, halign: 'center' },
  });

  currentY = doc.lastAutoTable.finalY;

  // Details of Change Required Table
  const particularRows = (formData.particularsRows || []).map((row, idx) => {
    const fCheck = row.f ? '[✓]' : '[ ]';
    const mCheck = row.m ? '[✓]' : '[ ]';
    const femCheck = row.fem ? '[✓]' : '[ ]';
    return [
      (idx + 1).toString(),
      row.particular || '-',
      row.currentStatus || '-',
      `${fCheck} F   ${mCheck} M   ${femCheck} F&M`,
    ];
  });

  if (particularRows.length === 0) {
    particularRows.push(['1', '-', '-', '[ ] F  [ ] M  [ ] F&M']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [
      [
        { content: 'S.No', styles: { halign: 'center', cellWidth: 12 } },
        { content: 'PARTICULARS', styles: { halign: 'center' } },
        { content: 'CURRENT STATUS', styles: { halign: 'center' } },
        { content: 'CHANGE REQUIRED', styles: { halign: 'center', cellWidth: 45 } },
      ],
    ],
    body: particularRows,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Reason for Change Required
  const prodCheck = formData.reason?.product ? '[✓]' : '[ ]';
  const procCheck = formData.reason?.process ? '[✓]' : '[ ]';
  const othCheck = formData.reason?.other ? '[✓]' : '[ ]';

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [[{ content: 'REASON FOR CHANGE REQUIRED', styles: { halign: 'center', fontStyle: 'bold' } }]],
    body: [
      [
        {
          content: `CATEGORY:   ${prodCheck} Product   ${procCheck} Process   ${othCheck} Other\nDETAILS: ${formData.reason?.details || '-'}`,
          styles: { halign: 'left', minCellHeight: 12 },
        },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // CFT Comments - Foundry & Machine Shop
  const foundryFeas = formData.foundry?.feasibility ? `[${formData.foundry.feasibility}]` : '';
  const machFeas = formData.machineShop?.feasibility ? `[${formData.machineShop.feasibility}]` : '';

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [
      [
        { content: 'CFT COMMENTS - FOUNDRY', styles: { halign: 'center' } },
        { content: 'CFT COMMENTS - MACHINE SHOP', styles: { halign: 'center' } },
      ],
    ],
    body: [
      [
        {
          content: `Feasibility: ${foundryFeas || '-'}\nComments: ${formData.foundry?.comments || '-'}\n\nLeader Signature: ${formData.foundry?.leaderSign || '-'}   Date: ${formatDate(formData.foundry?.date) || '-'}`,
          styles: { halign: 'left', minCellHeight: 18 },
        },
        {
          content: `Feasibility: ${machFeas || '-'}\nComments: ${formData.machineShop?.comments || '-'}\n\nLeader Signature: ${formData.machineShop?.leaderSign || '-'}   Date: ${formatDate(formData.machineShop?.date) || '-'}`,
          styles: { halign: 'left', minCellHeight: 18 },
        },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Internal Approval
  const appCheck = formData.approval?.approved ? '[✓] APPROVED' : '[ ] APPROVED';
  const rejCheck = formData.approval?.rejected ? '[✓] REJECTED' : '[ ] REJECTED';

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [[{ content: 'INTERNAL APPROVAL', colSpan: 2, styles: { halign: 'center' } }]],
    body: [
      [
        { content: `DECISION: ${appCheck}     ${rejCheck}\nIf others, specify: ${formData.approval?.othersSpecify || '-'}` },
        { content: `Approving Authority: ${formData.approval?.approvingAuthority || 'PLANT HEAD'}\nSignature: ${formData.approval?.signature || '-'}` },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Customer Communication Detail
  const sopCheck = formData.customerCommunication?.changeReflectionInSop ? '[✓]' : '[ ]';
  const fwdCheck = formData.customerCommunication?.nextForwarded ? '[✓]' : '[ ]';

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [[{ content: 'CUSTOMER COMMUNICATION DETAIL', styles: { halign: 'center' } }]],
    body: [
      [
        {
          content: `Communication Notes: ${formData.customerCommunication?.handleNotes || '-'}\n\nActions:  ${sopCheck} Change reflection in SOP      ${fwdCheck} Forwarded to Next Level\nAdditional Notes: ${formData.customerCommunication?.additionalNotes || '-'}`,
          styles: { halign: 'left', minCellHeight: 14 },
        },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  // Footer QF String
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('QF/07/MRO-15, Rev.No: 03 dt 04.10.2021', startX, pageHeight - 8);

  const fileName = `ProcessChangeRequisition_${formData.pcrfNo || formData.date || 'Form'}.pdf`;
  doc.save(fileName);
  return doc;
};

/**
 * 2. FEASIBILITY REPORT FOR CHANGE REQUEST (QF/07/MRO-02)
 */
export const generateFeasibilityReportPDF = (formData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const startX = 10;
  let currentY = 10;

  drawSakthiHeader(doc, 'FEASIBILITY REPORT FOR CHANGE REQUEST', 'QF/07/MRO-02', {
    docNo: formData.slNo || '-',
    date: formData.date,
  });

  currentY = 32;

  // Meta Rows
  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    body: [
      [
        { content: `FROM: ${formData.from || '-'}`, styles: { halign: 'left' } },
        { content: `TO: ${formData.to || 'CFT'}`, styles: { halign: 'left' } },
        { content: `SL NO: ${formData.slNo || '-'}`, styles: { halign: 'left' } },
      ],
      [
        { content: `PART NAME: ${formData.partName || '-'}`, styles: { halign: 'left' } },
        { content: `PART NO: ${formData.partNo || '-'}`, styles: { halign: 'left' } },
        { content: `CUSTOMER: ${formData.customer || '-'}`, styles: { halign: 'left' } },
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Category Table
  const catRows = [
    [
      'Manufacturing Process / Product Requirement',
      formData.manufacturingProcess?.requirements || '-',
      formData.manufacturingProcess?.feasible || '-',
    ],
    [
      'System Requirement',
      formData.systemRequirement?.requirements || '-',
      formData.systemRequirement?.feasible || '-',
    ],
    [
      'Inspection Requirement',
      formData.inspectionRequirement?.requirements || '-',
      formData.inspectionRequirement?.feasible || '-',
    ],
    [
      'Any Other Requirement',
      formData.anyOtherRequirement?.requirements || '-',
      formData.anyOtherRequirement?.feasible || '-',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [
      [
        { content: 'CATEGORY OF CHANGE', styles: { halign: 'center', cellWidth: 55 } },
        { content: 'REQUIREMENTS OF THE CHANGE', styles: { halign: 'center' } },
        { content: 'FEASIBLE / NOT FEASIBLE', styles: { halign: 'center', cellWidth: 40 } },
      ],
    ],
    body: catRows,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Additional Resource Requirement
  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [[{ content: 'ADDITIONAL MANUFACTURING / INSPECTION OR OTHER RESOURCE REQUIREMENT AT FOUNDRY / MACHINE SHOP', styles: { halign: 'left', fontStyle: 'bold' } }]],
    body: [[{ content: formData.additionalManufacturing || 'None / Not Applicable', styles: { minCellHeight: 18 } }]],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Conclusion
  const feasChecked = formData.conclusionFeasible ? '[X] FEASIBLE' : '[ ] FEASIBLE';
  const notFeasChecked = formData.conclusionNotFeasible ? '[X] NOT FEASIBLE' : '[ ] NOT FEASIBLE';

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    body: [
      [
        { content: 'CONCLUSION:', styles: { fontStyle: 'bold', cellWidth: 40, fillColor: [240, 240, 240] } },
        { content: `${feasChecked}        ${notFeasChecked}`, styles: { fontStyle: 'bold' } },
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // CFT Members Signatures (6 members)
  const cftMembers = formData.cftMembers || ['', '', '', '', '', ''];
  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [[{ content: 'CFT MEMBERS SIGN / DATE', colSpan: 2, styles: { halign: 'center' } }]],
    body: [
      [
        { content: `1. ${cftMembers[0] || '-'}\n2. ${cftMembers[1] || '-'}\n3. ${cftMembers[2] || '-'}` },
        { content: `4. ${cftMembers[3] || '-'}\n5. ${cftMembers[4] || '-'}\n6. ${cftMembers[5] || '-'}` },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  currentY = doc.lastAutoTable.finalY;

  // Comments & Forwarded To
  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    body: [
      [
        { content: `COMMENTS: ${formData.comments || '-'}` },
        { content: `FORWARDED TO: ${formData.forwardedTo || 'Acknowledgment'}` },
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
  });

  // Footer QF String
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('QF / 07 / MRO - 02    10 / 06 / 2015', startX, pageHeight - 8);

  const fileName = `FeasibilityReport_${formData.slNo || formData.date || 'Form'}.pdf`;
  doc.save(fileName);
  return doc;
};

/**
 * 3. RISK ANALYSIS CHECK SHEET (QF/07/MKT-14)
 */
export const generateRiskAnalysisPDF = (formData) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const startX = 10;
  let currentY = 10;

  // Header Box
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 40, 20);
  try {
    doc.addImage(logo, 'PNG', 12, 11, 36, 18);
  } catch (err) {
    doc.setFont('helvetica', 'bold');
    doc.text('SAKTHI AUTO', 30, 20, { align: 'center' });
  }

  doc.rect(50, 10, 180, 20);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK ANALYSIS CHECK SHEET', 140, 22, { align: 'center' });

  doc.rect(230, 10, 57, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer: ${formData.customer || '-'}`, 233, 16);
  doc.text(`Date: ${formatDate(formData.date) || '-'}`, 233, 23);

  currentY = 34;

  const riskRows = (formData.riskRows || []).map((r, i) => [
    (i + 1).toString(),
    r.category || '-',
    r.riskPoint || '-',
    r.controlMethod || '-',
    r.high ? '[X]' : '[ ]',
    r.low ? '[X]' : '[ ]',
    r.medium ? '[X]' : '[ ]',
    r.na ? '[X]' : '[ ]',
    r.effectOnQcd || '-',
    r.actions || '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: 10 },
    head: [
      [
        { content: 'S.No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'CATEGORY', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'RISK POINTS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'CONTROL METHOD', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'RISK LEVEL', colSpan: 4, styles: { halign: 'center' } },
        { content: 'EFFECT ON QCD', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'ACTIONS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      ],
      [
        { content: 'H', styles: { halign: 'center' } },
        { content: 'L', styles: { halign: 'center' } },
        { content: 'M', styles: { halign: 'center' } },
        { content: 'NA', styles: { halign: 'center' } },
      ],
    ],
    body: riskRows.length > 0 ? riskRows : [['1', '-', '-', '-', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.15, textColor: [0, 0, 0] },
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('QF/07/MKT-14, Rev.No.02 dt 13.02.2019', startX, pageHeight - 8);

  doc.save(`RiskAnalysis_${formData.date || 'Sheet'}.pdf`);
  return doc;
};
