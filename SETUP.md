# 🚀 SlimifyPDF Setup Guide

This guide will help you set up SlimifyPDF with Firebase and Cloudinary, then deploy it to Vercel.

## 📋 Prerequisites

- Node.js (v14 or higher)
- Git
- Firebase account
- Cloudinary account
- Vercel account (for deployment)

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `slimifypdf`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Enable "Google" provider (optional)
5. Enable "GitHub" provider (optional)

### 3. Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users

### 4. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app with name "SlimifyPDF"
5. Copy the config object

### 5. Update Firebase Config

Replace the `firebaseConfig` in `js/firebase.js` with your config:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};
```

## ☁️ Cloudinary Setup

### 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

### 2. Get Cloudinary Credentials

1. Go to Dashboard
2. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Set Environment Variables

You'll need to set these in Vercel:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- Link to existing project: No
- Project name: slimifypdf
- Directory: ./
- Override settings: No

### 3. Set Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add your Cloudinary credentials:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 4. Alternative: Set via CLI

```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

## 🔧 Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /compressions/{compressionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 🧪 Testing

1. Open your deployed app
2. Try uploading a PDF file
3. Test user registration/login
4. Check if files are saved to Cloudinary
5. Verify dashboard shows compression history
6. Test file deletion (files auto-delete after 15 days)

## 📊 Monitoring

- **Firebase Console**: Monitor authentication and database usage
- **Cloudinary Dashboard**: Monitor storage and bandwidth usage
- **Vercel Dashboard**: Check deployment status and API logs
- **Firebase Analytics**: Track user behavior

## 💰 Cost Management

### Cloudinary Free Tier
- **25GB storage**
- **25GB bandwidth/month**
- **Auto-deletion**: Files expire after 15 days

### Firebase Free Tier
- **10,000 authentications/month**
- **1GB Firestore storage**

## 🆘 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Firebase Auth is enabled
   - Verify config in `js/firebase.js`

2. **Files not uploading to Cloudinary**
   - Check environment variables in Vercel
   - Verify Cloudinary credentials
   - Check API logs in Vercel Dashboard

3. **Dashboard not loading**
   - Check Firestore rules
   - Verify Firestore is enabled

4. **Files not auto-deleting**
   - Cloudinary auto-deletion is set to 15 days
   - Check Cloudinary Dashboard for file status

### Getting Help

- Check Firebase Console for errors
- Review Vercel deployment logs
- Check Cloudinary Dashboard for upload issues
- Check browser console for JavaScript errors

## 🔄 Migration from Firebase Storage

If you were previously using Firebase Storage:

1. **Files**: Old files remain in Firebase Storage
2. **New uploads**: Go to Cloudinary with 15-day expiration
3. **Database**: Compression records include both URLs
4. **Cleanup**: Consider deleting old Firebase Storage files

## 📈 Scaling Considerations

- **High traffic**: Consider upgrading Cloudinary plan
- **Large files**: Implement file size limits
- **User quotas**: Add per-user storage limits
- **CDN**: Cloudinary provides global CDN automatically 