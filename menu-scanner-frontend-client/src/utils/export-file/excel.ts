import { saveAs } from "file-saver";
import ExcelJS from "exceljs";


export interface ExcelColumn {

  header: string;

  key: string;

  width?: number;

  type?: "text" | "number" | "date" | "boolean" | "currency" | "percentage";

  format?: string;

  formula?: string;

  style?: Partial<ExcelJS.Style>;

  hidden?: boolean;

  frozen?: boolean;

  transform?: (value: any, row: any, index: number) => any;
}

export interface ConditionalFormatRule {
  type: "cellIs" | "expression" | "colorScale" | "dataBar" | "iconSet";
  operator?:
    | "equal"
    | "notEqual"
    | "greaterThan"
    | "lessThan"
    | "between"
    | "contains";
  formulae?: string[];
  priority?: number;
  style?: Partial<ExcelJS.Style>;
}

export interface ExcelSheet {

  name: string;

  data: any[];

  columns: ExcelColumn[];

  conditionalFormatting?: Array<{
    ref: string;
    rules: ConditionalFormatRule[];
  }>;

  autoFilter?: boolean;

  freezeRows?: number;

  freezeColumns?: number;

  groupBy?: string[];

  sortBy?: Array<{ key: string; order: "asc" | "desc" }>;

  totals?: Array<{
    column: string;
    type: "sum" | "average" | "count" | "max" | "min";
    label?: string;
  }>;

  rowHeight?: number;

  headerHeight?: number;
}

export interface ExcelExportOptions {

  filename?: string;

  title?: string;

  subtitle?: string;

  author?: string;

  company?: string;

  subject?: string;

  keywords?: string[];

  category?: string;

  description?: string;

  created?: Date;

  modified?: Date;


  headerStyle?: Partial<ExcelJS.Style>;

  titleStyle?: Partial<ExcelJS.Style>;

  subtitleStyle?: Partial<ExcelJS.Style>;

  dataStyle?: Partial<ExcelJS.Style>;

  alternateRowStyle?: Partial<ExcelJS.Style>;

  totalRowStyle?: Partial<ExcelJS.Style>;


  includeBorders?: boolean;

  includeGridlines?: boolean;

  useAlternateRows?: boolean;


  pageSetup?: {
    orientation?: "portrait" | "landscape";
    fitToPage?: boolean;
    fitToWidth?: number;
    fitToHeight?: number;
    paperSize?: number;
    margins?: {
      left?: number;
      right?: number;
      top?: number;
      bottom?: number;
      header?: number;
      footer?: number;
    };
  };


  protection?: {
    password?: string;
    selectLockedCells?: boolean;
    selectUnlockedCells?: boolean;
    formatCells?: boolean;
    formatColumns?: boolean;
    formatRows?: boolean;
    insertColumns?: boolean;
    insertRows?: boolean;
    insertHyperlinks?: boolean;
    deleteColumns?: boolean;
    deleteRows?: boolean;
    sort?: boolean;
    autoFilter?: boolean;
    pivotTables?: boolean;
  };


  customFormatters?: Record<
    string,
    (value: any, row: any, index: number) => string
  >;
  validators?: Record<string, (value: any, row: any, index: number) => boolean>;


  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}


export class ExcelExporter {
  private workbook: ExcelJS.Workbook;
  private options: ExcelExportOptions;
  private defaultOptions: Required<
    Pick<
      ExcelExportOptions,
      | "filename"
      | "includeBorders"
      | "includeGridlines"
      | "useAlternateRows"
      | "headerStyle"
      | "titleStyle"
      | "subtitleStyle"
      | "dataStyle"
      | "alternateRowStyle"
      | "totalRowStyle"
    >
  >;

