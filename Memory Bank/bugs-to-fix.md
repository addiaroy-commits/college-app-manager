# 🐛 Bugs to Fix Later

## Majors Page — Best Colleges not saving
- **Issue:** When adding colleges to a top pick in the form modal and clicking Update, the bestColleges array saves as empty `[]`.
- **What was tried:** Direct localStorage, splice, store update, fresh file rewrite — none worked.
- **Clue:** `localStorage.getItem("applywise-top-picks")` shows `bestColleges: []` after saving.
- **Date:** July 2026
