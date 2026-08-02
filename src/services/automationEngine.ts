import { BrowserTabState, ExecutionStep, MerchantName, PravaCard, BomItem } from '../types';
import { PravaService } from './pravaService';

export class AutomationEngine {
  /**
   * Initializes browser tabs for each unique merchant in the BOM list.
   */
  public static createTabsForMerchants(bomItems: BomItem[]): BrowserTabState[] {
    const merchantMap = new Map<MerchantName, BomItem[]>();
    
    bomItems.forEach((item) => {
      const existing = merchantMap.get(item.merchant) || [];
      existing.push(item);
      merchantMap.set(item.merchant, existing);
    });

    const tabs: BrowserTabState[] = [];
    let tabCount = 1;

    merchantMap.forEach((items, merchant) => {
      const merchantColor = items[0].merchantColor || '#7C3AED';
      const merchantLogo = items[0].merchantLogo;
      const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

      const steps: ExecutionStep[] = [
        {
          stepId: `step_${tabCount}_1`,
          tabId: `tab_${tabCount}`,
          merchantName: merchant,
          title: `Navigate to ${merchant} Storefront`,
          status: 'pending',
          actionType: 'navigate',
          logMessage: `Agent initializing headless browser to ${items[0].url.split('/')[2]}...`,
          activeSelector: 'body',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          stepId: `step_${tabCount}_2`,
          tabId: `tab_${tabCount}`,
          merchantName: merchant,
          title: `Locate SKUs & Add ${items.length} ${items.length === 1 ? 'Item' : 'Items'} to Cart`,
          status: 'pending',
          actionType: 'add_to_cart',
          logMessage: `Agent locating SKU #${items[0].sku} and triggering "Add to Cart"...`,
          activeSelector: 'button.add-to-cart-primary',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          stepId: `step_${tabCount}_3`,
          tabId: `tab_${tabCount}`,
          merchantName: merchant,
          title: 'Fill Shipping & Contact Information',
          status: 'pending',
          actionType: 'fill_shipping',
          logMessage: 'Agent executing DOM autofill for Shipping Address (100 Tech Way, Suite 400)...',
          activeSelector: 'form#checkout-shipping-address',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          stepId: `step_${tabCount}_4`,
          tabId: `tab_${tabCount}`,
          merchantName: merchant,
          title: 'Inject Prava Single-Use Virtual Card',
          status: 'pending',
          actionType: 'inject_prava_card',
          logMessage: `Requesting Prava API for single-use token locked to ${merchant}...`,
          activeSelector: 'input#card_number',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          stepId: `step_${tabCount}_5`,
          tabId: `tab_${tabCount}`,
          merchantName: merchant,
          title: 'Authorize Payment & Confirm Order',
          status: 'pending',
          actionType: 'submit_order',
          logMessage: 'Executing single-use virtual card charge and capturing DOM confirmation screenshot...',
          activeSelector: 'button#place_order_btn',
          timestamp: new Date().toLocaleTimeString()
        }
      ];

      tabs.push({
        tabId: `tab_${tabCount}`,
        merchantName: merchant,
        merchantUrl: `https://${merchant.toLowerCase().replace(/\s+/g, '')}.com/checkout`,
        merchantLogo,
        merchantColor,
        currentStepIndex: 0,
        steps,
        status: 'idle',
        currentUrl: `https://${merchant.toLowerCase().replace(/\s+/g, '')}.com`,
        cartCount: items.reduce((acc, i) => acc + i.quantity, 0),
        cartTotal: subtotal
      });

      tabCount++;
    });

    return tabs;
  }
}
