# AttendEase — Attractive Attendance System

Just open `index.html` in any browser (double-click it). No install needed. Internet needed once for Excel library (SheetJS CDN).

## Features
- 📋 Pre-loaded UID + Names (edit in code once)
- ✓ / ✕ / ⏳ Present / Absent / Leave per student
- 🔍 Live search + filter (Present / Absent / Leave / Unmarked)
- ⚡ Mark All Present / Absent / Reset / Alternate
- 📊 Live stats + progress bar + auto-save per date
- 📥 One-click **Excel file** with 2 sheets: `Attendance` + `Summary`
- ➕ Add / remove students, CSV backup, Print

## Set your pre-loaded list (30 seconds)
Open `index.html`, find:
```js
const PRELOADED_STUDENTS = [
  { uid: "STU001", name: "Aarav Sharma" },
  ...
];
```
Replace with your data:
```js
const PRELOADED_STUDENTS = [
  { uid: "24CS001", name: "Priya Verma" },
  { uid: "24CS002", name: "Rahul Kumar" },
];
```
Save + refresh. Done.

## Excel output columns
`S.No | UID | Name | Status | Date | Class / Subject | Remarks`
File name: `Attendance_<Class>_<YYYY-MM-DD>.xlsx`

## Run locally
```bash
cd attendance-system
python3 -m http.server 8000
# open http://localhost:8000
```
Or just double-click `index.html`.
