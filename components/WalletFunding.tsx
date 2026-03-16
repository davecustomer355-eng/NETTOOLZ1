
import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { paymentService } from '../services/paymentService';

interface WalletFundingProps {
  settings: SiteSettings;
  onBack: () => void;
  onFundSuccess: (amount: number) => void;
}

const WalletFunding: React.FC<WalletFundingProps> = ({ settings, onBack, onFundSuccess }) => {
  const activeMethods = settings.paymentMethods.filter(m => m.isActive);
  const [usdtAmount, setUsdtAmount] = useState<string>('10');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{amount: number, id: string} | null>(null);

  const nairaValue = parseFloat(usdtAmount || '0') * settings.usdtToNairaRate;

  const handleAutomatedPayment = async (method: any) => {
    setIsProcessing(method.id);
    
    const response = await paymentService.initiateAutomatedPayment(
      method.id,
      nairaValue,
      { 
        publicKey: method.apiPublicKey, 
        merchantId: method.merchantId,
        type: method.type 
      }
    );

    if (response.success) {
      // Simulate user completing the payment on the checkout page
      await new Promise(resolve => setTimeout(resolve, 3000));
      const verified = await paymentService.verifyPayment(response.transactionId!);
      
      if (verified) {
        setPaymentSuccess({ amount: nairaValue, id: response.transactionId! });
        onFundSuccess(nairaValue);
      }
    } else {
      alert(response.message);
    }
    
    setIsProcessing(null);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl shadow-green-100 dark:shadow-none">
          <i className="fa-solid fa-check-double"></i>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Payment Confirmed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Transaction <span className="text-skyblue-500 font-mono font-bold">{paymentSuccess.id}</span> was successful. 
          Your wallet has been credited with <span className="text-slate-900 dark:text-white font-black">₦{paymentSuccess.amount.toLocaleString()}</span>.
        </p>
        <button 
          onClick={onBack}
          className="bg-skyblue-500 hover:bg-skyblue-600 text-white font-black px-12 py-4 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 transition-colors">
      <button onClick={onBack} className="mb-8 font-black text-skyblue-500 flex items-center hover:underline">
        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Profile
      </button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white">Fund Your Account</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Current Conversion Rate: <span className="font-bold text-skyblue-600 dark:text-skyblue-400">1 USDT = {settings.currencySymbol}{settings.usdtToNairaRate.toLocaleString()}</span></p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeMethods.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-skyblue-100 dark:border-slate-800 text-center transition-colors">
            <p className="text-slate-500 dark:text-slate-400">No payment methods currently active. Please contact support.</p>
          </div>
        ) : (
          activeMethods.map(method => (
            <div key={method.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-skyblue-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 transition-all hover:border-skyblue-300 dark:hover:border-skyblue-700">
              <div className="bg-skyblue-50 dark:bg-slate-950 w-20 h-20 rounded-2xl flex items-center justify-center text-skyblue-500 dark:text-skyblue-400 text-3xl shrink-0 transition-colors">
                <i className={`fa-solid ${method.type === 'bank' ? 'fa-building-columns' : 'fa-coins'}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white">{method.name}</h3>
                   {method.isAutomated && (
                     <span className="inline-block bg-skyblue-500 text-white text-[10px] font-black px-3 py-1 rounded-full mt-2 sm:mt-0 tracking-widest animate-pulse shadow-lg shadow-skyblue-200">
                       <i className="fa-solid fa-bolt mr-1"></i> INSTANT FUNDING
                     </span>
                   )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                  {method.isAutomated ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">USDT Amount</label>
                          <input 
                            type="number" 
                            value={usdtAmount}
                            onChange={(e) => setUsdtAmount(e.target.value)}
                            className="w-full text-xl font-black bg-transparent dark:text-white focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="text-skyblue-300 dark:text-skyblue-800"><i className="fa-solid fa-right-long"></i></div>
                        <div className="flex-1 text-right">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Will Receive (NGN)</label>
                          <p className="text-xl font-black text-skyblue-600 dark:text-skyblue-400">₦{nairaValue.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleAutomatedPayment(method)}
                        disabled={!!isProcessing}
                        className="w-full bg-skyblue-500 hover:bg-skyblue-600 disabled:bg-skyblue-300 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-3"
                      >
                        {isProcessing === method.id ? (
                          <>
                            <i className="fa-solid fa-spinner animate-spin"></i>
                            <span>Connecting to Gateway...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-credit-card"></i>
                            <span>Proceed to Instant Pay</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {method.type === 'bank' ? (
                        <>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{method.bankName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Account Number</p>
                            <div className="flex items-center space-x-2">
                              <p className="font-black text-xl text-skyblue-600 dark:text-skyblue-400 tracking-wider">{method.accountNumber}</p>
                              <button onClick={() => { navigator.clipboard.writeText(method.accountNumber || ''); alert('Copied!'); }} className="text-slate-300 hover:text-skyblue-500"><i className="fa-solid fa-copy"></i></button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-full">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Wallet Address ({method.network})</p>
                          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-skyblue-50 dark:border-slate-800">
                            <p className="font-mono text-sm text-skyblue-700 dark:text-skyblue-400 break-all">{method.walletAddress}</p>
                            <button onClick={() => { navigator.clipboard.writeText(method.walletAddress || ''); alert('Copied!'); }} className="text-slate-300 hover:text-skyblue-500 shrink-0"><i className="fa-solid fa-copy"></i></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium italic">{method.details}</p>
                  </div>
                </div>

                {!method.isAutomated && (
                  <div className="mt-6 flex items-center space-x-3 text-skyblue-600 dark:text-skyblue-400 bg-skyblue-50 dark:bg-skyblue-900/10 p-4 rounded-xl border border-skyblue-100 dark:border-skyblue-800">
                    <i className="fa-solid fa-message-dots text-xl"></i>
                    <p className="text-xs font-bold uppercase tracking-tight">Manual Confirmation: After payment, send proof to support on Telegram.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WalletFunding;