  constructor(options: ExcelExportOptions = {}) {
    this.workbook = new ExcelJS.Workbook();

    this.defaultOptions = {
      filename: "export.xlsx",
      includeBorders: true,
      includeGridlines: true,
      useAlternateRows: false,
      headerStyle: {
        font: { bold: true, color: { argb: "FFFFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      },
      titleStyle: {
        font: { bold: true, size: 16 },
        alignment: { horizontal: "center", vertical: "middle" },
      },
      subtitleStyle: {
        font: { bold: false, size: 12 },
        alignment: { horizontal: "center", vertical: "middle" },
      },
      dataStyle: {
        alignment: { horizontal: "left", vertical: "middle" },
      },
      alternateRowStyle: {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        },
      },
      totalRowStyle: {
        font: { bold: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE7E6E6" },
        },
      },
    };

    this.options = { ...this.defaultOptions, ...options };
    this.setWorkbookProperties();
  }

  private setWorkbookProperties() {
    this.workbook.creator = this.options.author || "Excel Exporter";
    this.workbook.lastModifiedBy = this.options.author || "Excel Exporter";
    this.workbook.created = this.options.created || new Date();
    this.workbook.modified = this.options.modified || new Date();
    this.workbook.lastPrinted = new Date();

    if (this.options.company) this.workbook.company = this.options.company;
    if (this.options.subject) this.workbook.subject = this.options.subject;
    if (this.options.keywords)
      this.workbook.keywords = this.options.keywords.join(", ");
    if (this.options.category) this.workbook.category = this.options.category;
    if (this.options.description)
      this.workbook.description = this.options.description;
  }


  public addSheet(sheetConfig: ExcelSheet): ExcelJS.Worksheet {
    const worksheet = this.workbook.addWorksheet(sheetConfig.name);
    let currentRow = 1;

    try {

      if (this.options.title) {
        currentRow = this.addTitle(
          worksheet,
          currentRow,
          sheetConfig.columns.length
        );
      }
      if (this.options.subtitle) {
        currentRow = this.addSubtitle(
          worksheet,
          currentRow,
          sheetConfig.columns.length
        );
      }


      let processedData = this.processData(sheetConfig.data, sheetConfig);


      currentRow = this.addHeaders(
        worksheet,
        sheetConfig.columns,
        currentRow,
        sheetConfig.headerHeight
      );


      currentRow = this.addDataRows(
        worksheet,
        processedData,
        sheetConfig.columns,
        currentRow,
        sheetConfig.rowHeight
      );


      if (sheetConfig.totals) {
        this.addTotals(
          worksheet,
          processedData,
          sheetConfig.columns,
          sheetConfig.totals,
          currentRow
        );
      }


      this.applyStyles(worksheet, sheetConfig.columns, currentRow);
      if (sheetConfig.conditionalFormatting) {
        this.applyConditionalFormatting(
          worksheet,
          sheetConfig.conditionalFormatting
        );
      }


      this.configureSheet(worksheet, sheetConfig);

      this.options.onProgress?.(100);
      return worksheet;
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private addTitle(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    columnCount: number
  ): number {
    const titleRange = `A${startRow}:${this.getColumnLetter(
      columnCount
    )}${startRow}`;
    worksheet.mergeCells(titleRange);

    const titleCell = worksheet.getCell(`A${startRow}`);
    titleCell.value = this.options.title;
    titleCell.style = this.options.titleStyle!;

    return startRow + 2;
  }

  private addSubtitle(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    columnCount: number
  ): number {
    const subtitleRange = `A${startRow}:${this.getColumnLetter(
      columnCount
    )}${startRow}`;
    worksheet.mergeCells(subtitleRange);

    const subtitleCell = worksheet.getCell(`A${startRow}`);
    subtitleCell.value = this.options.subtitle;
    subtitleCell.style = this.options.subtitleStyle!;

    return startRow + 2;
  }

  private addHeaders(
    worksheet: ExcelJS.Worksheet,
    columns: ExcelColumn[],
    startRow: number,
    headerHeight?: number
  ): number {
    const visibleColumns = columns.filter((col) => !col.hidden);

    worksheet.columns = visibleColumns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
      style: col.style || {},
    }));

    const headerRow = worksheet.getRow(startRow);
    if (headerHeight) headerRow.height = headerHeight;

    visibleColumns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.style = { ...this.options.headerStyle, ...col.style };
    });

