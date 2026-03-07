import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const triggerDownload = (blob, fullFileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fullFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 *  CSV to rows
 */
const parseCsvToRows = (csvData) => {
  const workbook = XLSX.read(csvData, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
};

const getWorkbookAndSheet = (csvData) => {
  const workbook = XLSX.read(csvData, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return { workbook, sheet, sheetName };
};

/* ───────────── individual exporters ───────────── */

const exportAsXlsx = (csvData, fileName) => {
  const { workbook } = getWorkbookAndSheet(csvData);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerDownload(blob, `${fileName}.xlsx`);
};

const exportAsXls = (csvData, fileName) => {
  const { workbook } = getWorkbookAndSheet(csvData);
  const buffer = XLSX.write(workbook, { bookType: "xls", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.ms-excel",
  });
  triggerDownload(blob, `${fileName}.xls`);
};

const exportAsCsv = (csvData, fileName) => {
  const { sheet } = getWorkbookAndSheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${fileName}.csv`);
};

const exportAsTsv = (csvData, fileName) => {
  const { sheet } = getWorkbookAndSheet(csvData);
  const tsv = XLSX.utils.sheet_to_csv(sheet, { FS: "\t" });
  const blob = new Blob([tsv], {
    type: "text/tab-separated-values;charset=utf-8;",
  });
  triggerDownload(blob, `${fileName}.tsv`);
};

const exportAsJson = (csvData, fileName) => {
  const { sheet } = getWorkbookAndSheet(csvData);
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  const jsonStr = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, `${fileName}.json`);
};

const exportAsPdf = (csvData, fileName) => {
  const rows = parseCsvToRows(csvData);
  if (!rows.length) return;

  const headers = rows[0] || [];
  const body = rows.slice(1);

  const doc = new jsPDF({ orientation: headers.length > 6 ? "l" : "p" });

  const title = fileName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  doc.setFontSize(14);
  doc.text(title, 14, 18);

  autoTable(doc, {
    startY: 24,
    head: [headers],
    body,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [88, 80, 236], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 10, right: 10 },
    tableWidth: "auto",
  });

  doc.save(`${fileName}.pdf`);
};

const exportAsDoc = (csvData, fileName) => {
  const rows = parseCsvToRows(csvData);
  if (!rows.length) return;

  const headers = rows[0] || [];
  const body = rows.slice(1);

  const title = fileName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; margin: 20px; }
  h1 { font-size: 18px; color: #333; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th { background-color: #5850EC; color: #fff; padding: 6px 8px; font-size: 11px; border: 1px solid #ddd; }
  td { padding: 5px 8px; font-size: 11px; border: 1px solid #ddd; }
  tr:nth-child(even) { background-color: #f5f5fa; }
</style></head>
<body>
<h1>${title}</h1>
<table>
<thead><tr>${headers.map((h) => `<th>${h ?? ""}</th>`).join("")}</tr></thead>
<tbody>
${body
  .map(
    (row) =>
      `<tr>${headers.map((_, i) => `<td>${row[i] ?? ""}</td>`).join("")}</tr>`,
  )
  .join("\n")}
</tbody>
</table>
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  triggerDownload(blob, `${fileName}.doc`);
};

/**
 * Export CSV data to the requested format.
 */
export const exportToExcel = (csvData, fileName = "export", options = {}) => {
  const format = (options.format || "xlsx").toLowerCase();

  if (!csvData) return;

  switch (format) {
    case "csv":
      exportAsCsv(csvData, fileName);
      break;
    case "tsv":
      exportAsTsv(csvData, fileName);
      break;
    case "json":
      exportAsJson(csvData, fileName);
      break;
    case "xls":
      exportAsXls(csvData, fileName);
      break;
    case "pdf":
      exportAsPdf(csvData, fileName);
      break;
    case "doc":
      exportAsDoc(csvData, fileName);
      break;
    case "xlsx":
    default:
      exportAsXlsx(csvData, fileName);
      break;
  }
};
