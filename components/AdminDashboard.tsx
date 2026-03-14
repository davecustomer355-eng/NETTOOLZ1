
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category, SiteSettings, AdminUser, PaymentMethod, User } from '../types';

interface AdminDashboardProps {
  products: Product[];
  settings: SiteSettings;
  admins: AdminUser[];
  users: User[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  onUpdateAdmins: (newAdmins: AdminUser[]) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, settings, admins, users, onUpdateProducts, onUpdateSettings, onUpdateAdmins, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'admins' | 'payments' | 'sales'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Bulk & Global Actions State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>(settings.categories[0]?.id || '');

  // Inventory Depth State
  const [activePayloads, setActivePayloads] = useState<string[]>([]);

  const editFileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: settings.categories[0]?.id || '',
    stock: '', image: '', features: '', secretContent: ''
  });

  const [newCategory, setNewCategory] = useState({ name: '', icon: 'fa-box' });
  const [newAdmin, setNewAdmin] = useState({ username: '', role: 'editor' as 'super' | 'editor' });

  // Reset payloads when opening create form
  useEffect(() => {
    if (showCreateForm) {
      setActivePayloads([]);
      setNewProduct(prev => ({ ...prev, stock: '' }));
    }
  }, [showCreateForm]);

  // Initialize payloads when editing
  useEffect(() => {
    if (editingProduct) {
      try {
        const parsed = JSON.parse(editingProduct.secretContent);
        if (Array.isArray(parsed)) {
          setActivePayloads(parsed);
        } else {
          setActivePayloads(Array(editingProduct.stock).fill(editingProduct.secretContent));
        }
      } catch {
         setActivePayloads(Array(editingProduct.stock).fill(editingProduct.secretContent));
      }
    }
  }, [editingProduct]);

  const updatePayloadCount = (count: number, isEdit: boolean) => {
    const current = [...activePayloads];
    if (count > current.length) {
       for(let i = current.length; i < count; i++) current.push('');
    } else {
       current.length = count;
    }
    setActivePayloads(current);
    
    if (isEdit && editingProduct) {
       setEditingProduct({...editingProduct, stock: count});
    } else if (!isEdit) {
       setNewProduct({...newProduct, stock: count.toString()});
    }
  };

  const handlePayloadChange = (index: number, value: string) => {
    const updated = [...activePayloads];
    updated[index] = value;
    setActivePayloads(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit && editingProduct) setEditingProduct({ ...editingProduct, image: base64 });
        else setNewProduct({ ...newProduct, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const stockCount = parseInt(newProduct.stock) || 0;
    const finalPayloads = activePayloads.slice(0, stockCount);
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: stockCount,
      rating: 5.0,
      image: newProduct.image || 'https://picsum.photos/seed/tool/400/300',
      features: newProduct.features.split(',').map(f => f.trim()).filter(f => f !== ''),
      isVisible: true,
      secretContent: JSON.stringify(finalPayloads)
    };
    onUpdateProducts([product, ...products]);
    setShowCreateForm(false);
    setNewProduct({ name: '', description: '', price: '', category: settings.categories[0]?.id || '', stock: '', image: '', features: '', secretContent: '' });
    setActivePayloads([]);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const finalPayloads = activePayloads.slice(0, editingProduct.stock);
    
    const updatedProduct = {
       ...editingProduct,
       secretContent: JSON.stringify(finalPayloads)
    };

    onUpdateProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setActivePayloads([]);
  };

  // Bulk Operations
  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length && products.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const bulkUpdateVisibility = (visible: boolean) => {
    onUpdateProducts(products.map(p => 
      selectedProductIds.includes(p.id) ? { ...p, isVisible: visible } : p
    ));
    setSelectedProductIds([]);
  };

  const bulkDeleteProducts = () => {
    onUpdateProducts(products.filter(p => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    setShowBulkDeleteConfirm(false);
  };

  const bulkUpdateCategory = () => {
    onUpdateProducts(products.map(p => 
      selectedProductIds.includes(p.id) ? { ...p, category: bulkCategoryTarget } : p
    ));
    setSelectedProductIds([]);
    setShowBulkCategoryModal(false);
  };

  const bulkUpdateStock = (amount: number) => {
    onUpdateProducts(products.map(p => 
      selectedProductIds.includes(p.id) ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    ));
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cat: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name,
      icon: newCategory.icon
    };
    onUpdateSettings({ ...settings, categories: [...settings.categories, cat] });
    setShowCategoryForm(false);
    setNewCategory({ name: '', icon: 'fa-box' });
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    onUpdateSettings({
      ...settings,
      categories: settings.categories.map(c => c.id === editingCategory.id ? editingCategory : c)
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = () => {
    if (!editingCategory) return;
    if (confirm(`Are you sure you want to delete "${editingCategory.name}"? Products in this category may become hidden.`)) {
       onUpdateSettings({
         ...settings,
         categories: settings.categories.filter(c => c.id !== editingCategory.id)
       });
       setEditingCategory(null);
    }
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin: AdminUser = {
      id: Date.now().toString(),
      username: newAdmin.username,
      role: newAdmin.role
    };
    onUpdateAdmins([...admins, admin]);
    setShowAdminForm(false);
    setNewAdmin({ username: '', role: 'editor' });
  };

  const handleDeleteAdmin = (id: string) => {
    if(confirm("Remove this staff member?")) {
      onUpdateAdmins(admins.filter(a => a.id !== id));
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    const methods = settings.paymentMethods.map(m => m.id === editingPayment.id ? editingPayment : m);
    onUpdateSettings({ ...settings, paymentMethods: methods });
    setEditingPayment(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-800 overflow-hidden shadow-[0_20px_50px_rgba(14,165,233,0.05)] mb-12 transition-all">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-slate-900 p-10 shrink-0 flex flex-col">
        <div className="flex items-center space-x-3 mb-16">
          <div className="bg-skyblue-500 p-2 rounded-xl text-white shadow-lg shadow-skyblue-500/20">
            <i className="fa-solid fa-gauge-high"></i>
          </div>
          <h2 className="text-xl font-black text-white tracking-tighter uppercase">NetToolz Control</h2>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setActiveTab('products')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'products' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-cube w-5"></i><span>Inventory</span>
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'categories' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-tags w-5"></i><span>Categories</span>
          </button>
          <button onClick={() => setActiveTab('admins')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'admins' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-user-shield w-5"></i><span>Staff Portal</span>
          </button>
          <button onClick={() => setActiveTab('sales')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'sales' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-receipt w-5"></i><span>Sales Log</span>
          </button>
          <button onClick={() => setActiveTab('payments')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'payments' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-code w-5"></i><span>API Integrations</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center space-x-4 transition-all ${activeTab === 'settings' ? 'bg-skyblue-500 text-white shadow-xl shadow-skyblue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className="fa-solid fa-sliders w-5"></i><span>Site Config</span>
          </button>
        </nav>

        <button onClick={onLogout} className="mt-12 w-full text-left px-5 py-4 text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all">
          <i className="fa-solid fa-power-off mr-3"></i><span>Secure Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 bg-skyblue-50/10 dark:bg-slate-900/40 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h3 className="text-4xl font-black dark:text-white tracking-tighter capitalize">{activeTab}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Enterprise Management Unit</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {activeTab === 'products' && (
              <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`flex items-center space-x-3 font-black px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 ${showCreateForm ? 'bg-slate-800 text-white' : 'bg-skyblue-500 text-white shadow-skyblue-500/20'}`}
              >
                <i className={`fa-solid ${showCreateForm ? 'fa-xmark' : 'fa-plus'}`}></i>
                <span>{showCreateForm ? 'Discard' : 'Deploy New Asset'}</span>
              </button>
            )}
            {activeTab === 'categories' && (
              <button 
                onClick={() => setShowCategoryForm(!showCategoryForm)} 
                className={`flex items-center space-x-3 font-black px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 ${showCategoryForm ? 'bg-slate-800 text-white' : 'bg-skyblue-500 text-white shadow-skyblue-500/20'}`}
              >
                <i className={`fa-solid ${showCategoryForm ? 'fa-xmark' : 'fa-folder-plus'}`}></i>
                <span>{showCategoryForm ? 'Discard' : 'New Segment'}</span>
              </button>
            )}
            {activeTab === 'admins' && (
              <button onClick={() => setShowAdminForm(!showAdminForm)} className={`flex items-center space-x-3 font-black px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 ${showAdminForm ? 'bg-slate-800 text-white' : 'bg-skyblue-500 text-white shadow-skyblue-500/20'}`}>
                <i className={`fa-solid ${showAdminForm ? 'fa-xmark' : 'fa-user-plus'}`}></i>
                <span>{showAdminForm ? 'Cancel' : 'Provision Account'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab: Products */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {showCreateForm && (
               <form onSubmit={handleCreateProduct} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
                 <h4 className="text-2xl font-black dark:text-white mb-6">Asset Specifications</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex items-center space-x-6 mb-4">
                      <div className="w-32 h-32 rounded-3xl bg-skyblue-50/50 dark:bg-slate-950 border-2 border-dashed border-skyblue-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                        {newProduct.image ? (
                          <img src={newProduct.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <i className="fa-solid fa-cloud-arrow-up text-3xl text-skyblue-300 mb-2 block"></i>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Visual</p>
                          </div>
                        )}
                        <input type="file" ref={createFileInputRef} onChange={(e) => handleImageUpload(e, false)} className="hidden" accept="image/*" />
                        <button type="button" onClick={() => createFileInputRef.current?.click()} className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Change Image</button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Product Identity</label>
                        <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" placeholder="e.g. Proxy Suite v4" />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Asset Description</label>
                      <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-medium min-h-[100px]" placeholder="Provide a detailed breakdown of the digital asset's capabilities..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Price Point (NGN)</label>
                      <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Classification</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold">
                        {settings.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Initial Inventory</label>
                      <input 
                        required 
                        type="number" 
                        min="0"
                        value={newProduct.stock} 
                        onChange={e => updatePayloadCount(parseInt(e.target.value) || 0, false)} 
                        className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                      />
                    </div>
                    
                    {/* INVENTORY DEPTH TABLE */}
                    <div className="md:col-span-2 space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 flex justify-between items-center">
                         <span>Inventory Depth Payloads ({activePayloads.length} Units)</span>
                         <span className="text-skyblue-500">Secure Tabula Form</span>
                       </label>
                       
                       <div className="bg-skyblue-50/50 dark:bg-slate-900 rounded-2xl border border-skyblue-100 dark:border-slate-700 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                         <table className="w-full text-left border-collapse">
                           <thead className="bg-skyblue-100/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black sticky top-0 z-10">
                             <tr>
                               <th className="p-3 w-20 text-center border-r border-skyblue-200/20">Unit #</th>
                               <th className="p-3">Secure Credential / Payload Data</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-skyblue-100 dark:divide-slate-800">
                             {activePayloads.map((payload, idx) => (
                               <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="p-3 text-center font-mono text-xs text-slate-400 border-r border-skyblue-200/20">{idx + 1}</td>
                                 <td className="p-1">
                                   <input 
                                     type="text" 
                                     value={payload} 
                                     onChange={(e) => handlePayloadChange(idx, e.target.value)}
                                     placeholder={`Enter credentials for Unit #${idx + 1}`}
                                     className="w-full bg-transparent p-2 text-sm font-mono text-slate-700 dark:text-slate-200 outline-none placeholder-slate-300"
                                   />
                                 </td>
                               </tr>
                             ))}
                             {activePayloads.length === 0 && (
                               <tr>
                                 <td colSpan={2} className="p-6 text-center text-slate-400 text-xs italic">Set initial inventory to greater than 0 to configure payloads.</td>
                               </tr>
                             )}
                           </tbody>
                         </table>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-end pt-6">
                   <button type="submit" className="bg-skyblue-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all">Finalize & Deploy</button>
                 </div>
               </form>
            )}

            {/* Bulk Actions Floating Bar */}
            {selectedProductIds.length > 0 && (
              <div className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-6 animate-in slide-in-from-top-6 duration-300 sticky top-4 z-40 border border-white/5 backdrop-blur-md bg-slate-900/95">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-skyblue-500 text-white rounded-2xl shadow-lg">
                    <span className="font-black">{selectedProductIds.length}</span>
                  </div>
                  <div>
                    <h5 className="font-black text-lg leading-tight">Batch Selection</h5>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Assets are primed for action</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <button onClick={() => bulkUpdateVisibility(true)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-skyblue-400"><i className="fa-solid fa-eye mr-2"></i>Show</button>
                    <button onClick={() => bulkUpdateVisibility(false)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-slate-400"><i className="fa-solid fa-eye-slash mr-2"></i>Hide</button>
                  </div>

                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <button onClick={() => setShowBulkCategoryModal(true)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-white"><i className="fa-solid fa-folder-tree mr-2"></i>Move</button>
                    <button onClick={() => bulkUpdateStock(10)} className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-white"><i className="fa-solid fa-plus mr-1"></i>10 Stock</button>
                  </div>

                  <button onClick={() => setShowBulkDeleteConfirm(true)} className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-red-500/20 text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">
                    <i className="fa-solid fa-trash-can mr-2"></i>Terminal Delete
                  </button>

                  <button onClick={() => setSelectedProductIds([])} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 overflow-hidden shadow-sm transition-all">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-skyblue-50/50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6 w-12 text-center border-b border-skyblue-100 dark:border-slate-700">
                        <input type="checkbox" checked={selectedProductIds.length === products.length && products.length > 0} onChange={toggleSelectAll} className="w-5 h-5 rounded-lg text-skyblue-500 border-skyblue-200 focus:ring-skyblue-500 cursor-pointer" />
                      </th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Item Number</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Item Name</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Price</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Description</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Log Detail</th>
                      <th className="px-8 py-6 text-center border-b border-skyblue-100 dark:border-slate-700">Control</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm dark:text-slate-300">
                    {products.length === 0 ? (
                      <tr><td colSpan={7} className="px-8 py-24 text-center text-slate-400 italic font-medium">No assets currently registered in the inventory.</td></tr>
                    ) : (
                      products.map((p, idx) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <tr key={p.id} className={`border-t border-skyblue-50 dark:border-slate-700 transition-all ${isSelected ? 'bg-skyblue-50 dark:bg-skyblue-900/10' : 'hover:bg-skyblue-50/20 dark:hover:bg-slate-900/10'}`}>
                            <td className="px-8 py-6 text-center">
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelectProduct(p.id)} className="w-5 h-5 rounded-lg text-skyblue-500 border-skyblue-200 cursor-pointer" />
                            </td>
                            <td className="px-8 py-6 font-mono text-xs text-slate-500">
                              {p.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                <img src={p.image} className="w-10 h-10 rounded-xl object-cover border dark:border-slate-700" />
                                <span className="font-black dark:text-white">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-black text-slate-900 dark:text-white">
                              {settings.currencySymbol}{p.price.toLocaleString()}
                            </td>
                            <td className="px-8 py-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                              {p.description}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${p.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {p.stock > 0 ? `${p.stock} Units In Stock` : 'Out of Stock'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{p.category}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center space-x-3">
                                <button onClick={() => setEditingProduct(p)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-skyblue-100 dark:border-slate-700 text-skyblue-500 rounded-xl hover:bg-skyblue-500 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-pen-nib text-sm"></i></button>
                                <button onClick={() => setProductToDelete(p)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-red-50 dark:border-slate-700 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-trash-can text-sm"></i></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             {showCategoryForm && (
               <form onSubmit={handleCreateCategory} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
                 <h4 className="text-2xl font-black dark:text-white mb-6">New Category Segment</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Segment Name</label>
                      <input required type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" placeholder="e.g. Cloud Storage" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Icon Class (FontAwesome)</label>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-skyblue-50 dark:bg-slate-900 flex items-center justify-center text-skyblue-500 text-xl border border-skyblue-100 dark:border-slate-700">
                          <i className={`fa-solid ${newCategory.icon || 'fa-box'}`}></i>
                        </div>
                        <input required type="text" value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="flex-1 bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" placeholder="e.g. fa-server" />
                      </div>
                      <p className="text-[10px] text-slate-400 px-1">Use free FontAwesome 6 class names.</p>
                    </div>
                 </div>
                 <div className="flex justify-end pt-6 gap-4">
                   <button type="button" onClick={() => setShowCategoryForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                   <button type="submit" className="bg-skyblue-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all">Create Segment</button>
                 </div>
               </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {settings.categories.map(cat => (
              <div key={cat.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-skyblue-50 dark:border-slate-700 shadow-sm flex items-center justify-between group transition-all hover:border-skyblue-400 hover:shadow-xl hover:shadow-skyblue-500/5">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-skyblue-50 dark:bg-slate-900 text-skyblue-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    <i className={`fa-solid ${cat.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-black text-lg dark:text-white leading-tight">{cat.name}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ref: {cat.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCategory(cat)} className="w-10 h-10 flex items-center justify-center bg-skyblue-50 dark:bg-slate-900 text-skyblue-500 rounded-xl hover:bg-skyblue-500 hover:text-white transition-all"><i className="fa-solid fa-pen"></i></button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Tab: Admins */}
        {activeTab === 'admins' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             {showAdminForm && (
                <form onSubmit={handleCreateAdmin} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
                   <h4 className="text-2xl font-black dark:text-white mb-6">Staff Provisioning</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Username</label>
                        <input required type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Access Level</label>
                        <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value as 'super' | 'editor'})} className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold">
                           <option value="editor">Editor (Standard)</option>
                           <option value="super">Super Admin (Full Access)</option>
                        </select>
                      </div>
                   </div>
                   <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                      <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                      Default Password for new accounts is "Admin2492". Staff must change it upon first login.
                   </div>
                   <div className="flex justify-end pt-6 gap-4">
                     <button type="button" onClick={() => setShowAdminForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                     <button type="submit" className="bg-skyblue-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all">Provision User</button>
                   </div>
                </form>
             )}

             <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-skyblue-50/50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                     <tr>
                        <th className="px-8 py-6">Staff Identity</th>
                        <th className="px-8 py-6">Role / Clearance</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-center">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm dark:text-slate-300">
                     {admins.map(admin => (
                        <tr key={admin.id} className="border-t border-skyblue-50 dark:border-slate-700 hover:bg-skyblue-50/20 dark:hover:bg-slate-900/10 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-xl bg-skyblue-100 dark:bg-slate-900 text-skyblue-500 flex items-center justify-center font-black text-lg">
                                    {admin.username.charAt(0).toUpperCase()}
                                 </div>
                                 <span className="font-bold dark:text-white">{admin.username}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${admin.role === 'super' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                 {admin.role}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center space-x-2">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                 <span className="text-xs font-bold text-slate-400">Active</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {/* Prevent deleting the main admin if wanted, but for now allow generic delete */}
                              <button onClick={() => handleDeleteAdmin(admin.id)} className="w-10 h-10 inline-flex items-center justify-center bg-white dark:bg-slate-900 border border-red-100 dark:border-slate-700 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                 <i className="fa-solid fa-trash-can text-sm"></i>
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-skyblue-50/50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Item Number</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Item Name</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Price</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Description</th>
                      <th className="px-8 py-6 border-b border-skyblue-100 dark:border-slate-700">Log Detail</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm dark:text-slate-300">
                    {users.flatMap(u => u.orders).length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-24 text-center text-slate-400 italic font-medium">No sales records found.</td></tr>
                    ) : (
                      users.flatMap(u => u.orders).sort((a, b) => b.timestamp - a.timestamp).map((order, idx) => (
                        <tr key={order.id} className="border-t border-skyblue-50 dark:border-slate-700 hover:bg-skyblue-50/20 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-8 py-6 font-mono text-xs text-slate-500">
                            {order.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-8 py-6 font-black dark:text-white">
                            {order.productName}
                          </td>
                          <td className="px-8 py-6 font-black text-green-600">
                            {settings.currencySymbol}{order.price.toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {products.find(p => p.id === order.productId)?.description || 'Digital Asset'}
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-block px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-black text-[10px] uppercase tracking-widest">
                              Purchase successful on {new Date(order.timestamp).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-2xl font-black dark:text-white">Payment Gateways</h4>
                    <p className="text-sm text-slate-400 font-medium mt-1">Configure automated processors and manual accounts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {settings.paymentMethods.map(method => (
                    <div key={method.id} className={`p-8 rounded-[2rem] border transition-all ${method.isActive ? 'bg-white dark:bg-slate-900 border-skyblue-200 dark:border-slate-600 shadow-lg shadow-skyblue-500/5' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 grayscale'}`}>
                       <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-4">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${method.type === 'bank' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                               <i className={`fa-solid ${method.type === 'bank' ? 'fa-building-columns' : 'fa-bitcoin-sign'}`}></i>
                             </div>
                             <div>
                               <h5 className="font-black text-lg text-slate-800 dark:text-white">{method.name}</h5>
                               <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${method.isAutomated ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {method.isAutomated ? 'Automated API' : 'Manual Transfer'}
                                  </span>
                               </div>
                             </div>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={method.isActive} 
                              onChange={() => {
                                const updated = settings.paymentMethods.map(m => m.id === method.id ? { ...m, isActive: !m.isActive } : m);
                                onUpdateSettings({ ...settings, paymentMethods: updated });
                              }} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skyblue-500"></div>
                          </label>
                       </div>
                       
                       <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">{method.details}</p>
                       
                       <button 
                         onClick={() => setEditingPayment(method)}
                         className="w-full py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:border-skyblue-500 hover:text-skyblue-500 transition-colors flex items-center justify-center space-x-2"
                       >
                         <i className="fa-solid fa-gear"></i>
                         <span>Configure Settings</span>
                       </button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
             <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-2xl font-black dark:text-white">Brand Settings</h4>
                    <p className="text-sm text-slate-400 font-medium mt-1">Manage your store identity and visual branding.</p>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  <div className="w-full lg:w-72 h-72 bg-skyblue-50/50 dark:bg-slate-900 border-2 border-dashed border-skyblue-200 dark:border-slate-700 rounded-[2rem] flex items-center justify-center overflow-hidden transition-all relative">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-8">
                        <i className="fa-solid fa-image text-5xl text-skyblue-300 mb-5 block"></i>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Logo</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="bg-skyblue-500/5 p-8 rounded-3xl border border-skyblue-500/10">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        Upload your business logo to appear on invoices and headers.
                      </p>
                      <input 
                        type="text" 
                        value={settings.logoUrl || ''} 
                        onChange={(e) => onUpdateSettings({...settings, logoUrl: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold mb-4"
                        placeholder="Paste logo URL here..."
                      />
                    </div>
                  </div>
                </div>
             </div>

             {/* New General Configuration Section */}
             <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-skyblue-100 dark:border-slate-700 shadow-sm">
                <div className="mb-10">
                  <h4 className="text-2xl font-black dark:text-white">General Configuration</h4>
                  <p className="text-sm text-slate-400 font-medium mt-1">Core application settings and localization.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Store Name</label>
                    <input 
                      type="text" 
                      value={settings.storeName} 
                      onChange={(e) => onUpdateSettings({...settings, storeName: e.target.value})} 
                      className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Exchange Rate (1 USDT)</label>
                    <input 
                      type="number" 
                      value={settings.usdtToNairaRate} 
                      onChange={(e) => onUpdateSettings({...settings, usdtToNairaRate: Number(e.target.value)})} 
                      className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Currency Code</label>
                    <input 
                      type="text" 
                      value={settings.currency} 
                      onChange={(e) => onUpdateSettings({...settings, currency: e.target.value})} 
                      className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Currency Symbol</label>
                    <input 
                      type="text" 
                      value={settings.currencySymbol} 
                      onChange={(e) => onUpdateSettings({...settings, currencySymbol: e.target.value})} 
                      className="w-full bg-skyblue-50/50 dark:bg-slate-900 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                    />
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowBulkDeleteConfirm(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-red-100 dark:border-slate-800 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner"><i className="fa-solid fa-radiation"></i></div>
            <h3 className="text-3xl font-black mb-4 dark:text-white tracking-tighter">Terminal Deletion?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 leading-relaxed font-medium">You are about to permanently remove <span className="font-black text-red-500">{selectedProductIds.length} assets</span> from the core database. This operation is non-reversible.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="flex-1 py-4 border-2 border-slate-100 text-sm font-black rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">Abort</button>
              <button onClick={bulkDeleteProducts} className="flex-1 py-4 bg-red-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all">Proceed to Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Category Move Modal */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowBulkCategoryModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-skyblue-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-skyblue-50 text-skyblue-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner"><i className="fa-solid fa-truck-ramp-box"></i></div>
            <h3 className="text-3xl font-black mb-6 dark:text-white tracking-tighter text-center">Relocate Assets</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Target Classification</label>
                <select value={bulkCategoryTarget} onChange={e => setBulkCategoryTarget(e.target.value)} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-5 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-black">
                  {settings.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <p className="text-xs text-slate-400 font-medium text-center">Move {selectedProductIds.length} items to new segment.</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowBulkCategoryModal(false)} className="flex-1 py-4 border-2 border-slate-100 text-sm font-black rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={bulkUpdateCategory} className="flex-1 py-4 bg-skyblue-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all">Relocate Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setEditingPayment(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-skyblue-100 dark:border-slate-800 animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar">
             <div className="flex items-center space-x-4 mb-8">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${editingPayment.type === 'bank' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                 <i className={`fa-solid ${editingPayment.type === 'bank' ? 'fa-building-columns' : 'fa-bitcoin-sign'}`}></i>
               </div>
               <div>
                 <h3 className="text-3xl font-black dark:text-white tracking-tighter">Gateway Config</h3>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{editingPayment.id}</p>
               </div>
             </div>

             <form onSubmit={handleSavePayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Display Name</label>
                     <input type="text" required value={editingPayment.name} onChange={e => setEditingPayment({...editingPayment, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-bold outline-none focus:border-skyblue-500" />
                   </div>

                   <div className="col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">User Instructions</label>
                     <textarea required value={editingPayment.details} onChange={e => setEditingPayment({...editingPayment, details: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-medium outline-none focus:border-skyblue-500 min-h-[100px]" />
                   </div>

                   <div className="col-span-2 flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-black text-slate-700 dark:text-white block">Automated Processing</span>
                        <span className="text-xs text-slate-400">Use API keys for instant verification</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editingPayment.isAutomated} 
                          onChange={e => setEditingPayment({...editingPayment, isAutomated: e.target.checked})} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-skyblue-500"></div>
                      </label>
                   </div>

                   {editingPayment.isAutomated ? (
                     <>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">API Public Key</label>
                          <input type="text" value={editingPayment.apiPublicKey || ''} onChange={e => setEditingPayment({...editingPayment, apiPublicKey: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-mono text-sm" placeholder="pk_live_..." />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Merchant ID</label>
                          <input type="text" value={editingPayment.merchantId || ''} onChange={e => setEditingPayment({...editingPayment, merchantId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-mono text-sm" />
                        </div>
                     </>
                   ) : (
                     <>
                        {editingPayment.type === 'bank' ? (
                          <>
                             <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Bank Name</label>
                               <input type="text" value={editingPayment.bankName || ''} onChange={e => setEditingPayment({...editingPayment, bankName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-bold" />
                             </div>
                             <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Account Number</label>
                               <input type="text" value={editingPayment.accountNumber || ''} onChange={e => setEditingPayment({...editingPayment, accountNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-bold" />
                             </div>
                             <div className="col-span-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Account Name</label>
                               <input type="text" value={editingPayment.accountName || ''} onChange={e => setEditingPayment({...editingPayment, accountName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-bold" />
                             </div>
                          </>
                        ) : (
                          <>
                             <div className="col-span-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Wallet Address</label>
                               <input type="text" value={editingPayment.walletAddress || ''} onChange={e => setEditingPayment({...editingPayment, walletAddress: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-mono text-sm" />
                             </div>
                             <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Network</label>
                               <input type="text" value={editingPayment.network || ''} onChange={e => setEditingPayment({...editingPayment, network: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 dark:text-white font-bold" placeholder="e.g. TRC20" />
                             </div>
                          </>
                        )}
                     </>
                   )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingPayment(null)} className="flex-1 py-4 border-2 border-slate-100 text-sm font-black rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-skyblue-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all">Save Changes</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal (NEW) */}
      {editingCategory && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setEditingCategory(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-skyblue-100 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-6 dark:text-white tracking-tighter">Edit Segment</h3>
            <form onSubmit={handleSaveCategoryEdit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Segment Name</label>
                  <input required type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Icon Class</label>
                  <div className="flex gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-skyblue-50 dark:bg-slate-900 flex items-center justify-center text-skyblue-500 text-xl border border-skyblue-100 dark:border-slate-700">
                        <i className={`fa-solid ${editingCategory.icon || 'fa-box'}`}></i>
                     </div>
                     <input required type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="flex-1 bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
                  </div>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleDeleteCategory} className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 text-red-500 font-black rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-sm uppercase tracking-widest">Delete</button>
                  <button type="submit" className="flex-1 py-4 bg-skyblue-500 text-white font-black rounded-2xl shadow-xl shadow-skyblue-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">Save</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Edit Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-skyblue-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black mb-8 dark:text-white tracking-tighter">Edit Asset Configuration</h3>
            <form onSubmit={handleSaveProductEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="md:col-span-2 flex items-center space-x-6 mb-4">
                <div className="w-32 h-32 rounded-3xl bg-skyblue-50 dark:bg-slate-950 border border-skyblue-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  <img src={editingProduct.image} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3">
                   <input type="file" ref={editFileInputRef} onChange={(e) => handleImageUpload(e, true)} className="hidden" accept="image/*" />
                   <button type="button" onClick={() => editFileInputRef.current?.click()} className="bg-skyblue-500 text-white text-xs font-black px-6 py-3 rounded-xl shadow-lg shadow-skyblue-500/20 transition-all active:scale-95">Update Asset Visual</button>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">PNG, JPG, OR GIF (MAX 2MB)</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Name</label>
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Description</label>
                <textarea required value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-medium min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Classification</label>
                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold">
                  {settings.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Price</label>
                <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Initial Inventory</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingProduct.stock} 
                  onChange={e => updatePayloadCount(parseInt(e.target.value) || 0, true)} 
                  className="w-full bg-skyblue-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-skyblue-100 dark:border-slate-700 dark:text-white font-bold" 
                />
              </div>
              
              {/* INVENTORY DEPTH TABLE FOR EDIT */}
              <div className="md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 flex justify-between items-center">
                   <span>Inventory Depth Payloads ({activePayloads.length} Units)</span>
                   <span className="text-skyblue-500">Secure Tabula Form</span>
                 </label>
                 
                 <div className="bg-skyblue-50/50 dark:bg-slate-900 rounded-2xl border border-skyblue-100 dark:border-slate-700 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                     <thead className="bg-skyblue-100/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black sticky top-0 z-10">
                       <tr>
                         <th className="p-3 w-20 text-center border-r border-skyblue-200/20">Unit #</th>
                         <th className="p-3">Secure Credential / Payload Data</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-skyblue-100 dark:divide-slate-800">
                       {activePayloads.map((payload, idx) => (
                         <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                           <td className="p-3 text-center font-mono text-xs text-slate-400 border-r border-skyblue-200/20">{idx + 1}</td>
                           <td className="p-1">
                             <input 
                               type="text" 
                               value={payload} 
                               onChange={(e) => handlePayloadChange(idx, e.target.value)}
                               placeholder={`Enter credentials for Unit #${idx + 1}`}
                               className="w-full bg-transparent p-2 text-sm font-mono text-slate-700 dark:text-slate-200 outline-none placeholder-slate-300"
                             />
                           </td>
                         </tr>
                       ))}
                       {activePayloads.length === 0 && (
                         <tr>
                           <td colSpan={2} className="p-6 text-center text-slate-400 text-xs italic">Set initial inventory to greater than 0 to configure payloads.</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4 pt-8">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="bg-skyblue-500 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-skyblue-500/20 transition-all active:scale-95">Update Specification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Delete Confirm */}
      {productToDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setProductToDelete(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 border border-red-50 text-center animate-in zoom-in-95">
            <h3 className="text-3xl font-black mb-4 dark:text-white tracking-tighter">Liquidate Asset?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 leading-relaxed font-medium">
              Are you sure you want to remove <span className="font-black text-slate-900 dark:text-white">"{productToDelete.name}"</span>?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setProductToDelete(null)} className="flex-1 py-4 border-2 border-slate-100 text-sm font-black rounded-2xl text-slate-500">Hold</button>
              <button onClick={() => { onUpdateProducts(products.filter(p => p.id !== productToDelete.id)); setProductToDelete(null); }} className="flex-1 py-4 bg-red-500 text-white text-sm font-black rounded-2xl transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
