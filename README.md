# 🍽️ Anthony's Restaurant Guide - Deployment Guide

## 📚 What You're Learning

This project teaches you:
- **Frontend Development** - HTML, CSS, JavaScript, React
- **Backend Development** - Serverless functions
- **API Integration** - Calling external services securely  
- **Deployment** - Putting your app on the internet
- **Version Control** - Using Git and GitHub

---

## 📁 Project Structure

```
restaurant-guide/
├── index.html                          # Your app (runs in browser)
├── netlify.toml                        # Configuration for Netlify
└── netlify/
    └── functions/
        └── fetch-restaurant-data.js    # Backend API (runs on server)
```

### What Each File Does:

**index.html** (Frontend)
- Contains all your restaurant data
- Has the user interface (search, filters, cards)
- Runs in the user's web browser
- Calls the backend function when you click "Auto-Fill"

**netlify.toml** (Configuration)
- Tells Netlify how to deploy your app
- Defines where functions are located
- Sets up routing rules

**fetch-restaurant-data.js** (Backend)
- Runs on Netlify's servers (not in browser)
- Keeps your Google API key secret
- Calls Google Places API
- Returns data to the frontend

---

## 🔒 Security Architecture

**Why we need a backend function:**

```
BAD (Insecure):
Browser → Google API (with API key visible in code)
Anyone can see your API key and use it!

GOOD (Secure):
Browser → Your Backend → Google API (key hidden on server)
API key stays secret, users can't see it!
```

---

## 🚀 Deployment Steps

### Step 1: Get Your Files
- Download all 3 files to your `restaurant-guide` folder
- Keep the folder structure (netlify/functions/ subfolder)

### Step 2: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit - Restaurant Guide"
```

### Step 3: Push to GitHub
```bash
# Create repository on github.com first
git remote add origin https://github.com/YOUR-USERNAME/restaurant-guide.git
git push -u origin main
```

### Step 4: Deploy to Netlify
1. Go to netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Deploy!

### Step 5: Add API Key
1. In Netlify, go to Site Settings
2. Environment Variables
3. Add: `GOOGLE_PLACES_API_KEY` = your key
4. Redeploy

---

## 🎓 Learning Resources

**Want to understand the code better?**

- **React Basics:** https://react.dev/learn
- **JavaScript:** https://javascript.info/
- **Netlify Functions:** https://docs.netlify.com/functions/overview/
- **Google Places API:** https://developers.google.com/maps/documentation/places/web-service

---

## ❓ Troubleshooting

**Error: "API key not configured"**
→ Add your Google API key in Netlify environment variables

**Error: "Function not found"**
→ Make sure `netlify/functions/` folder structure is correct

**Blank page**
→ Check browser console (F12) for errors

---

Need help? Just ask!
