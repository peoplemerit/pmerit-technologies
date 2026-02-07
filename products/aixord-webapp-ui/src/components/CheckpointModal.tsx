/**
 * Checkpoint Modal (Path B: Proactive Debugging)
 *
 * Displayed when a layer reaches EXECUTED state.
 * Allows user to verify the layer output and transition to LOCKED.
 *
 * Verification Methods:
 * - user_confirm: Simple acknowledgment
 * - screenshot: Upload a screenshot as evidence
 * - test_output: Paste test results
 * - file_check: Confirm file exists
 */

import { useState, useRef } from 'react';
import type { ExecutionLayer, VerificationMethod, VerifyLayerInput } from '../lib/api';

interface CheckpointModalProps {
  layer: ExecutionLayer;
  onVerify: (data: VerifyLayerInput) => Promise<void>;
  onFail: (reason: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function CheckpointModal({
  layer,
  onVerify,
  onFail,
  onClose,
  isLoading = false,
}: CheckpointModalProps) {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('user_confirm');
  const [testOutput, setTestOutput] = useState('');
  const [failReason, setFailReason] = useState('');
  const [showFailForm, setShowFailForm] = useState(false);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleVerify = async () => {
    const data: VerifyLayerInput = {
      method: verificationMethod,
      notes: notes || undefined,
    };

    if (verificationMethod === 'test_output' && testOutput) {
      data.evidence = {
        type: 'test_output',
        text: testOutput,
      };
    }

    // TODO: Handle screenshot upload - would need to upload to images API first
    // then include image_id in evidence

    await onVerify(data);
  };

  const handleFail = async () => {
    if (!failReason.trim()) return;
    await onFail(failReason);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVerificationMethod('screenshot');
    }
  };

  // Parse expected outputs for display
  const expectedOutputsList = layer.expected_outputs
    ? Object.values(layer.expected_outputs).map((v) => String(v))
    : [];

  const actualOutputsList = layer.actual_outputs
    ? Object.values(layer.actual_outputs).map((v) => String(v))
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">◎</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Checkpoint — Layer {layer.layer_number}
              </h2>
              <p className="text-gray-400 text-sm">{layer.title}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-amber-300 text-sm">Awaiting Verification</span>
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Expected Output</h4>
              {expectedOutputsList.length > 0 ? (
                <ul className="space-y-1">
                  {expectedOutputsList.map((item, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <span className="text-gray-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">No specific outputs defined</p>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Actual Output</h4>
              {actualOutputsList.length > 0 ? (
                <ul className="space-y-1">
                  {actualOutputsList.map((item, i) => (
                    <li key={i} className="text-white text-sm flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">Not yet recorded</p>
              )}
            </div>
          </div>

          {/* Failure form */}
          {showFailForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What went wrong?
                </label>
                <textarea
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFailForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFail}
                  disabled={!failReason.trim() || isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Submitting...' : 'Report Issue'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Verification method selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  How would you like to verify?
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-lg border transition-colors text-left ${
                      verificationMethod === 'screenshot'
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>📸</span>
                      <span className="font-medium">Screenshot</span>
                    </div>
                    <p className="text-xs text-gray-500">Upload visual proof</p>
                    {selectedFile && (
                      <p className="text-xs text-violet-400 mt-1 truncate">{selectedFile.name}</p>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    onClick={() => setVerificationMethod('test_output')}
                    className={`p-3 rounded-lg border transition-colors text-left ${
                      verificationMethod === 'test_output'
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>📋</span>
                      <span className="font-medium">Test Output</span>
                    </div>
                    <p className="text-xs text-gray-500">Paste test results</p>
                  </button>
                </div>
              </div>

              {/* Test output input */}
              {verificationMethod === 'test_output' && (
                <div>
                  <textarea
                    value={testOutput}
                    onChange={(e) => setTestOutput(e.target.value)}
                    rows={4}
                    placeholder="Paste your test output or terminal results..."
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono text-sm"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional comments..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!showFailForm && (
          <div className="p-6 border-t border-gray-700 space-y-3">
            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  It Works — Lock Layer
                </>
              )}
            </button>

            <button
              onClick={() => setShowFailForm(true)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Something's Wrong — Report Issue
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Verify Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckpointModal;
