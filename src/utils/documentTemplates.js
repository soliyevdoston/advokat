import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

export const TEMPLATE_LIBRARY = [
  {
    id: 'neighbor_noise',
    title: 'Qo‘shni shovqini bo‘yicha ariza',
    category: 'Maishiy nizolar',
    fields: [
      { key: 'recipient', label: 'Kimga', placeholder: 'Mahalla raisi / IIB bo‘limi', required: true },
      { key: 'sender', label: 'Kimdan (F.I.Sh)', placeholder: 'Ism Familiya', required: true },
      { key: 'address', label: 'Manzil', placeholder: 'Yashash manzili', required: true },
      { key: 'problem', label: 'Muammo tavsifi', placeholder: 'Qachondan beri, qanday shovqin...', required: true },
      { key: 'request', label: 'Talab', placeholder: 'Qonuniy chora ko‘rishingizni so‘rayman', required: true },
      { key: 'date', label: 'Sana', placeholder: '2026-03-26', required: true },
    ],
    build: (v) => [
      `Kimga: ${v.recipient}`,
      `Kimdan: ${v.sender}, ${v.address}`,
      '',
      'ARIZA',
      '',
      `Men, ${v.sender}, quyidagi masala yuzasidan murojaat qilaman.`,
      v.problem,
      '',
      `Talab: ${v.request}.`,
      '',
      "Mazkur murojaatni qonunchilik asosida ko‘rib chiqishingizni so‘rayman.",
      '',
      `Sana: ${v.date}`,
      'Imzo: __________',
    ],
  },
  {
    id: 'debt_claim',
    title: 'Qarz undirish bo‘yicha talabnoma',
    category: 'Fuqarolik huquqi',
    fields: [
      { key: 'creditor', label: 'Kreditor', placeholder: 'F.I.Sh / Tashkilot', required: true },
      { key: 'debtor', label: 'Qarzdor', placeholder: 'F.I.Sh / Tashkilot', required: true },
      { key: 'amount', label: 'Qarz miqdori', placeholder: 'Masalan: 12 000 000 so‘m', required: true },
      { key: 'basis', label: 'Asos', placeholder: 'Qarz shartnomasi / tilxat sanasi', required: true },
      { key: 'deadline', label: 'To‘lash muddati', placeholder: '2026-04-15', required: true },
      { key: 'date', label: 'Sana', placeholder: '2026-03-26', required: true },
    ],
    build: (v) => [
      `Kimdan: ${v.creditor}`,
      `Kimga: ${v.debtor}`,
      '',
      'TALABNOMA',
      '',
      `${v.basis} asosida Sizdan ${v.amount} miqdoridagi qarzdorlikni undirish talabi bildiriladi.`,
      `Mazkur qarzni ${v.deadline} sanasigacha to‘liq to‘lab berishingizni so‘rayman.`,
      '',
      "Aks holda, sud tartibida undirish chorasi ko‘rilishi haqida ogohlantiraman.",
      '',
      `Sana: ${v.date}`,
      'Imzo: __________',
    ],
  },
  {
    id: 'employment_complaint',
    title: 'Mehnat huquqi buzilishi bo‘yicha shikoyat',
    category: 'Mehnat huquqi',
    fields: [
      { key: 'recipient', label: 'Kimga', placeholder: 'Mehnat inspeksiyasi / Korxona rahbari', required: true },
      { key: 'employee', label: 'Xodim F.I.Sh', placeholder: 'Ism Familiya', required: true },
      { key: 'employer', label: 'Ish beruvchi', placeholder: 'Korxona nomi', required: true },
      { key: 'violation', label: 'Buzilish tavsifi', placeholder: 'Ish haqi kechikishi, noqonuniy ishdan bo‘shatish...', required: true },
      { key: 'request', label: 'Talab', placeholder: 'Huquqlarim tiklanishini so‘rayman', required: true },
      { key: 'date', label: 'Sana', placeholder: '2026-03-26', required: true },
    ],
    build: (v) => [
      `Kimga: ${v.recipient}`,
      `Kimdan: ${v.employee}`,
      '',
      'SHIKOYAT',
      '',
      `Men, ${v.employee}, ${v.employer} bilan mehnat munosabatida bo‘lganman/bo‘lib turibman.`,
      `Huquq buzilishi: ${v.violation}.`,
      '',
      `Talab: ${v.request}.`,
      '',
      "Mazkur holatni tekshirishingiz va qonuniy choralar ko‘rishingizni so‘rayman.",
      '',
      `Sana: ${v.date}`,
      'Imzo: __________',
    ],
  },
];

export const findTemplateById = (id) => TEMPLATE_LIBRARY.find((item) => item.id === id) || TEMPLATE_LIBRARY[0];

const normalizeValue = (value) => String(value || '').trim();

const sanitizeFileName = (value) =>
  String(value || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'document';

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 800);
};

export const buildTemplatePreview = (templateId, values = {}) => {
  const template = findTemplateById(templateId);
  const payload = template.fields.reduce((acc, field) => {
    acc[field.key] = normalizeValue(values[field.key]);
    return acc;
  }, {});
  return template.build(payload).join('\n');
};

export const exportTemplateAsDocx = async (templateId, values = {}) => {
  const template = findTemplateById(templateId);
  const content = buildTemplatePreview(templateId, values);
  const rows = content.split('\n');
  const fileName = `${sanitizeFileName(template.title)}.docx`;

  const doc = new Document({
    sections: [
      {
        children: rows.map((row, index) => (
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: row || ' ',
                bold: index === 2 || index === 3 ? true : false,
              }),
            ],
          })
        )),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, fileName);
};

export const exportTemplateAsPdf = (templateId, values = {}) => {
  const template = findTemplateById(templateId);
  const content = buildTemplatePreview(templateId, values);
  const fileName = `${sanitizeFileName(template.title)}.pdf`;
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const marginLeft = 48;
  const marginTop = 52;
  const lineHeight = 18;
  const maxWidth = 500;
  let y = marginTop;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  content.split('\n').forEach((line) => {
    const safe = line || ' ';
    const rows = doc.splitTextToSize(safe, maxWidth);
    rows.forEach((row) => {
      if (y > 780) {
        doc.addPage();
        y = marginTop;
      }
      doc.text(row, marginLeft, y);
      y += lineHeight;
    });
  });

  doc.save(fileName);
};
