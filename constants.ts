export const APP_TITLE = "Item Finder";
export const WATERMARK_TEXT = "Design created by Arshad Ali";

// Auth Credentials
export const PARENT_ID = "inventory";
export const PARENT_PASS = "rmpl@123";

// Local Storage Keys
export const STORAGE_KEY_CONFIG = "item_finder_config";
export const STORAGE_KEY_AUTH = "item_finder_auth_session";

// CSV Column Mappings (Normalized to lower case for flexible matching)
export const COLUMN_MAPPING = {
  itemNo: ['item no', 'item no.', 'part no', 'id'],
  description: ['item description', 'description', 'desc', 'name'],
  group: ['item group', 'group', 'category'],
  model: ['model', 'model no'],
  bhlHlnFlag: ['bhl/hln flag', 'flag', 'type'],
  hsnTax: ['hsn tax %', 'hsn tax', 'tax', 'gst'],
  saleRate: ['sale rate', 'rate', 'price'],
  mrp: ['mrp', 'maximum retail price']
};