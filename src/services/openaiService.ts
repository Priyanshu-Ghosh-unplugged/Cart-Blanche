import { BomItem, PresetScenario, MerchantName } from '../types';
import { PRESET_SCENARIOS } from '../data/presetScenarios';

export class OpenAiService {
  /**
   * Analyzes an unstructured link or text prompt using OpenAI Vision / LLM logic
   * to extract the Bill of Materials (BOM) and list of required merchants.
   */
  public static async analyzeGoal(input: string): Promise<{
    scenarioTitle: string;
    description: string;
    bomItems: BomItem[];
    totalAmount: number;
    suggestedLimit: number;
    merchantCount: number;
    hitlMessage?: string;
  }> {
    // Artificial delay to simulate real-time AI parsing & web scraping engine
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const lowerInput = input.toLowerCase();

    // Match against preset scenarios if keywords exist
    if (lowerInput.includes('mirror') || lowerInput.includes('smart') || lowerInput.includes('diy') || lowerInput.includes('youtube')) {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === 'smart-mirror')!;
      return this.formatScenarioResult(scenario);
    } else if (lowerInput.includes('washer') || lowerInput.includes('lg') || lowerInput.includes('error') || lowerInput.includes('repair')) {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === 'lg-washer-fix')!;
      return this.formatScenarioResult(scenario);
    } else if (lowerInput.includes('pc') || lowerInput.includes('rig') || lowerInput.includes('gaming') || lowerInput.includes('reddit')) {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === 'gaming-pc-rig')!;
      return this.formatScenarioResult(scenario);
    } else if (lowerInput.includes('bakery') || lowerInput.includes('flour') || lowerInput.includes('sourdough') || lowerInput.includes('b2b')) {
      const scenario = PRESET_SCENARIOS.find((s) => s.id === 'bakery-restock')!;
      return this.formatScenarioResult(scenario);
    }

    // Dynamic extraction fallback for custom input
    const generatedBom: BomItem[] = [
      {
        id: 'cust-1',
        title: `Custom Requirement: ${input.slice(0, 32)}... Part A`,
        category: 'Hardware Component',
        merchant: 'Amazon',
        merchantLogo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=80',
        merchantColor: '#FF9900',
        url: 'https://amazon.com/dp/B08CUSTOM1',
        price: 49.99,
        quantity: 1,
        stockStatus: 'in_stock',
        sku: 'AMZ-CUST-01',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
        spec: 'Primary dynamic specification item'
      },
      {
        id: 'cust-2',
        title: `Specialty Module: ${input.slice(0, 24)} Adapter`,
        category: 'Electronics',
        merchant: 'Adafruit',
        merchantLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80',
        merchantColor: '#0080FF',
        url: 'https://adafruit.com/product/custom2',
        price: 34.50,
        quantity: 1,
        stockStatus: 'in_stock',
        sku: 'ADA-CUST-02',
        image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&auto=format&fit=crop&q=80',
        spec: 'Ultra-low noise interface module'
      },
      {
        id: 'cust-3',
        title: 'Heavy Duty Installation Bracket & Hardware Fasteners',
        category: 'Hardware & Trim',
        merchant: 'Home Depot',
        merchantLogo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&auto=format&fit=crop&q=80',
        merchantColor: '#FA6400',
        url: 'https://homedepot.com/p/custom-bracket-set',
        price: 18.00,
        quantity: 1,
        stockStatus: 'in_stock',
        sku: 'HD-CUST-03',
        image: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=400&auto=format&fit=crop&q=80',
        spec: 'Galvanized steel mounting hardware'
      }
    ];

    const total = 102.49;

    return {
      scenarioTitle: `Extracted BOM: ${input.slice(0, 35)}`,
      description: `OpenAI parsed unstructured prompt into 3 items across Amazon, Adafruit, and Home Depot.`,
      bomItems: generatedBom,
      totalAmount: total,
      suggestedLimit: 115.00,
      merchantCount: 3,
      hitlMessage: 'Adafruit checkout requires confirming your shipping ZIP code (90210). Confirm to authorize agent autofill?'
    };
  }

  private static formatScenarioResult(scenario: PresetScenario) {
    return {
      scenarioTitle: scenario.title,
      description: scenario.description,
      bomItems: scenario.bomItems,
      totalAmount: scenario.totalAmount,
      suggestedLimit: scenario.suggestedLimit,
      merchantCount: scenario.merchantCount,
      hitlMessage: scenario.hitlMessage
    };
  }
}
