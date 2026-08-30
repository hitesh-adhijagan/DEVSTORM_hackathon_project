import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDivvyStore } from '../store/useDivvyStore';
import { X, Copy, Check, QrCode, Share2, Link as LinkIcon } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode?: string;
  roomTitle?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !currentRoom) return null;

  // Build full share URL with hash routing support
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://divvyup.app';
  const shareUrl = `${origin}/#/room/${currentRoom.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="glass-card w-full max-w-md p-6 bg-slate-900 border-slate-700 text-center relative shadow-2xl rounded-3xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shrink-0">
          <QrCode className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white">Share Room Invite</h3>
          <p className="text-xs text-slate-400">
            Scan QR code or share link for instant zero-auth guest entry to{' '}
            <strong className="text-slate-200">{currentRoom.title}</strong>
          </p>
        </div>

        {/* Dynamic SVG QR Code Component */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-lg border-4 border-indigo-500/30">
          <QRCodeSVG
            value={shareUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230C2340'/><path d='M22 25 H50 C65 25 75 35 75 50 C75 65 65 75 50 75 H35 V82 H22 Z' fill='none' stroke='%234A90E2' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/><path d='M45 42 V65 C45 78 55 82 68 82 C80 82 86 75 86 62 V25' fill='none' stroke='%2374C69D' stroke-width='10' stroke-linecap='round'/></svg>",
              x: undefined,
              y: undefined,
              height: 38,
              width: 38,
              excavate: true,
            }}
          />
        </div>

        {/* Room Code Badge */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Room Code</span>
            <span className="font-mono text-base font-extrabold text-indigo-400 tracking-wider">
              {currentRoom.code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="btn-secondary text-xs py-2 px-3 transition-colors cursor-pointer shrink-0"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copiedCode ? 'Copied Code' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Share Link Action */}
        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className="btn-primary w-full justify-center text-xs py-3 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300 shrink-0" /> : <LinkIcon className="w-4 h-4 shrink-0" />}
            <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Instant Invite Link'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={() => {
                navigator.share({
                  title: `Join ${currentRoom.title} on DivvyUp`,
                  text: `Join room ${currentRoom.code} on DivvyUp to split expenses instantly!`,
                  url: shareUrl,
                });
              }}
              className="btn-secondary w-full justify-center text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Share via App...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
