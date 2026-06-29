// Build a CSV string and trigger a browser download — no server required.
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Question CSV bulk import ----

export const QUESTION_CSV_HEADER = [
  'Question',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'Option E',
  'Option F',
  'Option G',
  'Answer Type',
  'Answer',
  'Question Hint',
];

export interface ParsedQuestion {
  question: string;
  options: string[]; // non-empty options, A..G
  answerType: number; // 0 = single correct, 1 = multiple correct
  answer: string; // raw answer letters, e.g. "a" or "a,c"
  correctIndexes: number[]; // resolved option indexes
  hint: string;
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields and embedded commas/newlines).
export function parseCSVText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseQuestionsCSV(text: string): ParsedQuestion[] {
  const rows = parseCSVText(text).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length === 0) return [];

  // Skip the header row if present.
  const start = rows[0][0]?.trim().toLowerCase() === 'question' ? 1 : 0;
  const out: ParsedQuestion[] = [];

  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    const question = (r[0] ?? '').trim();
    if (!question) continue;

    const options = r.slice(1, 8).map((o) => (o ?? '').trim()).filter(Boolean);
    const answerType = Number((r[8] ?? '0').trim()) || 0;
    const answer = (r[9] ?? '').trim();
    const hint = (r[10] ?? '').trim();
    const correctIndexes = answer
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .map((letter) => letter.charCodeAt(0) - 97) // a -> 0, b -> 1, ...
      .filter((n) => n >= 0 && n < options.length);

    out.push({ question, options, answerType, answer, correctIndexes, hint });
  }
  return out;
}

export function downloadSampleQuestionsCSV() {
  const sampleRows = [
    ['What is the Full form of IT', 'Information', 'Intelligence', 'Technology', '', '', '', '', '0', 'a', 'Think about data + machines'],
    ['load Runner is the part of testing tool.', 'FALSE', 'TRUE', '', '', '', '', '', '0', 'b', ''],
    ['These points comes under HR Policies', 'attendance', 'Client relations', 'leave of absence', 'Account Management', '', '', '', '1', 'a,c', 'Select all that apply'],
  ];
  downloadCSV('sample-questions.csv', [QUESTION_CSV_HEADER, ...sampleRows]);
}

// ---- User CSV bulk import ----

export const USER_CSV_HEADER = ['Full Name', 'Email', 'Password', 'Role', 'Course'];

export interface ParsedUser {
  full_name: string;
  email: string;
  password: string;
  role: string; // raw value from the file
  course: string;
}

export function parseUsersCSV(text: string): ParsedUser[] {
  const rows = parseCSVText(text).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length === 0) return [];

  const firstCell = rows[0][0]?.trim().toLowerCase() ?? '';
  const start = firstCell.includes('name') ? 1 : 0;
  const out: ParsedUser[] = [];

  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    const full_name = (r[0] ?? '').trim();
    const email = (r[1] ?? '').trim();
    if (!full_name || !email) continue;
    out.push({
      full_name,
      email,
      password: (r[2] ?? '').trim(),
      role: (r[3] ?? '').trim(),
      course: (r[4] ?? '').trim(),
    });
  }
  return out;
}

export function downloadSampleUsersCSV() {
  const sampleRows = [
    ['Neha Joshi', 'neha@vinsys.com', 'Student@123', 'Student', 'Full Stack Web Development'],
    ['Amit Verma', 'amit@vinsys.com', 'Trainer@123', 'Trainer', ''],
    ['Kiran Rao', 'kiran@vinsys.com', 'Student@123', 'Student', 'Full Stack Web Development'],
  ];
  downloadCSV('sample-users.csv', [USER_CSV_HEADER, ...sampleRows]);
}