    return startRow + 1;
  }

  private addDataRows(
    worksheet: ExcelJS.Worksheet,
    data: any[],
    columns: ExcelColumn[],
    startRow: number,
    rowHeight?: number
  ): number {
    const visibleColumns = columns.filter((col) => !col.hidden);

    data.forEach((row, index) => {
      const excelRow = worksheet.getRow(startRow + index);
      if (rowHeight) excelRow.height = rowHeight;

      visibleColumns.forEach((col, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        let value = row[col.key];


        if (col.transform) {
          value = col.transform(value, row, index);
        }


        if (this.options.customFormatters?.[col.key]) {
          value = this.options.customFormatters[col.key](value, row, index);
        }


        this.applyTypeFormatting(cell, value, col);


        if (this.options.validators?.[col.key]) {
          if (!this.options.validators[col.key](value, row, index)) {
            cell.style = {
              ...cell.style,
              fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF0000" },
              },
            };
          }
        }


        if (index % 2 === 1 && this.options.useAlternateRows) {
          cell.style = { ...cell.style, ...this.options.alternateRowStyle };
        }
      });
    });

    return startRow + data.length;
  }

  private applyTypeFormatting(
    cell: ExcelJS.Cell,
    value: any,
    col: ExcelColumn
  ) {
    if (col.formula) {

      const formula = col.formula.replace(/\{row\}/g, cell.row.toString());
      cell.value = { formula };
    } else if (col.type === "date" && value) {
      cell.value = new Date(value);
      cell.numFmt = col.format || "mm/dd/yyyy";
    } else if (col.type === "number" && value !== null && value !== undefined) {
      cell.value = Number(value);
      cell.numFmt = col.format || "0.00";
    } else if (
      col.type === "currency" &&
      value !== null &&
      value !== undefined
    ) {
      cell.value = Number(value);
      cell.numFmt = col.format || "$#,##0.00";
    } else if (
      col.type === "percentage" &&
      value !== null &&
      value !== undefined
    ) {
      cell.value = Number(value);
      cell.numFmt = col.format || "0.00%";
    } else if (col.type === "boolean") {
      cell.value = Boolean(value);
    } else {
      cell.value = value;
      if (col.format) cell.numFmt = col.format;
    }
  }

  private addTotals(
    worksheet: ExcelJS.Worksheet,
    data: any[],
    columns: ExcelColumn[],
    totals: ExcelSheet["totals"],
    startRow: number
  ) {
    if (!totals) return;

    const visibleColumns = columns.filter((col) => !col.hidden);
    const totalRow = worksheet.getRow(startRow + 1);

    totals.forEach((total) => {
      const columnIndex = visibleColumns.findIndex(
        (col) => col.key === total.column
      );
      if (columnIndex === -1) return;

      const cell = totalRow.getCell(columnIndex + 1);
      const dataRange = `${this.getColumnLetter(
        columnIndex + 1
      )}2:${this.getColumnLetter(columnIndex + 1)}${startRow}`;

      const formulas = {
        sum: `SUM(${dataRange})`,
        average: `AVERAGE(${dataRange})`,
        count: `COUNT(${dataRange})`,
        max: `MAX(${dataRange})`,
        min: `MIN(${dataRange})`,
      };

      cell.value = { formula: formulas[total.type] };
      cell.style = this.options.totalRowStyle ?? {};
    });


    const labelCell = totalRow.getCell(1);
    labelCell.value = "Total";
    labelCell.style = this.options.totalRowStyle ?? {};
  }

  private processData(data: any[], config: ExcelSheet): any[] {
    let processedData = [...data];


    if (config.sortBy) {
      processedData.sort((a, b) => {
        for (const sort of config.sortBy!) {
          const aValue = a[sort.key];
          const bValue = b[sort.key];

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }


    if (config.groupBy) {
      const grouped = processedData.reduce((acc, item) => {
        const groupKey = config.groupBy!.map((key) => item[key]).join("|");
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      processedData = Object.values(grouped).flat();
    }

    return processedData;
  }

  private applyStyles(
    worksheet: ExcelJS.Worksheet,
    columns: ExcelColumn[],
    dataEndRow: number
  ) {
    if (!this.options.includeBorders) return;

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (this.options.includeBorders) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });
  }

  private applyConditionalFormatting(
    worksheet: ExcelJS.Worksheet,
    formatting: ExcelSheet["conditionalFormatting"]
  ) {
    if (!formatting) return;

    formatting.forEach((format) => {
      worksheet.addConditionalFormatting({
        ref: format.ref,
        rules: format.rules as any,
      });
    });
  }

  private configureSheet(worksheet: ExcelJS.Worksheet, config: ExcelSheet) {

    if (config.autoFilter) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: worksheet.rowCount, column: worksheet.columnCount },
      };
    }


    if (config.freezeRows || config.freezeColumns) {
      worksheet.views = [
        {
          state: "frozen",
          xSplit: config.freezeColumns || 0,
          ySplit: config.freezeRows || 0,
        },
      ];
    }


    if (this.options.pageSetup) {
      worksheet.pageSetup = {
        orientation: this.options.pageSetup.orientation || "portrait",
        fitToPage: this.options.pageSetup.fitToPage || false,
        fitToWidth: this.options.pageSetup.fitToWidth || 1,
        fitToHeight: this.options.pageSetup.fitToHeight || 1,
        paperSize: this.options.pageSetup.paperSize || 9,
        margins: {
          left: this.options.pageSetup.margins?.left ?? 0.7,
          right: this.options.pageSetup.margins?.right ?? 0.7,
          top: this.options.pageSetup.margins?.top ?? 0.75,
          bottom: this.options.pageSetup.margins?.bottom ?? 0.75,
          header: this.options.pageSetup.margins?.header ?? 0.3,
          footer: this.options.pageSetup.margins?.footer ?? 0.3,
        },
      };
    }


    if (this.options.protection) {
      worksheet.protect(
        this.options.protection.password || "",
        this.options.protection
      );
    }
  }

  private getColumnLetter(column: number): string {
    let result = "";
    while (column > 0) {
      column--;
      result = String.fromCharCode(65 + (column % 26)) + result;
      column = Math.floor(column / 26);
    }
    return result;
  }


  public async export(): Promise<void> {
    const buffer = await this.workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, this.options.filename!);
  }


  public async getBuffer(): Promise<ArrayBuffer> {
    return await this.workbook.xlsx.writeBuffer();
  }


  public async getBlob(): Promise<Blob> {
    const buffer = await this.getBuffer();
    return new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }


  public getWorkbook(): ExcelJS.Workbook {
    return this.workbook;
  }
}


