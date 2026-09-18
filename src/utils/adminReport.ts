type CellValue = string | number | null | undefined;
type Row = Record<string, CellValue>;

const escapeXml = (value: CellValue) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cellXml = (value: CellValue) => {
  const numeric = typeof value === "number" && Number.isFinite(value);
  return `<Cell><Data ss:Type="${numeric ? "Number" : "String"}">${escapeXml(value)}</Data></Cell>`;
};

const worksheetXml = (name: string, rows: Row[]) => {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const headerRow = headers.map((header) => cellXml(header)).join("");
  const dataRows = rows
    .map((row) => `<Row>${headers.map((header) => cellXml(row[header])).join("")}</Row>`)
    .join("");

  return `<Worksheet ss:Name="${escapeXml(name)}"><Table><Row>${headerRow}</Row>${dataRows}</Table></Worksheet>`;
};

export const downloadAdminReport = (stats: any) => {
  const summary: Row[] = [
    { Metrica: "Total Productos", Valor: Number(stats?.charts?.benefitsDistribution?.total || 0) },
    { Metrica: "Productos disponibles", Valor: Number(stats?.charts?.benefitsDistribution?.costs || 0) },
    { Metrica: "Productos ocupados", Valor: Number(stats?.charts?.benefitsDistribution?.taxes || 0) },
    { Metrica: "Interacciones WhatsApp", Valor: Number(stats?.revenue?.total || 0) },
    { Metrica: "Visitas a Productos", Valor: Number(stats?.revenue?.expenses || 0) },
  ];

  const months: Row[] = (stats?.charts?.monthlyLabels || []).map((label: string, index: number) => ({
    Mes: label,
    Interacciones: Number(stats?.charts?.monthlyRevenue?.[index] || 0),
  }));

  const activity: Row[] = (stats?.recentActivity || []).map((item: any) => ({
    Actividad: item?.text || "",
    Tiempo: item?.time || "",
  }));

  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${worksheetXml("Resumen General", summary)}
 ${worksheetXml("Interacciones Mensuales", months)}
 ${worksheetXml("Actividad Reciente", activity)}
</Workbook>`;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `Reporte_Angelita_Admin_${date}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
