import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDivvyStore } from '../store/useDivvyStore';
import type { User } from '../types';
import { generateAppSpecificUpiUri, generateUpiUri, validateUpiId } from '../utils/upiGenerator';
import { X, Check, QrCode, ArrowRight, ExternalLink, ShieldCheck, AlertCircle, Save } from 'lucide-react';

interface UPISettlementModalProps {
  isOpen: boolean;
  sender: User;
  receiver: User;
  amount: number;
  onClose: () => void;
}

export const UPISettlementModal: React.FC<UPISettlementModalProps> = ({
  isOpen,
  sender,
  receiver,
  amount,
  onClose,
}) => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const recordSettlement = useDivvyStore((state) => state.recordSettlement);
  const markSettlementCompleted = useDivvyStore((state) => state.markSettlementCompleted);
  const updateMemberUpiId = useDivvyStore((state) => state.updateMemberUpiId);

  const [vpaInput, setVpaInput] = useState(receiver.upiId || '');
  const [upiRefInput, setUpiRefInput] = useState(`UPI-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isSettledConfirmed, setIsSettledConfirmed] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  if (!isOpen || !currentRoom) return null;

  const roomCode = currentRoom.code;
  const activePayeeUpi = receiver.upiId || vpaInput.trim();
  const isValidVpa = validateUpiId(activePayeeUpi);

  const upiParams = {
    payeeUpiId: activePayeeUpi,
    payeeName: receiver.name,
    amount,
    roomCode,
  };

  const standardUpiUri = isValidVpa ? generateUpiUri(upiParams) : '';

  const gpayUri = isValidVpa ? generateAppSpecificUpiUri('gpay', upiParams) : '';
  const phonePeUri = isValidVpa ? generateAppSpecificUpiUri('phonepe', upiParams) : '';
  const paytmUri = isValidVpa ? generateAppSpecificUpiUri('paytm', upiParams) : '';

  const handleSaveVpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpaInput.trim()) return;
    updateMemberUpiId(receiver.id, vpaInput.trim());
  };

  const handleConfirmSettlement = () => {
    const settlement = recordSettlement({
      roomId: currentRoom.id,
      fromUserId: sender.id,
      toUserId: receiver.id,
      amount,
      status: 'completed',
      upiReference: upiRefInput.trim() || undefined,
    });

    markSettlementCompleted(settlement.id, upiRefInput.trim() || undefined);
    const nowIso = new Date().toISOString();
    setTimestamp(nowIso);
    setIsSettledConfirmed(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-card w-full max-w-lg p-6 bg-slate-900 border-slate-700 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">UPI Direct Pay & Settlement</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            NPCI Compliant Settlement • Instant App Deep-Links & Desktop QR
          </p>
        </div>

        {/* Sender -> Receiver Flow Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center font-bold text-xs text-rose-300">
              {sender.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-white text-xs block">{sender.name}</span>
              <span className="text-[10px] text-rose-400 font-semibold">Payer (Debtor)</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-mono text-sm font-black text-amber-300">
              ₹{amount.toLocaleString('en-IN')}
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center gap-2.5">
            <div>
              <span className="font-bold text-white text-xs block text-right">{receiver.name}</span>
              <span className="text-[10px] text-emerald-400 font-semibold text-right block">
                Payee (Creditor)
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300">
              {receiver.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Payee VPA Status / Prompt */}
        {!receiver.upiId ? (
          <form onSubmit={handleSaveVpa} className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl mb-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{receiver.name} has no saved UPI VPA ID</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enter payee's VPA ID (e.g. <code>{receiver.name.toLowerCase()}@upi</code>) to enable instant UPI payment links:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. priya@okicici, 9876543210@paytm"
                value={vpaInput}
                onChange={(e) => setVpaInput(e.target.value)}
                className="text-xs font-mono flex-1"
                required
              />
              <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                <Save className="w-3.5 h-3.5" />
                <span>Save VPA</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 mb-5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Payee UPI VPA:</span>
            <span className="font-mono font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/40">
              {receiver.upiId}
            </span>
          </div>
        )}

        {isValidVpa && (
          <>
            {/* Desktop Scan-to-Pay QR Code */}
            <div className="text-center mb-5">
              <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg border-4 border-emerald-500/30 mb-2">
                <QRCodeSVG value={standardUpiUri} size={160} level="M" includeMargin={true} />
              </div>
              <span className="text-[11px] text-slate-400 block font-medium">
                Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)
              </span>
            </div>

            {/* Mobile Intent Buttons */}
            <div className="mb-6 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Instant Mobile App Intent Links
              </span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={gpayUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center text-xs py-2 bg-blue-600/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                >
                  <span>Google Pay</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>

                <a
                  href={phonePeUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center text-xs py-2 bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                >
                  <span>PhonePe</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>

                <a
                  href={paytmUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center text-xs py-2 bg-sky-600/10 border-sky-500/30 text-sky-300 hover:bg-sky-600/20"
                >
                  <span>Paytm</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>

                <a
                  href={standardUpiUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary justify-center text-xs py-2 bg-emerald-600 hover:bg-emerald-500"
                >
                  <span>Generic UPI</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>
              </div>
            </div>
          </>
        )}

        {/* Mark as Settled & Timestamp Confirmation */}
        <div className="border-t border-slate-800 pt-4">
          {!isSettledConfirmed ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UPI Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="e.g. UPI-9876543210"
                />
              </div>

              <button
                onClick={handleConfirmSettlement}
                className="btn-primary w-full justify-center text-xs py-2.5 bg-emerald-600 hover:bg-emerald-500"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Mark as Settled</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Settlement Recorded & Confirmed!</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Ref: {upiRefInput}</p>
              <p className="text-[10px] text-slate-400">
                Timestamp: {timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}
              </p>
              <button
                onClick={onClose}
                className="btn-secondary text-xs py-1 px-4 mt-2 inline-block"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
