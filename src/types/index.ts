export type MerchantName = 'Adafruit' | 'Amazon' | 'Home Depot' | 'MicroCenter' | 'Appliance Repair Parts' | 'King Arthur Baking' | 'EKWB Specialty' | 'Local Mills Depot';

export interface BomItem {
  id: string;
  title: string;
  category: string;
  merchant: MerchantName;
  merchantLogo: string;
  merchantColor: string;
  url: string;
  price: number;
  quantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'preorder';
  sku: string;
  image: string;
  spec?: string;
}

export interface PravaCard {
  cardId: string;
  merchantName: MerchantName;
  cardNumber: string;
  maskedCardNumber: string;
  expDate: string;
  cvv: string;
  cardHolder: string;
  limitAmount: number;
  spentAmount: number;
  status: 'active' | 'used' | 'locked' | 'expired';
  merchantLock: string;
  generatedAt: string;
}

export type ActionType = 'navigate' | 'search_item' | 'add_to_cart' | 'fill_shipping' | 'inject_prava_card' | 'submit_order';

export interface ExecutionStep {
  stepId: string;
  tabId: string;
  merchantName: MerchantName;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'hitl_paused';
  actionType: ActionType;
  logMessage: string;
  activeSelector?: string;
  timestamp: string;
}

export interface BrowserTabState {
  tabId: string;
  merchantName: MerchantName;
  merchantUrl: string;
  merchantLogo: string;
  merchantColor: string;
  currentStepIndex: number;
  steps: ExecutionStep[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  currentUrl: string;
  cartCount: number;
  cartTotal: number;
  pravaCard?: PravaCard;
  domScreenshot?: string;
}

export interface OrderReceipt {
  orderId: string;
  merchantName: MerchantName;
  merchantLogo: string;
  items: BomItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalPaid: number;
  pravaCardUsed: string;
  confirmationScreenshot: string;
  trackingNumber: string;
  orderDate: string;
  status: 'confirmed' | 'shipped' | 'delivered';
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'DIY & Electronics' | 'Appliance Repair' | 'Custom PC' | 'B2B Procurement';
  iconName: string;
  inputUrlOrPrompt: string;
  description: string;
  bomItems: BomItem[];
  totalAmount: number;
  suggestedLimit: number;
  merchantCount: number;
  hitlStepIndex?: number;
  hitlMessage?: string;
}
