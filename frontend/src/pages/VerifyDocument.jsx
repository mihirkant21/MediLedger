import { useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { blockchainService } from '../services/blockchainService'

const VerifyDocument = () => {
  const [hash, setHash] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    setLoading(true)
    try {
      const result = await blockchainService.verifyOnChain(hash)
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({ verified: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
          Verify Document
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse-slow shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
        </h1>
        <p className="text-text-muted mt-1">Check document authenticity on the blockchain</p>
      </div>

      <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="block text-sm font-medium text-text-main mb-2">
          Document Hash
        </label>
        <div className="relative">
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="input-field pr-10 font-mono text-sm"
            placeholder="Enter document hash (0x...)"
          />
        </div>
        <button onClick={handleVerify} className="btn-primary mt-6 w-full py-3 text-lg" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify on Blockchain'}
        </button>

        {verificationResult && (
          <div className={`mt-6 p-6 rounded-xl border transition-all duration-500 animate-fade-in ${verificationResult.verified
              ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            }`}>
            <div className="flex items-center justify-center">
              {verificationResult.verified ? (
                <>
                  <div className="bg-emerald-500/20 p-2 rounded-full mr-3">
                    <Check className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block font-bold text-xl text-emerald-400">Authentic Document</span>
                    <span className="text-sm text-emerald-400/80">Blockchain signature matched successfully</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-500/20 p-2 rounded-full mr-3">
                    <X className="h-8 w-8 text-red-400" />
                  </div>
                  <div>
                    <span className="block font-bold text-xl text-red-400">Verification Failed</span>
                    <span className="text-sm text-red-400/80">Cannot confirm document authenticity</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyDocument
