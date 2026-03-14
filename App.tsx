
import React, { useState, useEffect } from 'react';
import { Product, CartItem, ViewState, SiteSettings, AdminUser, User, UserOrder } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './services/constants';
import { dbService } from './services/dbService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserAuth from './components/UserAuth';
import UserProfile from './components/UserProfile';
import WalletFunding from './components/WalletFunding';
import ProductCatalog from './components/ProductCatalog';
import ProductDetails from './components/ProductDetails';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([{ id: '1', username: 'Admin', role: 'super' }]);
  const [settings, setSettings] = useState<SiteSettings>({
    currency: 'NGN',
    currencySymbol: '₦',
    storeName: 'NETTOOLZ',
    // Updated Logo: Blue globe design with "PREMIUM WEB LOGS" text
    logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Ccircle cx='256' cy='256' r='256' fill='%234CABEB'/%3E%3Ccircle cx='256' cy='256' r='240' fill='none' stroke='white' stroke-width='4'/%3E%3Ccircle cx='256' cy='256' r='180' fill='white'/%3E%3Ccircle cx='256' cy='256' r='170' fill='none' stroke='%234CABEB' stroke-width='2'/%3E%3Cpath id='textCurve' d='M 76,256 A 180,180 0 0,1 436,256' fill='none'/%3E%3Ctext font-family='Arial, sans-serif' font-weight='900' font-size='50' fill='white' letter-spacing='2' text-anchor='middle'%3E%3CtextPath href='%23textCurve' startOffset='50%25'%3EPREMIUM WEB LOGS%3C/textPath%3E%3C/text%3E%3Cg transform='translate(256, 256)' stroke='%234CABEB' stroke-width='6' fill='none'%3E%3Ccircle r='130' stroke-width='4'/%3E%3Cellipse rx='130' ry='45' stroke-width='4'/%3E%3Cellipse rx='45' ry='130' stroke-width='4'/%3E%3Cline x1='-130' y1='0' x2='130' y2='0'/%3E%3Cline x1='0' y1='-130' x2='0' y2='130'/%3E%3C/g%3E%3Cg transform='translate(256, 450) scale(0.8)'%3E%3Crect x='-35' y='-10' width='70' height='20' rx='10' fill='white' transform='rotate(45)'/%3E%3Crect x='-35' y='-10' width='70' height='20' rx='10' fill='white' transform='rotate(-45)'/%3E%3C/g%3E%3C/svg%3E",
    usdtToNairaRate: 1650, 
    categories: CATEGORIES,
    paymentMethods: [
      { 
        id: 'bank1', 
        type: 'bank', 
        name: 'KoralPay (Automated)', 
        details: 'Transfer to the virtual account generated at checkout.', 
        isActive: true,
        isAutomated: true,
        apiPublicKey: 'pk_live_nettoolz_7721',
        merchantId: 'MER-88122'
      },
      { 
        id: 'crypto1', 
        type: 'crypto', 
        name: 'Crypto (Instant)', 
        details: 'Payment credits after 1 network confirmation.', 
        walletAddress: 'TYxxxxxxxxxxxxxxxxxxxxxx',
        network: 'TRC20',
        isActive: true,
        isAutomated: true,
        apiPublicKey: 'pk_live_crypto_9921',
        merchantId: 'MER-99123'
      }
    ]
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const savedUsers = await dbService.getAllUsers();
        const found = savedUsers.find(u => u.id === firebaseUser.uid);
        if (found) {
          setCurrentUser(found);
          localStorage.setItem('nettoolz_logged_user_email', found.email);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('nettoolz_logged_user_email');
      }
    });

    const initApp = async () => {
      try {
        const isConnected = await dbService.init();
        setDbConnected(isConnected);
        
        if (!isConnected) {
          console.warn('Running with limited database connectivity.');
        }

        const savedSettings = await dbService.getSettings();
        if (savedSettings) setSettings(savedSettings);
        else await dbService.saveSettings(settings);

        const savedProducts = await dbService.getAllProducts();
        if (savedProducts && savedProducts.length > 0) {
          setProducts(savedProducts);
        } else {
          await dbService.saveProducts(INITIAL_PRODUCTS);
          setProducts(INITIAL_PRODUCTS);
        }

        const savedAdmins = await dbService.getAllAdmins();
        if (savedAdmins && savedAdmins.length > 0) setAdmins(savedAdmins);
        else await dbService.saveAdmins(admins);

        const savedUsers = await dbService.getAllUsers();
        setUsers(savedUsers);

        const savedAdmin = localStorage.getItem('nettoolz_admin_logged');
        if (savedAdmin === 'true') setIsAdminLoggedIn(true);

        const loggedUserEmail = localStorage.getItem('nettoolz_logged_user_email');
        if (loggedUserEmail) {
          const found = savedUsers.find(u => u.email === loggedUserEmail);
          if (found) setCurrentUser(found);
        }

      } catch (err) {
        console.error("Database initialization failed:", err);
      } finally {
        setIsLoadingDB(false);
      }
    };

    initApp();

    return () => unsubscribe();
  }, []);

  const handleUpdateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    await dbService.saveProducts(newProducts);
  };

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    await dbService.saveSettings(newSettings);
  };

  const handleUpdateAdmins = async (newAdmins: AdminUser[]) => {
    setAdmins(newAdmins);
    await dbService.saveAdmins(newAdmins);
  };

  const handleAuth = async (user: User) => {
    const exists = users.find(u => u.email === user.email);
    const updatedUsers = exists 
      ? users.map(u => u.email === user.email ? user : u) 
      : [...users, user];
    
    setUsers(updatedUsers);
    setCurrentUser(user);
    await dbService.saveUser(user);
    localStorage.setItem('nettoolz_logged_user_email', user.email);
    setCurrentView('profile');
  };

  const handleFundSuccess = async (amount: number) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + amount
    };
    setUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    setCurrentUser(updatedUser);
    await dbService.saveUser(updatedUser);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleCheckout = async () => {
    if (!currentUser) { setCurrentView('profile'); setIsCartOpen(false); return; }
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (currentUser.balance < total) { alert('Insufficient balance.'); setCurrentView('fund_wallet'); setIsCartOpen(false); return; }
    
    setIsProcessingCheckout(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Inventory Consumption Logic
    const updatedProducts = [...products];
    const newOrders: UserOrder[] = [];

    cart.forEach(cartItem => {
        const productIndex = updatedProducts.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            const product = updatedProducts[productIndex];
            let deliveredContent = '';
            
            try {
                // Try to treat content as Inventory Array
                const secrets = JSON.parse(product.secretContent);
                if (Array.isArray(secrets)) {
                    // It's a managed inventory array
                    const itemsToDeliver = secrets.slice(0, cartItem.quantity);
                    const remainingItems = secrets.slice(cartItem.quantity);
                    
                    // Format multiple items with separator
                    deliveredContent = itemsToDeliver.join('\n\n====================\n\n');
                    
                    // Update Product
                    updatedProducts[productIndex] = {
                        ...product,
                        stock: remainingItems.length,
                        secretContent: JSON.stringify(remainingItems)
                    };
                } else {
                    // It was JSON but not array? Treat as string
                     deliveredContent = product.secretContent;
                     updatedProducts[productIndex].stock = Math.max(0, product.stock - cartItem.quantity);
                }
            } catch (e) {
                // Not JSON, simple string content
                deliveredContent = product.secretContent;
                updatedProducts[productIndex].stock = Math.max(0, product.stock - cartItem.quantity);
            }

            newOrders.push({
                id: Date.now().toString() + Math.random(),
                productId: cartItem.id,
                productName: cartItem.name,
                content: deliveredContent || 'No content delivered. Contact support.',
                price: cartItem.price,
                timestamp: Date.now()
            });
        }
    });

    // Commit Product Updates
    setProducts(updatedProducts);
    await dbService.saveProducts(updatedProducts);

    // Commit User Updates
    const updatedUser = { 
        ...currentUser, 
        balance: currentUser.balance - total, 
        orders: [...currentUser.orders, ...newOrders] 
    };
    
    setUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    setCurrentUser(updatedUser);
    await dbService.saveUser(updatedUser);
    
    setCart([]); 
    setIsCartOpen(false); 
    setIsProcessingCheckout(false); 
    setCurrentView('profile');
    alert('Purchase confirmed! Credentials added to your profile.');
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return p.isVisible && matchesCategory && matchesSearch;
  });

  if (isLoadingDB) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-sky-50">
        <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
        <h1 className="text-sky-800 font-bold tracking-widest text-lg">CONNECTING NETTOOLZ</h1>
        <p className="text-sky-400 text-xs mt-2 animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 font-sans">
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        logoUrl={settings.logoUrl}
        currentUserEmail={currentUser?.email}
        onNavigate={setCurrentView} 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      {!dbConnected && (
        <div className="bg-red-500 text-white text-center py-1 text-xs font-bold">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Database Connection Failed - Running in Offline Mode
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
        {/* Main Store Layout */}
        {(currentView === 'home' || currentView === 'category') && (
          <ProductCatalog 
            products={products}
            categories={settings.categories}
            onAddToCart={addToCart}
            onViewDetails={(p) => { setSelectedProduct(p); setCurrentView('product'); }}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetails 
            product={selectedProduct}
            onBack={() => setCurrentView('home')}
            onAddToCart={addToCart}
          />
        )}

        {currentView === 'profile' && (
          currentUser ? (
            <UserProfile user={currentUser} settings={settings} onFundWallet={() => setCurrentView('fund_wallet')} onLogout={() => { auth.signOut(); setCurrentUser(null); localStorage.removeItem('nettoolz_logged_user_email'); setCurrentView('home'); }} />
          ) : (
            <UserAuth onAuth={handleAuth} onCancel={() => setCurrentView('home')} />
          )
        )}

        {currentView === 'fund_wallet' && <WalletFunding settings={settings} onBack={() => setCurrentView('profile')} onFundSuccess={handleFundSuccess} />}
        {currentView === 'admin_dashboard' && isAdminLoggedIn && <AdminDashboard products={products} settings={settings} admins={admins} users={users} onUpdateProducts={handleUpdateProducts} onUpdateSettings={handleUpdateSettings} onUpdateAdmins={handleUpdateAdmins} onLogout={() => { setIsAdminLoggedIn(false); localStorage.removeItem('nettoolz_admin_logged'); setCurrentView('home'); }} />}
        {currentView === 'admin_login' && <AdminLogin onLogin={(s) => { if(s) { setIsAdminLoggedIn(true); localStorage.setItem('nettoolz_admin_logged', 'true'); setCurrentView('admin_dashboard'); } }} onCancel={() => setCurrentView('home')} />}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-basket-shopping text-2xl text-slate-300"></i>
                  </div>
                  <p className="text-sm font-medium">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 bg-white rounded-xl border border-sky-100 shadow-sm">
                    <div className="w-14 h-14 bg-sky-50 rounded-lg flex items-center justify-center p-1 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{item.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sky-600 font-black text-sm">₦{item.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                           <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                           <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-500 ml-2"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 mt-auto">
                <div className="bg-sky-50 p-4 rounded-xl mb-4 flex justify-between items-center">
                   <span className="text-slate-500 text-sm font-medium">Total Amount</span>
                   <span className="text-xl font-black text-sky-600">₦{cart.reduce((a, i) => a + (i.price * i.quantity), 0).toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={isProcessingCheckout} className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sky-600 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none text-sm uppercase tracking-wide">
                  {isProcessingCheckout ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-sky-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                 <i className="fa-solid fa-globe text-white text-[10px]"></i>
              </div>
              <span className="font-black text-slate-800 tracking-tight">NETTOOLZ</span>
           </div>
          <p className="text-slate-400 text-xs">© 2024 NETTOOLZ. Premium Digital Assets.</p>
          <button onClick={() => setCurrentView('admin_login')} className="mt-6 text-[10px] text-slate-300 hover:text-sky-500 font-bold uppercase tracking-widest transition-colors">Admin Access</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
