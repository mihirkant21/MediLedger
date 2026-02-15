# MediLedger - Quick Start Guide

##  Get Started in 5 Minutes

### Step 1: Install Dependencies (5 min)

```bash
# Terminal 1 - Frontend
cd frontend
npm install

# Terminal 2 - Backend
cd backend
npm install

# Terminal 3 - OCR Service
cd ocr-service
python -m venv venv
# macOS / Linux: source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt

# Terminal 4 - Blockchain Service
cd blockchain-service
npm install
```

### Step 2: Set Up Environment Variables (2 min)

```bash
# Backend (.env)
cd backend
cp .env.example .env
# Edit .env:
MONGODB_URI=mongodb://localhost:27017/MediLedger
JWT_SECRET=your_random_secret_here_min_32_chars

# Frontend (.env)
cd frontend
cp .env.example .env
# Edit .env:
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB (1 min)

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name MediLedger-mongo mongo

# OR install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Then: sudo systemctl start mongod
```

### Step 4: Start All Services (1 min)

```bash
# Terminal 1 - Frontend (port 5173)
cd frontend && npm run dev

# Terminal 2 - Backend (port 5000)
cd backend && npm run dev

# Terminal 3 - OCR Service (port 8000)
cd ocr-service && python app.py

# Terminal 4 - Blockchain Service
cd blockchain-service && npm start
```

### Step 5: Open Application (10 seconds)

Open browser and navigate to: `http://localhost:5173`

Create an account and start uploading medical documents!

---

##  What You Get

**Full-Stack Medical Records System**
- React frontend with modern UI
- Node.js/Express backend API
- MongoDB database
- Python OCR service
- Blockchain verification

**Key Features**
- User authentication (JWT)
- Document upload with drag & drop
- OCR text extraction from images/PDFs
- Preview and edit OCR results
- Medical timeline view
- Blockchain document hashing
- Document verification

**Technology Stack**
- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **OCR**: Python, FastAPI, Tesseract
- **Blockchain**: Solidity, Ethers.js
- **AI**: Grok API integration ready

---

## Project Structure Overview

```
medical-history-app/
├── frontend/          → React app (localhost:5173)
├── backend/           → Express API (localhost:5000)
├── ocr-service/       → Python OCR (localhost:8000)
├── blockchain-service/ → Smart contracts
└── README.md          → Project overview
```

---

## Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution**: Make sure MongoDB is running on port 27017
```bash
# Check if MongoDB is running
docker ps  # If using Docker
# OR
sudo systemctl status mongod  # If installed locally
```

### Issue: Port already in use
**Solution**: Change port in .env files or kill process
```bash
# Find process using port 5173 (macOS / Linux)
lsof -ti:5173  # Get PID
kill -9 <PID>  # Kill process

# On Windows (PowerShell)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: OCR not working
**Solution**: Install Tesseract OCR
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### Issue: CORS errors
**Solution**: Update CORS_ORIGIN in backend/.env
```env
CORS_ORIGIN=http://localhost:5173
```

---

## Test the Application

### 1. Register a User
- Go to http://localhost:5173/register
- Fill in the form
- Click "Create Account"

### 2. Upload a Document
- Click "Upload Document" from dashboard
- Drag and drop an image or PDF
- Wait for OCR processing
- Review and edit extracted text
- Fill in metadata
- Click "Upload & Verify on Blockchain"

### 3. View Timeline
- Click "Timeline" in sidebar
- See all documents chronologically
- Filter by document type
- Click any document to view details

### 4. Verify Document
- Click "Verify Document"
- Enter a document hash
- Click "Verify on Blockchain"
- See verification result

---

## Next Steps

1. **Read Full Documentation**: See `IMPLEMENTATION_GUIDE.md`
2. **Deploy to Production**: Deploy Frontend and Backend to **Vercel**
3. **Add Features**: Customize for your needs
4. **Integrate Grok API**: Add AI-powered insights
5. **Deploy Smart Contract**: Use actual blockchain

---

##  Need Help?

- Read IMPLEMENTATION_GUIDE.md for detailed docs
- Check logs in terminal windows
- Inspect browser console for frontend errors
- Check server logs for backend errors

---

## Deployment (Vercel)

The recommended way to deploy this application is using **Vercel**.

### Frontend Deployment
1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository and select the `frontend` directory as the root.
4. Framework Preset: **Vite**.
5. Environment Variables: Add `VITE_API_URL` (your deployed backend URL).
6. Click **Deploy**.

### Backend Deployment
1. Create another project in Vercel.
2. Select the `backend` directory as the root.
3. Framework Preset: **Other**.
4. Build Command: `npm install` (or leave empty if using serverless functions).
5. Output Directory: `.` (root).
6. Environment Variables: Add your `MONGODB_URI`, `JWT_SECRET`, etc.
7. Click **Deploy**.

> **Note:** For the Backend to work on Vercel as serverless functions, ensure you have a `vercel.json` configuration if needed, or adapt the express app to export the handler.

---

## 🎉 Congratulations!

You now have a fully functional medical history management system with:
- ✅ User authentication
- ✅ Document upload
- ✅ OCR processing
- ✅ Timeline view
- ✅ Blockchain verification

Start building and customizing your medical records platform!

**Built with ❤️ by mihir for secure medical record management**

