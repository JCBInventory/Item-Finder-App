import React from 'react';
import { InventoryItem } from '../types';

interface Props {
  item: InventoryItem;
  onAddToQuote: (item: InventoryItem) => void;
}

const ProductCard: React.FC<Props> = ({ item, onAddToQuote }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-l-4 border-secondary p-4 mb-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded mb-1">
            {item.itemNo}
          </span>
          <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{item.description}</h3>
          <p className="text-sm text-gray-600 mb-2">{item.group} • {item.model}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3 bg-gray-50 p-2 rounded">
        <div className="flex flex-col">
           <span className="text-xs text-gray-500">BHL/HLN</span>
           <span className="font-medium">{item.bhlHlnFlag || '-'}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-xs text-gray-500">HSN Tax</span>
           <span className="font-medium">{item.hsnTax}%</span>
        </div>
        <div className="flex flex-col">
           <span className="text-xs text-gray-500">Sale Rate</span>
           <span className="font-medium">{item.saleRate}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-xs text-gray-500">MRP</span>
           <span className="font-bold text-primary">{item.mrp.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => onAddToQuote(item)}
        className="w-full bg-primary hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
      >
        <i className="fas fa-plus"></i> Add to Quotation
      </button>
    </div>
  );
};

export default ProductCard;