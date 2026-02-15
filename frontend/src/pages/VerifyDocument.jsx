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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verify Document</h1>
        <p className="text-gray-600 mt-1">Check document authenticity on the blockchain</p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Hash
        </label>
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="input-field"
          placeholder="Enter document hash..."
        />
        <button onClick={handleVerify} className="btn-primary mt-4 w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify on Blockchain'}
        </button>

        {verificationResult && (
          <div className={`mt-6 p-4 rounded-lg ${verificationResult.verified ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {verificationResult.verified ? (
                <>
                  <Check className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-green-900">Document Verified!</span>
                </>
              ) : (
                <>
                  <X className="h-6 w-6 text-red-600 mr-2" />
                  <span className="font-semibold text-red-900">Verification Failed</span>
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
