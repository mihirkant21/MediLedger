# MediLedger
**Secure, AI-Powered Medical History Management System with Blockchain Verification**

MediLedger is a modern platform designed to digitize, secure, and manage personalized medical history. It leverages **Optical Character Recognition (OCR)** and **Large Language Models (LLMs)** to extract data from physical medical documents and uses **Blockchain technology** to ensure the immutability and authenticity of these records.

## 🌟 Key Features

**🔐 Advanced Authentication & Security**
-   **Google OAuth Integration**: Fast, secure, one-tap sign-in using Google accounts.
-   **Two-Step Email Verification**: Custom registration flow with secure, time-based OTP sent directly via NodeMailer.
-   **JWT Session Management**: Robust, token-based API protection for backend routes.

**📄 Smart Document Digitization**
-   **AI-Powered OCR**: Uses **PaddleOCR** for highly accurate text recognition from physical prescriptions, lab reports, and doctor notes.
-   **Intelligent Data Structuring**: Integrates **Groq (Llama 3)** to parse messy medical text into structured, standardized JSON data (Patient Name, Diagnosis, Medicines, Dosages, etc.).
-   **Cross-Origin Image Handling**: Secure handling of document uploads utilizing AWS S3 and dynamically generated cross-origin headers.

**🔗 Blockchain Verification & Immutability**
-   **Ethereum Smart Contracts**: Every document's hash is securely stored on the **Ethereum (Sepolia Testnet)** blockchain.
-   **Tamper-Proof Records**: A unique cryptographic hash ensures that once a record is uploaded, it cannot be secretly modified.
-   **Open Verification Protocol**: Anyone can verify the authenticity of a medical document by checking its hash against the blockchain registry.

**🖥️ Interactive User Experience**
-   **Medical Timeline UI**: View your complete medical history in a chronological, beautifully styled timeline.
-   **Dynamic Premium Design**: Fluid animations, glassmorphism UI components, and modern color palettes creating a rich user experience.
-   **Fully Responsive**: Mobile-first design principles ensure the application looks perfect on all devices.

---

## 🏗️ System Architecture

The project consists of three main microservices/modules running in harmony:

1.  **Frontend (`/frontend`)**:
    -   Built with **React**, **Vite**, and **Tailwind CSS**.
    -   Provides the user interface for authenticating, uploading, editing, and viewing medical records.
    -   Communicates with the backend using Axios via configured API proxies.

2.  **Backend (`/backend`)**:
    -   Built with **Node.js** and **Express**.
    -   Manages user authentication, OTP generation, file handling, and database interactions with **MongoDB**.
    -   Orchestrates the workflow between the Python OCR service and the Ethereum Blockchain via **Ethers.js**.

3.  **OCR Service (`/ocr-service`)**:
    -   Microservice built with **Python** and **FastAPI**.
    -   Utilizes **PaddleOCR** (CPU-optimized) to extract raw text from images.
    -   Calls the **Groq API** to intelligently parse text into structured JSON.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons, React Router, Google OAuth Provider |
| **Backend** | Node.js, Express, Mongoose, Ethers.js, NodeMailer, JWT |
| **Database** | MongoDB |
| **AI / ML** | Python, FastAPI, PaddleOCR, Groq SDK (Llama 3) |
| **Blockchain** | Ethereum (Sepolia Testnet), Solidity, Web3/Ethers.js |
| **Deployment** | AWS S3 (Frontend), Render.com (Backend & OCR Service) |

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   MongoDB (Running locally or Atlas URI)
-   Metamask Wallet (with Sepolia ETH)
-   Google Cloud Console Account (For OAuth Credentials)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with MONGODB_URI, JWT_SECRET, GROQ_API_KEY, private keys, and email credentials
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Ensure .env contains VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm run dev
```

### 3. OCR Service Setup
```bash
cd ocr-service
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## 🌐 Deployment Configuration

This project is configured for a multi-cloud deployment environment:
-   **Frontend**: Hosted as a static site on **AWS S3** bucket (`mediledger-frontend.s3-website-us-east-1.amazonaws.com`).
-   **Backend**: Deployed as a Web Service on **Render.com**.
-   **OCR Service**: Deployed as an independent Python FastAPI Web Service on **Render.com**, utilizing a `.python-version` file to ensure PaddleOCR compatibility.

## 📄 License
MIT License.
