import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      backgroundColor: 'transparent',
      color: '#f0eeff',
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden'
    }} className="medi-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .medi-landing h1, .medi-landing h2, .medi-landing h3, .medi-landing .syne-font {
          font-family: 'Syne', sans-serif;
        }

        /* Buttons */
        .btn {
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .btn-primary {
          background-color: #c084fc;
          color: rgba(9, 10, 30, 0.9);
          border: 1px solid #c084fc;
          padding: 0.75rem 1.5rem;
        }
        .btn-primary:hover {
          background-color: #d2a6ff;
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.45);
          transform: translateY(-2px);
        }
        .btn-ghost {
          background-color: transparent;
          color: #f0eeff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1.5rem;
        }
        .btn-ghost:hover {
          border-color: #c084fc;
          color: #c084fc;
          background-color: rgba(192, 132, 252, 0.05);
          transform: translateY(-2px);
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 5%;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        .navbar.scrolled {
          background-color: rgba(9, 10, 30, 0.6);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          color: rgba(210, 200, 255, 0.6);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #c084fc;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0.2rem rgba(192, 132, 252, 0.5); }
          70% { box-shadow: 0 0 0 0.8rem rgba(192, 132, 252, 0); }
          100% { box-shadow: 0 0 0 0 rgba(192, 132, 252, 0); }
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .stagger-1 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.4s; opacity: 0; }

        /* Hero */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 5% 60px;
          text-align: center;
        }

        /* Floating Blobs */
        .blob-1, .blob-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }
        .blob-1 {
          width: 300px;
          height: 300px;
          background: rgba(192, 132, 252, 0.1);
          top: 20%;
          left: 10%;
          animation: float1 10s infinite alternate ease-in-out;
        }
        .blob-2 {
          width: 250px;
          height: 250px;
          background: rgba(192, 132, 252, 0.08);
          bottom: 10%;
          right: 15%;
          animation: float2 12s infinite alternate ease-in-out;
        }
        @keyframes float1 { to { transform: translate(50px, 50px); } }
        @keyframes float2 { to { transform: translate(-40px, -60px); } }

        .hero-content {
          position: relative;
          z-index: 1;
          max-w: 800px;
          margin: 0 auto;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(9, 10, 30, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: #c084fc;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 2rem;
          box-shadow: 0 0 20px rgba(192, 132, 252, 0.1);
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          background-color: #c084fc;
          border-radius: 50%;
          animation: pulseRing 2s infinite;
        }
        
        /* JSON Card */
        .json-card {
          margin: 4rem auto 0;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: left;
          font-family: monospace;
          color: rgba(210, 200, 255, 0.6);
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .json-card::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: #c084fc;
          box-shadow: 0 0 10px rgba(192, 132, 252, 0.45), 0 0 20px rgba(192, 132, 252, 0.45);
          animation: scan 3s linear infinite;
        }
        .json-key { color: #f0eeff; }
        .json-string { color: #c084fc; }
        .json-bool { color: #f5a623; }

        /* Ticker */
        .ticker-wrap {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 0;
          overflow: hidden;
          white-space: nowrap;
          display: flex;
        }
        .ticker-inner {
          display: flex;
          animation: scrollTicker 30s linear infinite;
        }
        .ticker-item {
          color: #c084fc;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          margin: 0 2rem;
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Sections General */
        section {
          padding: 100px 5%;
          position: relative;
          z-index: 1;
        }
        .section-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #f0eeff;
          text-align: center;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr; }
        }

        /* Cards */
        .card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.2s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          border-color: rgba(180, 160, 255, 0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 15px rgba(192, 132, 252, 0.1);
        }

        /* How it works */
        .steps-container {
          display: flex;
          justify-content: space-between;
          max-width: 1000px;
          margin: 4rem auto 0;
          gap: 2rem;
          position: relative;
        }
        @media (max-width: 768px) {
          .steps-container { flex-direction: column; }
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 4rem auto 0;
        }
        @media (max-width: 992px) { .features-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }

        /* Verify Section */
        .verify-box {
          max-width: 600px;
          margin: 3rem auto 0;
          display: flex;
          gap: 1rem;
        }
        .verify-input {
          flex: 1;
          background: rgba(9, 10, 30, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c084fc;
          padding: 1rem;
          border-radius: 6px;
          font-family: monospace;
          outline: none;
          transition: border-color 0.2s;
        }
        .verify-input:focus { border-color: rgba(180, 160, 255, 0.4); }
        @media (max-width: 600px) {
          .verify-box { flex-direction: column; }
        }

        /* Tech Stack */
        .tech-wrap {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          max-width: 900px;
          margin: 3rem auto 0;
        }
        .tech-pill {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.2s;
        }
        .tech-pill:hover {
          border-color: rgba(180, 160, 255, 0.4);
          transform: translateY(-2px);
        }
        .tech-name { font-weight: 600; color: #f0eeff; }
        .tech-sub { font-size: 0.75rem; color: rgba(210, 200, 255, 0.6); margin-top: 0.25rem; }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3rem 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(9, 10, 30, 0.4);
          backdrop-filter: blur(16px);
        }
        @media (max-width: 768px) {
          .footer { flex-direction: column; gap: 2rem; text-align: center; }
        }
      `}</style>

      <ShaderGradientCanvas style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ShaderGradient
          animate="on" axesHelper="off" brightness={1.2}
          cAzimuthAngle={180} cDistance={3.61} cPolarAngle={90} cameraZoom={1}
          color1="#091B4C" color2="#4640C5" color3="#f2a1ff"
          destination="onCanvas" embedMode="off" envPreset="city"
          format="gif" fov={45} frameRate={10} gizmoHelper="hide"
          grain="on" lightType="3d" pixelDensity={1}
          positionX={-1.4} positionY={0} positionZ={0}
          range="disabled" rangeEnd={40} rangeStart={0} reflection={0.1}
          rotationX={0} rotationY={10} rotationZ={50}
          shader="defaults" type="waterPlane"
          uAmplitude={1} uDensity={1.3} uFrequency={5.5}
          uSpeed={0.3} uStrength={0.9} uTime={0} wireframe={false}
        />
      </ShaderGradientCanvas>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ background: '#c084fc', color: '#090a1e', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: "'Syne', sans-serif" }}>M</div>
            <span className="syne-font" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#f0eeff' }}>MediLedger</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#tech" className="nav-link">Tech</a>
            <a href="#verify" className="nav-link">Verify</a>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="blob-1"></div>
          <div className="blob-2"></div>

          <div className="hero-content">
            <div className="badge stagger-1">
              <span className="badge-dot"></span>
              Powered by Llama 3 + Ethereum Blockchain
            </div>
            <h1 className="syne-font stagger-2" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: '1.1', marginBottom: '1.5rem', color: '#f0eeff' }}>
              Your Medical Records,<br />Immutably Secured.
            </h1>
            <p className="stagger-3" style={{ fontSize: '1.125rem', color: 'rgba(210, 200, 255, 0.6)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
              Stop relying on scattered paper and centralized silos. MediLedger uses AI to structure your health data and the blockchain to prove its authenticity forever.
            </p>
            <div className="stagger-4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Start Here</button>
              <button className="btn btn-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>See how it works</button>
            </div>

            {/* JSON Terminal Mockup */}
            <div className="json-card stagger-4" style={{ animationDelay: '0.6s' }}>
              <div>{'{'}</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"patient_name"</span>: <span className="json-string">"Alex Doe"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"document_type"</span>: <span className="json-string">"Blood Test Report"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"diagnosis"</span>: <span className="json-string">"Vitamin D Deficiency"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"medicines"</span>: [<span className="json-string">"Cholecalciferol 60k IU"</span>],</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"doctor"</span>: <span className="json-string">"Dr. Sarah Smith"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"date"</span>: <span className="json-string">"2026-03-05"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"tx_hash"</span>: <span className="json-string">"0x4f3c8a1d2e9b5c7f8a1d2e9b5c7fe8b2"</span>,</div>
              <div style={{ paddingLeft: '20px' }}><span className="json-key">"verified"</span>: <span className="json-bool">true</span></div>
              <div>{'}'}</div>
            </div>
          </div>
        </section>

        {/* Ticker Strip */}
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="ticker-item">Blockchain Verified</div>
                <div className="ticker-item">AI-Powered OCR</div>
                <div className="ticker-item">Llama 3 Extraction</div>
                <div className="ticker-item">Ethereum Sepolia</div>
                <div className="ticker-item">Immutable Records</div>
                <div className="ticker-item">PaddleOCR</div>
                <div className="ticker-item">End-to-End Encrypted</div>
                <div className="ticker-item">Medical Timeline</div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Problem Section */}
        <section id="problem">
          <div className="grid-2">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', color: '#f0eeff' }}>Paper records get lost.<br />Digital ones get tampered.</h2>
              <p style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                The modern healthcare system is broken. You carry physical files that degrade or get lost, while centralized hospital databases are prone to breaches, silent edits, and vendor lock-in.
              </p>
              <p style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                We built MediLedger to give you sovereign control. By anchoring mathematical proofs (hashes) of your documents to a public blockchain, we guarantee your medical history remains authentic, untouched, and verifiable.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c084fc', fontFamily: "'Syne', sans-serif" }}>73%</div>
                <div style={{ color: 'rgba(210, 200, 255, 0.6)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Providers lack full patient history</div>
              </div>
              <div className="card">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c084fc', fontFamily: "'Syne', sans-serif" }}>1 in 3</div>
                <div style={{ color: 'rgba(210, 200, 255, 0.6)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Patients lose physical medical records</div>
              </div>
              <div className="card">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c084fc', fontFamily: "'Syne', sans-serif" }}>$8.3B</div>
                <div style={{ color: 'rgba(210, 200, 255, 0.6)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Annual cost of redundant testing</div>
              </div>
              <div className="card">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c084fc', fontFamily: "'Syne', sans-serif" }}>0%</div>
                <div style={{ color: 'rgba(210, 200, 255, 0.6)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Chance a blockchain record is altered</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{ background: 'linear-gradient(to bottom, transparent, rgba(9, 10, 30, 0.5), transparent)' }}>
          <h2 className="section-title">How It Works</h2>
          <p style={{ textAlign: 'center', color: 'rgba(210, 200, 255, 0.6)', maxWidth: '600px', margin: '0 auto' }}>From scattered papers to a secured timeline in three simple steps.</p>

          <div className="steps-container">
            {[
              { num: '01', title: 'Upload Document', icon: '📄', desc: 'Snap a picture or upload a PDF of your lab report, prescription, or clinical note.' },
              { num: '02', title: 'AI Extracts & Structures', icon: '🧠', desc: 'PaddleOCR reads the text, and Llama 3 structures it into standardized medical data.' },
              { num: '03', title: 'Hash Stored on Chain', icon: '⛓️', desc: 'We generate a unique cryptographic hash of the document and store it on Ethereum.' }
            ].map((step, i) => (
              <div key={i} className="card" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                <div style={{ color: '#c084fc', fontFamily: "'Syne', sans-serif", fontWeight: 'bold', marginBottom: '0.5rem' }}>Step {step.num}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f0eeff' }}>{step.title}</h3>
                <p style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '0.95rem', lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features">
          <h2 className="section-title">Enterprise-grade capabilities.</h2>
          <div className="features-grid">
            {[
              { icon: '🔍', title: 'Smart OCR Digitization', desc: 'Advanced optical character recognition digitizes handwritten notes and faded printouts with high accuracy.' },
              { icon: '🧠', title: 'AI-Powered Extraction', desc: 'State-of-the-art LLMs understand medical jargon, automatically categorizing medicines and diagnoses.' },
              { icon: '⛓️', title: 'Blockchain Verification', desc: 'Tamper-proof storage on Ethereum Sepolia guarantees your records have not been altered since upload.' },
              { icon: '📅', title: 'Medical Timeline', desc: 'View your entire health history chronologically, beautifully organized and instantly searchable.' },
              { icon: '🔐', title: 'Secure & Encrypted', desc: 'Industry-standard encryption secures your files both in transit and at rest in our cloud storage.' },
              { icon: '✅', title: 'Public Document Verify', desc: 'Allow doctors to instantly verify the authenticity of your shared reports via our public verification portal.' }
            ].map((feature, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#f0eeff' }}>{feature.title}</h3>
                <p style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '0.95rem', lineHeight: '1.5' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Public Verify */}
        <section id="verify" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Verify any document's authenticity</h2>
          <p style={{ color: 'rgba(210, 200, 255, 0.6)', maxWidth: '600px', margin: '0 auto' }}>
            Did a patient share a MediLedger document with you? Paste its unique cryptographic hash below to verify it against the Ethereum blockchain.
          </p>
          <div className="verify-box">
            <input
              type="text"
              className="verify-input"
              defaultValue="0x4f3c8a1d2e9b5c7fadd9c1e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8b2"
              readOnly
            />
            <button className="btn btn-primary" onClick={() => navigate('/verify')}>Verify Hash</button>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="tech" style={{ paddingBottom: '150px' }}>
          <h2 className="section-title">Built with modern tools</h2>
          <div className="tech-wrap">
            {[
              { name: 'React + Vite', sub: 'Frontend Shell' },
              { name: 'Node.js + Express', sub: 'Backend API' },
              { name: 'MongoDB', sub: 'Application DB' },
              { name: 'FastAPI', sub: 'AI Microservice' },
              { name: 'PaddleOCR', sub: 'Text Recognition' },
              { name: 'Llama 3 / Groq', sub: 'Medical Structuring' },
              { name: 'Solidity', sub: 'Smart Contracts' },
              { name: 'Ethereum Sepolia', sub: 'Blockchain Network' },
              { name: 'Ethers.js', sub: 'Web3 Provider' },
              { name: 'Cloudinary', sub: 'Image Storage' },
              { name: 'Tailwind CSS', sub: 'App Styling' }
            ].map((tech, i) => (
              <div key={i} className="tech-pill">
                <span className="tech-name">{tech.name}</span>
                <span className="tech-sub">{tech.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ textAlign: 'center', padding: '100px 5%', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'radial-gradient(circle at center, rgba(192, 132, 252, 0.05) 0%, transparent 70%)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
          <h2 className="syne-font" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#f0eeff' }}>Take control of your medical story today.</h2>
          <p style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '1.2rem', marginBottom: '3rem' }}>Join the future of verifiable, decentralized healthcare data.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>Create Account</button>
            <button className="btn btn-ghost" onClick={() => navigate('/login')} style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>Log In</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#c084fc', border: '1px solid rgba(255, 255, 255, 0.08)', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', fontFamily: "'Syne', sans-serif" }}>M</div>
            <span className="syne-font" style={{ fontWeight: 'bold', color: '#f0eeff' }}>MediLedger</span>
          </div>
          <div style={{ color: 'rgba(210, 200, 255, 0.6)', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} MediLedger. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} style={{ color: 'rgba(210, 200, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/upload'); }} style={{ color: 'rgba(210, 200, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Upload</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/timeline'); }} style={{ color: 'rgba(210, 200, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Timeline</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/verify'); }} style={{ color: 'rgba(210, 200, 255, 0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Verify</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
