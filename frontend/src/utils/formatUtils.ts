/**
 * 숫자를 천단위 구분 기호로 포맷팅합니다.
 * @param value 숫자 또는 문자열
 * @returns 천단위 구분 기호가 포함된 문자열
 */
export const formatNumberWithCommas = (value: number | string): string => {
  if (value === null || value === undefined) return '0';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 * @param date Date 객체 또는 날짜 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 YYYYMMDD 형식으로 포맷팅합니다.
 * @param date Date 객체
 * @returns YYYYMMDD 형식의 문자열
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환합니다.
 * @param dateStr YYYYMMDD 형식의 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatYYYYMMDDToDate = (dateStr: string): string => {
  if (dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

/**
 * YYYY-MM-DD 형식을 YYYYMMDD 형식으로 변환합니다.
 * @param dateStr YYYY-MM-DD 형식의 문자열
 * @returns YYYYMMDD 형식의 문자열
 */
export const formatDateToYYYYMMDDFromString = (dateStr: string): string => {
  return dateStr.replace(/-/g, '');
};
