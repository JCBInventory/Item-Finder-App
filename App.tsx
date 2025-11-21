import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserRole, 
  ViewState, 
  AppConfig, 
  InventoryItem, 
  CartItem 
} from './types';
import { 
  PARENT_ID, 
  PARENT_PASS, 
  APP_TITLE, 
  WATERMARK_TEXT 
} from './constants';
import { 
  getAppConfig, 
  saveAppConfig, 
  getAuthSession, 
  setAuthSession, 
  clearAuthSession 
} from './services/storageService';
import { fetchInventoryData } from './services/sheetService';
import { generatePDF } from './services/pdfService';
import ProductCard from './components/ProductCard';
import QuotationTab from './components/QuotationTab';
import ParentSettings from './components/ParentSettings';

// SVG Icons for inline usage
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const ListIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>;
const DocIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;

const App: React.FC = () => {
  // Get URL from query params
  const getSheetUrlFromParams = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sheet');
  };

  // State
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  // By default, users are not parent (child view)
  // Only parent can login to change settings
  const [isParent, setIsParent] = useState<boolean>(false);
  const [view, setView] = useState<ViewState>(ViewState.INVENTORY);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Check for URL in query params on mount
  useEffect(() => {
    const urlFromParams = getSheetUrlFromParams();
    if (urlFromParams) {
      // Use URL from params (don't save it)
      loadInventory(urlFromParams);
    } else if (config.sheetUrl) {
      // Fall back to saved config
      loadInventory(config.sheetUrl);
    }
  }, []);

  const loadInventory = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInventoryData(url);
      setInventory(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory. Check URL or internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleLogin = () => {
    if (loginId === PARENT_ID && loginPass === PARENT_PASS) {
      setIsParent(true);
      setAuthSession();
      setShowLoginModal(false);
      setLoginId('');
      setLoginPass('');
      setLoginError('');
    } else {
      setLoginError("Invalid ID or Password");
    }
  };

  const handleLogout = () => {
    setIsParent(false);
    clearAuthSession();
    setShowSettingsModal(false);
  };

  const handleConfigSave = (newUrl: string) => {
    saveAppConfig(newUrl);
    setConfig({ ...config, sheetUrl: newUrl, lastUpdated: Date.now() });
    setCart([]);
  };

  // Get current sheet URL (from params or config)
  const currentSheetUrl = getSheetUrlFromParams() || config.sheetUrl;

  // Cart Logic
  const addToQuote = (item: InventoryItem) => {
    setCart(prev => {
      const exists = prev.find(c => c.itemNo === item.itemNo);
      if (exists) {
        return prev.map(c => c.itemNo === item.itemNo ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.mrp } : c);
      }
      return [...prev, { ...item, qty: 1, total: item.mrp }];
    });
  };

  const updateCartQty = (itemNo: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.itemNo === itemNo) {
        return { ...item, qty, total: qty * item.mrp };
      }
      return item;
    }));
  };

  const removeCartItem = (itemNo: string) => {
    setCart(prev => prev.filter(item => item.itemNo !== itemNo));
  };

  const handleGeneratePDF = (discount: number) => {
    const subtotal = cart.reduce((acc, i) => acc + i.total, 0);
    const final = Math.max(0, subtotal - discount);
    generatePDF(cart, discount, subtotal, final);
  };

  // Filtering
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return inventory.filter(item => 
      item.itemNo.toLowerCase() === lower ||
      item.description.toLowerCase().includes(lower)
    );
  }, [searchTerm, inventory]);

  const isConfigured = !!currentSheetUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-blue-900 font-sans flex flex-col">
      
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-lg sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">{APP_TITLE}</h1>
        
        <div className="flex items-center gap-3">
          {!isConfigured && !isParent && (
             <span className="text-xs bg-secondary text-primary px-2 py-1 rounded font-bold animate-pulse">
               Setup Required
             </span>
          )}
          
          {isParent ? (
            <button onClick={() => setShowSettingsModal(true)} className="text-white hover:text-secondary transition-colors">
              <i className="fas fa-cog text-xl"></i>
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="text-white/50 hover:text-white transition-colors">
              <i className="fas fa-lock text-sm"></i>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto relative">
        
        {/* Inventory View */}
        {view === ViewState.INVENTORY && (
          <div className="p-4 pb-24">
            {/* Search Bar */}
            <div className="sticky top-20 z-10 mb-6">
              <div className={`relative flex items-center w-full rounded-full shadow-xl overflow-hidden transition-all ${isConfigured ? 'bg-secondary' : 'bg-gray-400'}`}>
                <div className="pl-4 text-primary">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  disabled={!isConfigured}
                  placeholder={isConfigured ? "Search Item No or Description..." : "Waiting for configuration..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-4 bg-transparent placeholder-gray-700/60 text-primary font-semibold outline-none disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Content Status */}
            {!isConfigured ? (
              <div className="text-center text-white mt-20 opacity-80">
                <i className="fas fa-satellite-dish text-4xl mb-4 animate-pulse"></i>
                <p className="text-lg">Waiting for setup.</p>
                <p className="text-sm">Parent must configure inventory URL.</p>
              </div>
            ) : loading ? (
              <div className="text-center text-white mt-20">
                <i className="fas fa-circle-notch fa-spin text-3xl text-secondary"></i>
                <p className="mt-2">Fetching Inventory...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-300 mt-10 bg-red-900/30 p-4 rounded">
                <p>{error}</p>
                <button onClick={() => loadInventory(currentSheetUrl!)} className="mt-2 underline">Retry</button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchTerm && filteredInventory.length === 0 && (
                   <p className="text-center text-white/70 mt-10">No items found matching "{searchTerm}"</p>
                )}
                {filteredInventory.map(item => (
                  <ProductCard key={item.itemNo} item={item} onAddToQuote={addToQuote} />
                ))}
                {!searchTerm && inventory.length > 0 && (
                  <div className="text-center text-white/50 mt-10">
                    <p>Enter a search term to find items.</p>
                    <p className="text-xs mt-2">Database loaded: {inventory.length} items</p>
                    <div className="mt-4 text-xs text-white/30">{WATERMARK_TEXT}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quotation View */}
        {view === ViewState.QUOTATION && (
          <QuotationTab 
            cart={cart} 
            updateQty={updateCartQty} 
            removeItem={removeCartItem} 
            onGeneratePDF={handleGeneratePDF}
          />
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setView(ViewState.INVENTORY)}
          className={`flex flex-col items-center justify-center w-1/2 h-full transition-colors ${view === ViewState.INVENTORY ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ListIcon />
          <span className="text-xs font-medium mt-1">Inventory</span>
        </button>
        
        <button 
          onClick={() => setView(ViewState.QUOTATION)}
          disabled={!isConfigured}
          className={`relative flex flex-col items-center justify-center w-1/2 h-full transition-colors ${view === ViewState.QUOTATION ? 'text-primary' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
        >
          <div className="relative">
            <DocIcon />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-xs font-medium mt-1">Quotation</span>
        </button>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-primary mb-4 text-center">Parent Access</h2>
            {loginError && <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{loginError}</div>}
            <input 
              type="text" 
              placeholder="ID" 
              value={loginId} 
              onChange={e => setLoginId(e.target.value)}
              className="w-full border p-3 rounded mb-3 focus:border-primary outline-none"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={loginPass} 
              onChange={e => setLoginPass(e.target.value)}
              className="w-full border p-3 rounded mb-6 focus:border-primary outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleLogin} className="flex-1 py-2 bg-primary text-white rounded hover:bg-blue-800 font-bold">Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Settings Modal */}
      <ParentSettings
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUrl={config.sheetUrl}
        onSave={handleConfigSave}
        onLogout={handleLogout}
      />

    </div>
  );
};

export default App;
