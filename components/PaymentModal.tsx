
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Wallet, Tag, Info, ArrowDown } from 'lucide-react';
import { calculateSmartPrice, db } from '../services/database';
import { UserProfile } from '../types';

interface PaymentModalProps {
  courseTitle: string;
  price: number;
  onClose: () => void;
  onSuccess: () => void;
  user: UserProfile | null;
}

// Pass user from parent as a prop to resolve the missing db.auth.getSession functionality
export const PaymentModal: React.FC<PaymentModalProps> = ({ courseTitle, price, onClose, onSuccess, user }) => {
  const [method, setMethod] = useState<'ESEWA' | 'KHALTI' | null>(null);
  const [step, setStep] = useState<'SELECT' | 'input' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [paymentId, setPaymentId] = useState('');
  const [pricing, setPricing] = useState<any>(null);

  // Initialize smart pricing based on user course booking history
  useEffect(() => {
    const initPricing = async () => {
      if (user?.email) {
        const bookings = await db.content.getBookedClasses(user.email);
        const calc = calculateSmartPrice(user, `NPR ${price}`, bookings.length);
        setPricing(calc);
      } else {
        setPricing({ finalPrice: price, discount: 0, originalPrice: price });
      }
    };
    initPricing();
  }, [user, price]);

  const handlePay = () => {
    if (!paymentId) return;
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  if (!pricing) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-800 text-center relative overflow-hidden">
          {pricing.discount > 0 && (
             <div className="absolute top-4 -left-8 bg-pink-600 text-white text-[10px] font-bold px-10 py-1 -rotate-45 shadow-lg">
                SAVE {pricing.discount}%
             </div>
          )}
          <h3 className="text-lg font-bold text-white">Enrollment Portal</h3>
          <p className="text-slate-400 text-sm mt-1">{courseTitle}</p>
          
          <div className="mt-4 flex flex-col items-center">
             {pricing.discount > 0 && (
               <div className="text-xs text-slate-500 line-through mb-1">NPR {pricing.originalPrice.toLocaleString()}</div>
             )}
             <div className="bg-brand-900/30 border border-brand-500/30 px-6 py-2 rounded-full text-brand-400 font-bold text-2xl flex items-center gap-2">
               NPR {pricing.finalPrice.toLocaleString()}
               {pricing.discount > 0 && <Tag className="w-4 h-4 text-pink-400" />}
             </div>
             {pricing.reason && (
               <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
                 Applied: {pricing.reason}
               </div>
             )}
          </div>
        </div>

        <div className="p-6">
          {step === 'SELECT' && (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-4">
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <p>Prices optimized for <strong>{user?.name || 'Guest'}</strong> using the MindGear Smart Pricing Engine.</p>
                 </div>
              </div>

              <button 
                onClick={() => { setMethod('ESEWA'); setStep('input'); }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#60bb46]/10 border border-[#60bb46]/30 hover:bg-[#60bb46]/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#60bb46] flex items-center justify-center text-white font-bold">e</div>
                  <span className="font-bold text-white text-lg group-hover:text-[#60bb46] transition-colors">eSewa</span>
                </div>
                <Wallet className="w-5 h-5 text-[#60bb46]" />
              </button>

              <button 
                onClick={() => { setMethod('KHALTI'); setStep('input'); }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#5c2d91]/10 border border-[#5c2d91]/30 hover:bg-[#5c2d91]/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5c2d91] flex items-center justify-center text-white font-bold">K</div>
                  <span className="font-bold text-white text-lg group-hover:text-[#a663cc] transition-colors">Khalti</span>
                </div>
                <Wallet className="w-5 h-5 text-[#a663cc]" />
              </button>
            </div>
          )}

          {step === 'input' && (
            <div className="animate-slide-up">
              <div className="mb-6 flex items-center gap-3 justify-center">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl ${method === 'ESEWA' ? 'bg-[#60bb46]' : 'bg-[#5c2d91]'}`}>
                    {method === 'ESEWA' ? 'e' : 'K'}
                 </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {method} ID / Mobile Number
                  </label>
                  <input 
                    type="text" 
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white mt-2 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handlePay}
                  disabled={!paymentId}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                >
                  Pay NPR {pricing.finalPrice.toLocaleString()}
                </button>
                <button 
                  onClick={() => setStep('SELECT')}
                  className="w-full py-2 text-slate-500 text-sm hover:text-white"
                >
                  Change Method
                </button>
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="text-center py-8 animate-fade-in">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
              <h4 className="text-white font-bold text-lg">Processing Optimized Rate...</h4>
              <p className="text-slate-400 text-sm">Validating session with gateway.</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                 <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-2">Access Granted!</h4>
              <p className="text-slate-400 text-sm">Your course seat is secured.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
