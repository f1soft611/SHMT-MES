declare module 'xlsx' {
  export interface ColInfo {
    wch?: number;
  }

  export interface WorkSheet {
    [cell: string]: unknown;
    '!cols'?: ColInfo[];
  }

  export interface WorkBook {
    SheetNames?: string[];
    Sheets?: Record<string, WorkSheet>;
  }

  export namespace utils {
    function book_new(): WorkBook;
    function json_to_sheet<
      TRow extends Record<string, string | number | boolean | null | undefined>,
    >(data: TRow[]): WorkSheet;
    function json_to_sheet<TRow extends object>(data: TRow[]): WorkSheet;
    function book_append_sheet(
      workbook: WorkBook,
      worksheet: WorkSheet,
      sheetName: string,
    ): void;
  }

  export function writeFile(workbook: WorkBook, fileName: string): void;
}
