# SlimifyPDF - Fast & Free PDF Compression

A modern, responsive web application for compressing PDF and other file formats with a beautiful user interface and powerful features.

## 🚀 Features

### Core Features
- **Fast PDF Compression**: Reduce file size by up to 90% while maintaining quality
- **Multiple File Formats**: Support for PDF, DOC, DOCX, PNG, JPG, JPEG
- **User Authentication**: Secure login/signup with Firebase Auth
- **File History**: Track and manage your compression history
- **Cloud Storage**: Save compressed files to Firebase Storage
- **Share Functionality**: Share app and compressed files via social media

### User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Drag & Drop**: Easy file upload with drag and drop support
- **Real-time Progress**: Visual progress indicators during compression
- **Toast Notifications**: Beautiful notifications for user feedback
- **Dark Mode Ready**: Prepared for dark mode implementation

### Technical Features
- **Client-side Compression**: Uses pdf-lib for PDF compression
- **Firebase Integration**: Authentication, Firestore, and Storage
- **PWA Ready**: Service worker for offline capabilities
- **Performance Optimized**: Debounced events and efficient rendering

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: TailwindCSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **PDF Processing**: pdf-lib
- **UI Components**: Font Awesome Icons, SweetAlert2

## 📦 Installation

### Prerequisites
- Node.js (for development)
- Firebase account
- Web server (Apache, Nginx, or local development server)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/slimifypdf.git
   cd slimifypdf
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password, Google, GitHub)
   - Enable Firestore Database
   - Enable Storage
   - Get your Firebase config

3. **Configure Firebase**
   - Open `js/firebase.js`
   - Replace the placeholder config with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

4. **Set up Firebase Security Rules**
   - In Firebase Console, go to Firestore Database > Rules
   - Add these rules:
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

5. **Set up Storage Rules**
   - In Firebase Console, go to Storage > Rules
   - Add these rules:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

6. **Run the application**
   - For local development:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```
   - Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
slimifypdf/
├── index.html              # Landing page
├── auth.html               # Login/Signup page
├── compressor.html         # File compression page
├── dashboard.html          # User dashboard
├── js/
│   ├── firebase.js        # Firebase configuration
│   ├── auth.js            # Authentication logic
│   ├── compressor.js      # File compression logic
│   ├── dashboard.js       # Dashboard functionality
│   ├── share.js           # Social sharing features
│   └── main.js            # General utilities
└── README.md              # This file
```

## 🎯 Usage

### For Users
1. **Landing Page**: Visit the homepage to learn about features
2. **Quick Compression**: Click "Upload & Compress Now" for instant compression
3. **Create Account**: Sign up to save compression history
4. **Dashboard**: View your compression history and statistics
5. **Share**: Share the app with friends via social media

### For Developers
1. **Customization**: Modify colors, branding, and features in the HTML files
2. **API Integration**: Replace pdf-lib with other compression APIs
3. **Monetization**: Add premium features and payment integration
4. **Analytics**: Integrate Google Analytics or other tracking tools

## 🔧 Configuration

### Firebase Setup
- Enable Email/Password authentication
- Enable Google and GitHub providers (optional)
- Set up Firestore database
- Configure Storage rules
- Add your domain to authorized domains

### Customization
- **Colors**: Modify TailwindCSS classes in HTML files
- **Branding**: Update logo, app name, and descriptions
- **Features**: Add/remove features by modifying JavaScript files
- **Styling**: Customize CSS in the `<style>` tags

## 🚀 Deployment

### Static Hosting
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI to deploy
- **GitHub Pages**: Push to GitHub and enable Pages

### Server Deployment
- **Apache**: Place files in `/var/www/html/`
- **Nginx**: Configure server block
- **Docker**: Create Dockerfile for containerization

## 🔒 Security Features

- **Client-side Processing**: Files processed locally when possible
- **Firebase Security Rules**: Proper access control
- **Input Validation**: File type and size validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Firebase handles CSRF protection

## 📊 Performance

- **Lazy Loading**: Images and components load on demand
- **Compression**: Optimized file sizes
- **Caching**: Browser caching for static assets
- **CDN**: Use CDN for external libraries
- **Service Worker**: Offline capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the code comments
- **Community**: Join our Discord/Telegram group

## 🎉 Acknowledgments

- **TailwindCSS**: For the beautiful UI framework
- **Firebase**: For the backend services
- **pdf-lib**: For PDF processing capabilities
- **Font Awesome**: For the icons
- **SweetAlert2**: For beautiful alerts

## 🔮 Future Features

- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Advanced compression algorithms
- [ ] Batch processing
- [ ] API for third-party integration
- [ ] Mobile app (React Native)
- [ ] Premium features
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] File encryption

---

**Made with ❤️ for the community** 