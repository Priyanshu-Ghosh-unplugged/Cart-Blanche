/**
 * Prava Payments SDK Server Actions
 * Built strictly according to SKILL.md specification
 */

export interface CreatePravaSessionParams {
  userId?: string;
  userEmail?: string;
  totalAmount?: string;
  currency?: string;
  merchantName?: string;
  merchantUrl?: string;
  description?: string;
  merchants?: { name: string, limit: number }[];
}

export interface SessionResponse {
  session_id: string;
  session_token: string;
  expires_at?: string;
  iframe_url: string;
  order_id?: string;
}

export interface PaymentLineItem {
  txn_ref_id: string;
  merchant_name: string;
  merchant_url: string;
  total_amount: string;
  status: string;
  token: string | null;
  dynamic_cvv: string | null;
  expiry_month: string | null;
  expiry_year: string | null;
}

export interface PaymentTransaction {
  txn_id: string;
  status: string;
  line_items: PaymentLineItem[];
}

export interface PaymentResultResponse {
  session_id: string;
  status: string;
  transactions: PaymentTransaction[];
}

/**
 * Server Action: Creates a Prava session via POST /v1/sessions using secret key
 */
export async function createPravaSession(params: CreatePravaSessionParams): Promise<SessionResponse> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.PRAVA_BACKEND_URL || 'https://sandbox.api.prava.space';
  const MERCHANT_SECRET_KEY = process.env.MERCHANT_SECRET_KEY;
  if (!MERCHANT_SECRET_KEY) {
    throw new Error('MERCHANT_SECRET_KEY not configured.');
  }

  let calculatedTotal = 0;
  
  const product_details = params.merchants && params.merchants.length > 0 
    ? params.merchants.map(m => {
        calculatedTotal += m.limit;
        return {
          description: `${m.name} Order Authorization`,
          unit_price: m.limit.toFixed(2),
          quantity: 1,
        };
      })
    : [{
        description: `${params.merchantName || 'Universal Merchant'} Order Authorization`,
        unit_price: (Number(params.totalAmount) || 150.00).toFixed(2),
        quantity: 1,
      }];

  const amountStr = calculatedTotal > 0 
    ? calculatedTotal.toFixed(2) 
    : (Number(params.totalAmount) || 150.00).toFixed(2);

  const purchase_context = [{
    merchant_details: {
      name: params.merchantName || 'Universal Merchant',
      url: params.merchantUrl || `https://www.${(params.merchantName || 'Universal Merchant').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      country_code_iso2: 'US',
      category: 'Procurement'
    },
    product_details,
    effective_until_minutes: 15,
  }];

  const merchant = params.merchantName || 'Zara';
  console.log(`[Prava SKILL.md] Creating session via POST ${BACKEND_URL}/v1/sessions for ${merchant} ($${amountStr})`);

  const res = await fetch(`${BACKEND_URL}/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MERCHANT_SECRET_KEY}`,
    },
    body: JSON.stringify({
      user_id: params.userId || 'usr_cartblanche_procurement',
      user_email: params.userEmail || 'procurement@cartblanche.ai',
      total_amount: amountStr,
      currency: params.currency || 'USD',
      description: params.description || `CartBlanche ${merchant} Procurement`,
      purchase_context,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error('[Prava SKILL.md] Session endpoint error:', JSON.stringify(errorData, null, 2));
    
    if (errorData.error?.details?.fieldErrors) {
      throw new Error(`${errorData.error.message}: ${JSON.stringify(errorData.error.details.fieldErrors)}`);
    }
    throw new Error(errorData.error?.message || `Failed to create session (HTTP ${res.status})`);
  }

  const data = await res.json();
  return {
    session_id: data.session_id,
    session_token: data.session_token,
    iframe_url: data.iframe_url || `${BACKEND_URL}/checkout/${data.session_id}`,
    expires_at: data.expires_at,
    order_id: data.order_id
  };
}

/**
 * Server Action: Polls GET /v1/sessions/{id}/payment-result for tokenized credentials
 */
export async function pollPaymentResult(sessionId: string): Promise<PaymentResultResponse> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.PRAVA_BACKEND_URL || 'https://sandbox.api.prava.space';
  const MERCHANT_SECRET_KEY = process.env.MERCHANT_SECRET_KEY;
  if (!MERCHANT_SECRET_KEY) {
    throw new Error('MERCHANT_SECRET_KEY not configured.');
  }

  const url = `${BACKEND_URL}/v1/sessions/${sessionId}/payment-result?_t=${Date.now()}`;
  console.log(`[Prava SKILL.md] Polling payment result via GET ${url}`);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MERCHANT_SECRET_KEY}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Session not found');
    const errorData = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error('[Prava SKILL.md] pollPaymentResult endpoint error:', errorData);
    throw new Error(errorData.error?.message || `Failed to poll result (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data;
}

/**
 * Server Action: Reports outcome to Prava API POST /v1/sessions/{id}/report-status
 */
export async function reportPravaStatus(sessionId: string, txnRefId: string, status: 'APPROVED' | 'DECLINED' = 'APPROVED') {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.PRAVA_BACKEND_URL || 'https://sandbox.api.prava.space';
  const MERCHANT_SECRET_KEY = process.env.MERCHANT_SECRET_KEY;
  if (!MERCHANT_SECRET_KEY) {
    throw new Error('MERCHANT_SECRET_KEY not configured.');
  }

  try {
    await fetch(`${BACKEND_URL}/v1/sessions/${sessionId}/report-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCHANT_SECRET_KEY}`,
      },
      body: JSON.stringify({
        txn_ref_id: txnRefId,
        txn_status: status,
      }),
    });
    console.log(`[Prava SKILL.md] Reported status ${status} for ref ${txnRefId}`);
  } catch (err) {
    console.warn('[Prava SKILL.md] Status report error:', err);
  }
}
