# SmartRoll - QR attendance not saving (debug)

- [x] Add detailed logs inside `AttendanceService.verifyQrAndMarkAttendance()` to trace identity resolution, token lookup, and whether insert branch runs
- [x] Ensure any DB exception is printed (message + stack if available)
- [ ] Re-run QR scan and verify attendance updates for an already-existing row (check logs for `Attendance updated (already existed)` and student dashboard reflects PRESENT + updated time)
