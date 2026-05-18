# Firebase Setup & Deployment Guide

This guide will help you set up Firebase Authentication and deploy security rules.

---

## Prerequisites

- Firebase account
- Firebase project: `<your-project-id>`
- Firebase CLI installed (or we'll install it now)

---

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Sign in with your Google account.

---

## Step 3: Initialize Firebase (One-Time Setup)

```bash
cd your-project-directory
firebase init
```

When prompted:

1. **Which Firebase features?**
   - ✓ Firestore
   - ✓ Storage
   - ✓ Hosting (optional, for deployment)

2. **Select a project:**
   - Choose existing project: `<your-project-id>`

3. **Firestore rules file:**
   - Use default: `firestore.rules` (already exists)

4. **Firestore indexes file:**
   - Use default: `firestore.indexes.json`

5. **Storage rules file:**
   - Use default: `storage.rules` (already exists)

6. **Public directory for hosting:**
   - Enter: `dist`

7. **Configure as single-page app:**
   - Yes

8. **Set up automatic builds:**
   - No (we'll build manually)

---

## Step 4: Create Admin User

### Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `<your-project-id>`
3. Click **Authentication** in left sidebar
4. Click **Get Started** (if first time)
5. Go to **Users** tab
6. Click **Add User**
7. Enter:
   - **Email:** admin@adaptivememeticarchitect.com (or your preferred email)
   - **Password:** [Create a strong password]
8. Click **Add User**

**⚠️ IMPORTANT:** Save your admin credentials securely!

### Update Admin Email in Code

If using a different admin email, update these files:

1. **`.env`:**
   ```env
   VITE_ADMIN_EMAIL=your-admin@email.com
   ```

2. **`firestore.rules`** (line 10):
   ```javascript
   && request.auth.token.email == 'your-admin@email.com';
   ```

3. **`storage.rules`** (line 10):
   ```javascript
   && request.auth.token.email == 'your-admin@email.com';
   ```

---

## Step 5: Deploy Security Rules

Deploy Firestore and Storage security rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

Expected output:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/<your-project-id>/overview
```

---

## Step 6: Verify Deployment

### Check Firestore Rules
1. Go to Firebase Console
2. Click **Firestore Database**
3. Click **Rules** tab
4. Verify rules are updated

### Check Storage Rules
1. Go to Firebase Console
2. Click **Storage**
3. Click **Rules** tab
4. Verify rules are updated

---

## Step 7: Test Admin Login

1. Start development server:
   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:5173/admin

3. You should be redirected to: http://localhost:5173/admin/login

4. Login with admin credentials

5. Verify you can:
   - See analytics dashboard
   - View memes list
   - Delete memes

---

## Troubleshooting

### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Error: "Not authorized"
```bash
firebase logout
firebase login
```

### Error: "Invalid email"
Make sure the email in `.env`, `firestore.rules`, and `storage.rules` match the email you created in Firebase Authentication.

### Error: "Rules deployment failed"
1. Check syntax in `firestore.rules` and `storage.rules`
2. Make sure you're in the project directory
3. Run: `firebase deploy --only firestore:rules,storage:rules --debug`

### Admin can't delete memes
1. Verify Firebase rules are deployed
2. Check admin email matches in all files
3. Check browser console for errors
4. Verify user is authenticated (check `/admin` header)

---

## Security Best Practices

### 1. Never Commit `.env` File
✅ Already added to `.gitignore`

### 2. Use Strong Admin Password
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't reuse passwords

### 3. Enable 2FA on Firebase Account
1. Go to Google Account settings
2. Enable 2-Step Verification

### 4. Regularly Review Security Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 5. Monitor Admin Activity
- Check Firebase Console → Authentication → Users
- Review Firestore → Usage tab

---

## Production Deployment

When ready to deploy to production:

1. **Build production bundle:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy
   ```

3. **Or deploy specific services:**
   ```bash
   firebase deploy --only hosting,firestore:rules,storage:rules
   ```

---

## Environment Variables

### Development (`.env`)
Already set up with Firebase credentials.

### Production
If using different Firebase project for production:

1. Create `.env.production`:
   ```env
   VITE_FIREBASE_API_KEY=production_api_key
   VITE_FIREBASE_AUTH_DOMAIN=production_domain
   VITE_FIREBASE_PROJECT_ID=production_project_id
   VITE_FIREBASE_STORAGE_BUCKET=production_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=production_sender_id
   VITE_FIREBASE_APP_ID=production_app_id
   VITE_ADMIN_EMAIL=production_admin@email.com
   ```

2. Build with production env:
   ```bash
   npm run build
   ```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Login | `firebase login` |
| Deploy rules | `firebase deploy --only firestore:rules,storage:rules` |
| Deploy hosting | `firebase deploy --only hosting` |
| Deploy all | `firebase deploy` |
| View projects | `firebase projects:list` |
| Use project | `firebase use <your-project-id>` |

---

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- Project Console: https://console.firebase.google.com/project/<your-project-id>

---

**Status:** Ready for deployment ✅
**Last Updated:** January 1, 2026
