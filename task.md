# Task: CartBlanche - Exact Prava Payments SDK Template Integration (Prava-Payments/sdk-template)

## Prava SDK Template Repository Architecture (https://github.com/Prava-Payments/sdk-template)

### 1. Environment Keys (`.env` & `.env.local`)
```env
PORT=3002
MERCHANT_SECRET_KEY=sk_test_zxabNnRp9FZg0Ao33QJVOwWQy182hhG376iKaRe6qsg
NEXT_PUBLIC_PUBLISHABLE_KEY=pk_test_zxabNnRp9FZg0Ao33QJVOwWQy182hhG376iKaRe6qsg
NEXT_PUBLIC_BACKEND_URL=https://sandbox.api.prava.space
OPENAI_API_KEY=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
```

### 2. Server Actions Module (`src/actions.ts` & `server/services/pravaService.ts`)
- **`createPravaSession({ userId, userEmail, amount })`**:
  Executes `POST ${NEXT_PUBLIC_BACKEND_URL}/v1/sessions` with `x-api-key: MERCHANT_SECRET_KEY` returning `{ session_id, session_token, iframe_url }`.
- **`pollPaymentResult(sessionId)`**:
  Executes `GET ${NEXT_PUBLIC_BACKEND_URL}/v1/sessions/${sessionId}/payment-result` with `x-api-key: MERCHANT_SECRET_KEY` returning `{ status, transactions: [{ token, dynamic_cvv, exp_date }] }`.

### 3. Prava Card Collection Component (`src/components/PravaCardForm.tsx`)
- Thin SDK wrapper around `@prava-sdk/core`.
- Mounts PCI-compliant iframe via `sdk.collectPAN({ sessionToken, iframeUrl, container, onReady, onSuccess, onError })`.

### 4. Playwright Browser Worker Sync
- Consumes tokenized card details returned by Prava SDK sessions (`token`, `dynamic_cvv`, `exp_date`) in backend Playwright workers and records in SQLite `prava_cards` and `orders`.
