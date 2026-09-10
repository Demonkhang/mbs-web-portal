import * as XLSX from 'xlsx';

export interface ParsedScheduleItem {
  dayOfWeek: string;
  date: Date;
  timeSlot: string;
  isAllDay: boolean;
  eventTitle: string;
  leaderName?: string;
  attendees?: string;
  location?: string;
  notes?: string;
}

export interface ParsedScheduleBatch {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  items: ParsedScheduleItem[];
}

/**
 * Calculate ISO week number and year from a Date object
 */
function getWeekNumber(date: Date): { weekNumber: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { weekNumber: weekNo, year: d.getUTCFullYear() };
}

/**
 * Parse DD/MM/YYYY string to Date
 */
function parseVietnameseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day, 8, 0, 0);
  }
  return null;
}

/**
 * Parse Excel Buffer into structured Weekly Schedule Batch
 */
export function parseWeeklyScheduleExcel(buffer: Buffer): ParsedScheduleBatch {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to 2D array of strings
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: '',
  });

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let weekNumber = 1;
  let year = new Date().getFullYear();

  // 1. Find Header Date Range (e.g. (31/08/2026-06/09/2026) or (31/08/2026 - 06/09/2026))
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowText = (rows[i] || []).join(' ');
    const rangeMatch = rowText.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–]\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (rangeMatch) {
      startDate = parseVietnameseDate(rangeMatch[1]);
      endDate = parseVietnameseDate(rangeMatch[2]);
      if (startDate) {
        const weekInfo = getWeekNumber(startDate);
        weekNumber = weekInfo.weekNumber;
        year = weekInfo.year;
      }
      break;
    }
  }

  // Fallback dates if range match failed
  if (!startDate) {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Monday = 1
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek - 1));
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const weekInfo = getWeekNumber(startDate);
    weekNumber = weekInfo.weekNumber;
    year = weekInfo.year;
  }
  if (!endDate) {
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  }

  const items: ParsedScheduleItem[] = [];
  let currentDayText = '';
  let currentDate = new Date(startDate);
  let currentPeriod = ''; // "Sáng" hoặc "Chiều"

  // 2. Iterate through data rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const cellA = (row[0] || '').toString().trim();
    const cellB = (row[1] || '').toString().trim();
    const cellC = (row[2] || '').toString().trim();
    const cellD = (row[3] || '').toString().trim();
    const cellE = (row[4] || '').toString().trim();
    const cellF = (row[5] || '').toString().trim();
    const cellG = (row[6] || '').toString().trim();

    const fullRowText = `${cellA} ${cellB} ${cellC}`.trim();

    // Detect Day Header row (e.g. "Thứ 2, 31/08/2026", "Thứ 3, 01/09/2026", "Chủ nhật, 06/09/2026")
    const dayMatch = fullRowText.match(/^(Thứ\s*[2-7]|Chủ\s*nhật)[,\s]*(\d{1,2}\/\d{1,2}\/\d{4})?/i);
    if (dayMatch) {
      currentDayText = dayMatch[0];
      currentPeriod = '';
      if (dayMatch[2]) {
        const parsedDate = parseVietnameseDate(dayMatch[2]);
        if (parsedDate) currentDate = parsedDate;
      }
      continue;
    }

    // Skip table header row ("Thời gian", "Nội dung", etc.)
    if (cellA.includes('Thời gian') || cellC.includes('Nội dung') || fullRowText.includes('LỊCH TUẦN')) {
      continue;
    }

    // Check Period indicator in Col A ("Sáng", "Chiều", "Cả ngày")
    if (cellA.toLowerCase() === 'sáng') {
      currentPeriod = 'Sáng';
    } else if (cellA.toLowerCase() === 'chiều') {
      currentPeriod = 'Chiều';
    }

    // Valid schedule event row must have content in cellC (Nội dung)
    if (cellC && cellC.length > 2) {
      let timeSlot = cellB || cellA || 'Cả ngày';
      let isAllDay = false;

      if (cellA.toLowerCase().includes('cả ngày') || cellB.toLowerCase().includes('cả ngày')) {
        isAllDay = true;
        timeSlot = cellB ? `Cả ngày (${cellB})` : 'Cả ngày';
      } else {
        if (cellB) {
          timeSlot = cellB;
        } else if (currentPeriod) {
          timeSlot = currentPeriod;
        }
      }

      items.push({
        dayOfWeek: currentDayText || 'Thứ 2',
        date: currentDate ? new Date(currentDate) : new Date(startDate),
        timeSlot: timeSlot || '08:00 - 11:30',
        isAllDay,
        eventTitle: cellC,
        leaderName: cellD || undefined,
        attendees: cellE || undefined,
        location: cellF || undefined,
        notes: cellG || undefined,
      });
    }
  }

  return {
    weekNumber,
    year,
    startDate,
    endDate,
    items,
  };
}
