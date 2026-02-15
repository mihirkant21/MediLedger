# MediLedger
**Secure, AI-Powered Medical History Management System with Blockchain Verification**

MediLedger is a modern platform designed to digitize, secure, and manage personalized medical history. It leverages **Optical Character Recognition (OCR)** and **Large Language Models (LLMs)** to extract data from physical medical documents and uses **Blockchain technology** to ensure the immutability and authenticity of these records.

## 🌟 Key Features

-   **Smart Document Digitization**: Upload photos or PDFs of prescriptions, lab reports, and doctor notes.
-   **AI-Powered Extraction**: Uses **PaddleOCR** for text recognition and **Groq (Llama 3)** to structure messy medical text into standardized data (Patient Name, Diagnosis, Medicines, etc.).
-   **Blockchain Verification**: Every document's integrity is verified on the **Ethereum (Sepolia Testnet)** blockchain. A unique hash is stored on-chain, making tampering impossible.
-   **Medical Timeline**: View your complete medical history in a chronological, easy-to-read timeline.
-   **Interactive Verification**: Anyone can verify the authenticity of a document by checking its hash against the blockchain registry.
-   **Secure Storage**: Data is encrypted and stored securely (MongoDB), with critical verification proofs on the blockchain.

---

## System Architecture

The project consists of four main microservices/modules:

1.  **Frontend (`/frontend`)**:
    -   Built with **React**, **Vite**, and **Tailwind CSS**.
    -   Provides the user interface for uploading, editing, and viewing medical records.
    -   Interacts with the backend via REST APIs.

2.  **Backend (`/backend`)**:
    -   Built with **Node.js** and **Express**.
    -   Manages user authentication (JWT), file handling (Multer), and database interactions (MongoDB).
    -   Orchestrates the workflow between the OCR service and Blockchain.

3.  **OCR Service (`/ocr-service`)**:
    -   Built with **Python** and **FastAPI**.
    -   Uses **PaddleOCR** to extract raw text from images.
    -   Integrates with **Groq API** to intelligently parse text into JSON.

4.  **Blockchain Service (`/blockchain-service`)**:
    -   Contains **Solidity** smart contracts (`MedicalRecords.sol`).
    -   Manages deployment to Ethereum networks.
    -   The Backend interacts with this via **Ethers.js**.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons, React Router |
| **Backend** | Node.js, Express, Mongoose, Ethers.js, Cloudinary (File Storage) |
| **Database** | MongoDB |
| **AI / ML** | Python, FastAPI, PaddleOCR, OpenCV, Groq SDK (Llama 3) |
| **Blockchain** | Ethereum (Sepolia), Solidity, Hardhat/Remix |
| **DevOps** | Render.com (Docker & Static Site Hosting) |

---

## � Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   MongoDB (Running locally or Atlas URI)
-   Metamask Wallet (with Sepolia ETH)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with MONGODB_URI, JWT_SECRET, GROK_API_KEY, private keys
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. OCR Service Setup
```bash
cd ocr-service
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```

### 4. Blockchain Setup
See [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) for detailed instructions on getting your Private Key and RPC URL.

### 5. Cloudinary Setup (Optional)
See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for enabling free cloud storage for images.

---

## 🌐 Deployment

## 🌐 Deployment

This project is configured for deployment on **Vercel**.
-   **Frontend**: Deploys as a static site (Vite).
-   **Backend**: Deploys as serverless functions or a Node.js app.
-   See `QUICK_START.md` for detailed deployment steps.

## 📄 License
MIT License.
