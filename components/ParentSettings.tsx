import React, { useState } from 'react';
import { APP_TITLE } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string | null;
  onSave: (url: string) => void;
  onLogout: () => void;
}

const ParentSettings: React.FC<Props> = ({ isOpen, onClose, currentUrl, onSave, onLogout }) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim()) {
      setError("URL cannot be empty");
      return;
    }
    if (!url.includes('google.com/spreadsheets')) {
      setError("Please enter a valid Google Sheets URL");
      return;
    }
    setError('');
    onSave(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-primary p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Parent Settings</h2>
          <button onClick={onClose} className="text-white hover:text-secondary">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Google Sheet URL
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Paste the public link to your inventory Google Sheet.
            </p>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary text-sm"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              className="w-full bg-primary text-white font-bold py-2 rounded hover:bg-blue-800"
            >
              Save Configuration
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button
              onClick={onLogout}
              className="w-full bg-red-100 text-red-600 font-bold py-2 rounded hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 px-6 py-3 text-xs text-center text-gray-500">
          {APP_TITLE} Configuration
        </div>
      </div>
    </div>
  );
};

export default ParentSettings;