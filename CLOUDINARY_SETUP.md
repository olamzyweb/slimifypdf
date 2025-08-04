# ☁️ Cloudinary Integration Guide

## Quick Setup

### 1. Get Cloudinary Credentials
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your credentials:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### 2. Set Environment Variables in Vercel

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Deploy to Vercel

```bash
vercel
```

## 🎯 How It Works

- **File Upload**: Compressed files are uploaded to Cloudinary
- **Auto-Expiration**: Files are automatically deleted after 15 days
- **User Organization**: Files are stored in `slimifypdf/users/{userId}/` folders
- **Database**: File URLs are saved in Firestore for user history

## 💰 Free Tier Limits

- **25GB storage**
- **25GB bandwidth/month**
- **Automatic file optimization**
- **Global CDN included**

## 🔧 Files Added

- `api/upload.js` - Handles file uploads to Cloudinary
- `api/delete.js` - Handles file deletion from Cloudinary  
- `js/cloudinary.js` - Frontend Cloudinary integration
- `package.json` - Dependencies for Vercel
- `vercel.json` - Vercel configuration

## 🚀 Ready to Deploy!

Your app now uses Cloudinary for file storage with automatic 15-day expiration! 