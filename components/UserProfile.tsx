
import React from 'react';
import { User, SiteSettings } from '../types';

interface UserProfileProps {
  user: User;
  settings: SiteSettings;
  onFundWallet: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, settings, onFundWallet, onLogout }) => {
  return (
    <div className="py-12 space-y-12 transition-colors">
      {/* Header / Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-skyblue-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">Welcome, {user.email}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your assets and track your purchases.</p>
          </div>
          <div className="mt-8 flex items-center space-x-4">
            <button onClick={onLogout} className="text-red-400 font-bold hover:underline transition-colors">Sign Out</button>
          </div>
        </div>
        
        <div className="bg-skyblue-500 p-8 rounded-3xl text-white shadow-xl shadow-skyblue-200 dark:shadow-none flex flex-col justify-between transition-all">
          <div>
            <p className="text-skyblue-100 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
            <h3 className="text-4xl font-black">{settings.currencySymbol}{user.balance.toLocaleString()}</h3>
          </div>
          <button 
            onClick={onFundWallet}
            className="mt-6 w-full bg-white text-skyblue-500 font-black py-4 rounded-2xl hover:bg-skyblue-50 transition-all active:scale-95 shadow-lg"
          >
            Fund Wallet
          </button>
        </div>
      </div>

      {/* Orders / Delivered Logins */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-skyblue-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-8 border-b border-skyblue-50 dark:border-slate-800 bg-skyblue-50/20 dark:bg-slate-900/50">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">My Purchased Tools</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Your product credentials are listed below.</p>
        </div>
        
        <div className="p-8">
          {user.orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-600">
              <i className="fa-solid fa-box-open text-6xl mb-4 block opacity-30"></i>
              <p className="font-bold">No purchases yet. Start shopping!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {user.orders.map(order => (
                <div key={order.id} className="bg-skyblue-50/50 dark:bg-slate-800/50 rounded-2xl border border-skyblue-50 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-6 transition-colors">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">{order.productName}</h4>
                      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-950 border border-skyblue-100 dark:border-slate-800 rounded-xl p-4 mt-4 font-mono text-sm text-skyblue-700 dark:text-skyblue-400 shadow-sm relative group transition-colors">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => {
                            navigator.clipboard.writeText(order.content);
                            alert('Copied to clipboard!');
                          }} 
                          className="text-skyblue-400 hover:text-skyblue-600 bg-skyblue-50 dark:bg-slate-800 p-1.5 rounded-lg shadow-sm"
                          title="Copy Logins"
                         >
                           <i className="fa-solid fa-copy"></i>
                         </button>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{order.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