export async function quickExport(
  data: any[],
  options: {
    filename?: string;
    sheetName?: string;
    columns?: ExcelColumn[];
    title?: string;
    autoFilter?: boolean;
    sortBy?: ExcelSheet["sortBy"];
  } = {}
) {
  const exporter = new ExcelExporter({
    filename: options.filename || "export.xlsx",
    title: options.title,
  });


  const columns =
    options.columns ||
    (data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          header: key.charAt(0).toUpperCase() + key.slice(1),
          key,
          width: 15,
        }))
      : []);

  const sheetConfig: ExcelSheet = {
    name: options.sheetName || "Sheet1",
    data,
    columns,
    autoFilter: options.autoFilter ?? true,
    sortBy: options.sortBy,
  };

  exporter.addSheet(sheetConfig);
  await exporter.export();
}


export function createStudentScoreExporter(options: ExcelExportOptions = {}) {
  return new ExcelExporter({
    filename: "student-scores.xlsx",
    title: "Student Score Report",
    author: "Academic System",
    subject: "Student Scores",
    ...options,
  });
}


export function getStudentScoreColumns(
  includePersonalInfo: boolean = true
): ExcelColumn[] {
  const columns: ExcelColumn[] = [
    { header: "#", key: "no", width: 8, type: "number" },
    { header: "Student ID", key: "studentId", width: 15 },
  ];

  if (includePersonalInfo) {
    columns.push(
      { header: "Name (KH)", key: "studentNameKhmer", width: 25 },
      { header: "Name (EN)", key: "studentNameEnglish", width: 25 },
      { header: "Gender", key: "gender", width: 10 },
      {
        header: "Birth Date",
        key: "dateOfBirth",
        width: 15,
        type: "date",
        format: "mm/dd/yyyy",
      }
    );
  }

  columns.push(
    {
      header: "Attendance",
      key: "attendanceScore",
      width: 12,
      type: "number",
      format: "0.00",
    },
    {
      header: "Assignment",
      key: "assignmentScore",
      width: 12,
      type: "number",
      format: "0.00",
    },
    {
      header: "Midterm",
      key: "midtermScore",
      width: 12,
      type: "number",
      format: "0.00",
    },
    {
      header: "Final",
      key: "finalScore",
      width: 12,
      type: "number",
      format: "0.00",
    },
    {
      header: "Total",
      key: "totalScore",
      width: 12,
      type: "number",
      format: "0.00",
    },
    { header: "Grade", key: "grade", width: 10 },
    { header: "Comments", key: "comments", width: 30 },
    {
      header: "Created At",
      key: "createdAt",
      width: 18,
      type: "date",
      format: "mm/dd/yyyy hh:mm",
    }
  );

  return columns;
}


