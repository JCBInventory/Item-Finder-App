import React, { useState, useMemo } from 'react';
import { CartItem } from '../types';
import { WATERMARK_TEXT } from '../constants';

interface Props {
  cart: CartItem[];
  updateQty: (itemNo: string, qty: number) => void;
  removeItem: (itemNo: string) => void;
  onGeneratePDF: (discountAmount: number) => void;
}

const QuotationTab: React.FC<Props> = ({ cart, updateQty, removeItem, onGeneratePDF }) => {
  const [discountPercent, setDiscountPercent] = useState<string>('0');

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total, 0);
  }, [cart]);

  const discountVal = parseFloat(discountPercent) || 0;
  const discountAmount = (subtotal * discountVal) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow empty string for typing
    if (val === '') {
      setDiscountPercent('');
      return;
    }

    // Limit to 0-100 range for percentage
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      if (numVal >= 0 && numVal <= 100) {
        setDiscountPercent(val);
      } else if (numVal > 100) {
        setDiscountPercent('100');
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white">
        <i className="fas fa-file-invoice text-6xl mb-4 text-secondary opacity-50"></i>
        <p className="text-xl font-semibold">No items in quotation</p>
        <p className="text-sm opacity-75 mt-2">Go to Inventory to add items</p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
        <div className="bg-primary p-4">
          <h2 className="text-xl font-bold text-white">Current Quotation</h2>
        </div>
        
        <div className="p-0">
          {cart.map((item) => (
            <div key={item.itemNo} className="border-b border-gray-100 p-4 flex flex-col gap-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-500">Item No: {item.itemNo}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.itemNo)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center border rounded">
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQty(item.itemNo, Math.max(1, item.qty - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.itemNo, parseInt(e.target.value) || 1)}
                    className="w-12 text-center outline-none"
                  />
                  <button 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                    onClick={() => updateQty(item.itemNo, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">@{item.mrp}</p>
                  <p className="font-bold text-primary">{item.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-semibold">{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">Discount (%):</span>
            <div className="flex items-center relative">
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={handleDiscountChange}
                className="w-20 border rounded px-2 py-1 text-right focus:border-primary outline-none pr-6"
                placeholder="0"
              />
              <span className="absolute right-2 text-gray-500 pointer-events-none">%</span>
            </div>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-500 italic">
              <span>Discount Amount:</span>
              <span>-{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-primary border-t border-gray-300 pt-2">
            <span>Total:</span>
            <span>{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => onGeneratePDF(discountAmount)}
            className="w-full bg-secondary hover:bg-yellow-500 text-primary font-bold py-3 px-4 rounded shadow-md flex justify-center items-center gap-2"
          >
            <i className="fas fa-file-pdf"></i> Download PDF
          </button>
        </div>
      </div>
      
      <div className="text-center text-white/40 text-xs mt-8 pb-4">
        {WATERMARK_TEXT}
      </div>
    </div>
  );
};

export default QuotationTab;