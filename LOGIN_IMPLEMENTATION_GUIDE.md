# MultiCart Login Implementation Guide

## What Was Fixed

### 1. ✅ Password Storage Issue
**Problem**: Passwords weren't being properly stored/retrieved during login
**Solution**: 
- Added `select: false` to password field in user schema to hide it by default
- Modified auth credentials provider to explicitly include password with `.select("+password")`

### 2. ✅ Password Comparison Errors
**Problem**: bcrypt.compare() was failing when password was null/undefined
**Solution**:
- Added validation to check if password exists before comparison
- Added clear error message for users who registered via Google

### 3. ✅ Credential Validation
**Problem**: Register route had minimal validation
**Solution**:
- Added email format validation
- Added input trimming (removes extra spaces)
- Added password length validation (minimum 6 characters)
- Better error messages

---

## Login Flow (Step by Step)

```
User Login Process:
┌─────────────────────────────────────────────────┐
│ 1. User enters email & password on login page   │
│    (src/app/login/page.tsx)                     │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 2. Frontend calls: signIn("credentials", {...})│
│    Uses NextAuth's built-in client             │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 3. Backend Credentials Provider (auth.ts)      │
│    ✓ Validates email & password provided       │
│    ✓ Queries User with .select("+password")    │
│    ✓ Checks if user exists                     │
│    ✓ Confirms password field is not null       │
│    ✓ Uses bcrypt.compare() on hashed password  │
│    ✓ Returns user data on success              │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 4. JWT Token Created                            │
│    Stores: id, name, email, role                │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│ 5. Session Created & User Redirected to Home   │
└─────────────────────────────────────────────────┘
```

---

## Files Modified

### 1. **src/models/user.model.ts**
```typescript
// BEFORE:
password: { type: String },

// AFTER:
password: { type: String, select: false }, // Hidden by default in queries
```
**Why**: Prevents accidental password exposure in API responses

---

### 2. **src/auth.ts**
```typescript
// BEFORE:
const user = await User.findOne({email})
const isMatch = await bcrypt.compare(password, user.password)

// AFTER:
const user = await User.findOne({email}).select("+password")

if (!user.password) {
    throw new Error("This account was created with Google Sign-In. Please use Google to login.")
}

const isMatch = await bcrypt.compare(password, user.password)
```
**Why**: 
- Explicitly includes password field (which is hidden by default)
- Validates password exists before comparison
- Better error handling for mixed authentication methods

---

### 3. **src/app/api/auth/register/route.ts**
```typescript
// Enhanced validation:
✓ Email format validation
✓ Input trimming (removes spaces)
✓ Email case normalization (lowercase)
✓ Password length validation (6+ characters)
✓ Duplicate email check
✓ Proper error status codes (201 for success, 400 for validation, 500 for server errors)
```

---

## How to Test Login Functionality

### ✅ Test 1: Register a New User
```bash
# Using curl or Postman
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Expected Response (201):
{
  "message": "Registration successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### ✅ Test 2: Login with Correct Credentials
1. Go to http://localhost:3000/login
2. Enter email: `john@example.com`
3. Enter password: `password123`
4. Click Login
5. Should redirect to home page and show logged-in user in session

### ✅ Test 3: Login with Wrong Password
1. Enter correct email but wrong password
2. Should show: "Invalid Email or Password"

### ✅ Test 4: Login with Non-existing Email
1. Enter email that doesn't exist
2. Should show: "Invalid Email or Password"

### ✅ Test 5: Test Password Hashing
Check MongoDB to verify password is stored as bcrypt hash:
```javascript
// In MongoDB, password should look like:
"$2a$10$abcdefghijklmnopqrstuvwxyz..."  // Not plain text!
```

### ✅ Test 6: Test Google Login
1. Click Google button on login page
2. Sign in with Google account
3. Should create new user (no credentials)
4. Trying to login with email/password should fail with:
   "This account was created with Google Sign-In. Please use Google to login."

---

## Security Best Practices Implemented

✅ **Password Hashing**: Uses bcrypt with 10 salt rounds
✅ **Password Not in Responses**: Always excluded from API responses
✅ **Hidden by Default**: `select: false` on schema prevents accidental exposure
✅ **Proper Error Messages**: Don't reveal if email exists (prevents user enumeration... well, partially)
✅ **Input Validation**: Email format and length checks
✅ **Case Insensitive Email**: Stores lowercase for consistency

---

## Troubleshooting

### Issue: "User does not exist" on valid credentials
**Solution**: Verify user was created in MongoDB and password is hashed (not plain text)

### Issue: "Incorrect Password" but password is correct
**Solution**: 
- Check if user was created via Google (different error message)
- Verify password was hashed during registration
- Clear browser cache/cookies and try again

### Issue: "This account was created with Google Sign-In"
**Solution**: User must use Google button to login, not credentials provider

### Issue: Login page redirects but doesn't show user
**Solution**: 
- Check browser console for errors
- Verify session is being set (check cookies)
- Check that routes are protected correctly

---

## Testing with Console/Browser DevTools

### Check if user is logged in:
```javascript
// In browser console:
fetch('/api/currentUser').then(r => r.json()).then(console.log)
```

### Check session data:
```javascript
// If using next-auth client:
import { useSession } from 'next-auth/react'
// In a client component:
const { data: session } = useSession()
console.log(session?.user)
```

---

## Environment Variables Needed

Make sure your `.env.local` has:
```
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000  # or your production URL
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Next Steps (Future Improvements)

- [ ] Add password reset functionality
- [ ] Add email verification on signup
- [ ] Implement rate limiting on login attempts
- [ ] Add two-factor authentication
- [ ] Add remember me functionality
- [ ] Session timeout and refresh token handling