export function getGradeConditionalFormatting(
  startRow: number = 2,
  endRow: number = 100
): ExcelSheet["conditionalFormatting"] {
  return [
    {
      ref: `L${startRow}:L${endRow}`,
      rules: [
        {
          type: "cellIs",
          operator: "equal",
          formulae: ['"A"'],
          priority: 1,
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF90EE90" },
            },
            font: { color: { argb: "FF006400" } },
          },
        },
        {
          type: "cellIs",
          operator: "equal",
          formulae: ['"F"'],
          priority: 2,
          style: {
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFF6B6B" },
            },
            font: { color: { argb: "FF8B0000" } },
          },
        },
      ],
    },
  ];
}


export async function exportStudentScores(
  students: any[],
  options: {
    filename?: string;
    title?: string;
    includePersonalInfo?: boolean;
    includeStats?: boolean;
    customColumns?: ExcelColumn[];
  } = {}
) {
  const exporter = createStudentScoreExporter({
    filename: options.filename,
    title: options.title,
  });

  const processedData = students.map((student, index) => ({
    no: index + 1,
    ...student,
  }));

  const columns =
    options.customColumns ||
    getStudentScoreColumns(options.includePersonalInfo);

  const sheetConfig: ExcelSheet = {
    name: "Student Scores",
    data: processedData,
    columns,
    conditionalFormatting: getGradeConditionalFormatting(
      2,
      processedData.length + 1
    ),
    autoFilter: true,
    freezeRows: 1,
    sortBy: [{ key: "totalScore", order: "desc" }],
  };

  if (options.includeStats) {
    sheetConfig.totals = [
      { column: "attendanceScore", type: "average", label: "Average" },
      { column: "assignmentScore", type: "average" },
      { column: "midtermScore", type: "average" },
      { column: "finalScore", type: "average" },
      { column: "totalScore", type: "average" },
    ];
  }

  exporter.addSheet(sheetConfig);
  await exporter.export();
}
