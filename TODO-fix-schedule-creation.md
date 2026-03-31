# Fix Admin Schedule Creation 403 Error

**Root cause:** JwtFilter likely failing silently during token validation (missing logger or JwtUtil error), not setting authentication, @PreAuthorize fails.

**Steps:**

1. Add proper logging to JwtFilter.java to debug token parsing.
2. Read and verify JwtUtil.java token parsing.
3. Edit JwtFilter to log token details.
4. Rebuild backend.
5. Test.

**Status:**

- [x] Step 1: Added detailed logging to JwtFilter.java
- [x] Step 2: Verified JwtUtil.java
- [ ] Step 3: Rebuild backend (`mvn clean compile` executed successfully)
- [ ] Step 4: Restart backend server if running
- [ ] Step 5: Test schedule creation, check backend logs for debug messages
- [ ] Step 6: If token invalid, relogin as admin and test.
