import { Router } from 'express';
import { PravaService } from '../services/pravaService';

const router = Router();

// GET /api/prava/config - Retrieve active Prava configuration metadata
router.get('/config', (req, res) => {
  try {
    const config = PravaService.getConfig();
    return res.json({ success: true, config });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/prava/transactions - Retrieve live Prava transaction audit logs from SQLite DB
router.get('/transactions', (req, res) => {
  try {
    const transactions = PravaService.listTransactions();
    return res.json({ success: true, transactions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

import { createPravaSession, pollPaymentResult } from '../../src/actions';

// POST /api/prava/sessions/create - Create official Prava session (POST /v1/sessions)
router.post('/sessions/create', async (req, res) => {
  try {
    const merchants = req.body.merchants || [];
    let amount = Number(req.body.amount || req.body.limitAmount || req.body.spending_limit || 150);
    if (!amount || amount <= 0) amount = 150;

    const merchantName = req.body.merchantName || req.body.merchant_name || req.body.merchant || 'Universal Merchant';
    const userId = req.body.userId || req.body.user_id;
    const userEmail = req.body.userEmail || req.body.user_email;

    const session = await createPravaSession({
      userId,
      userEmail,
      totalAmount: amount.toFixed(2),
      merchantName,
      merchants
    });
    return res.status(201).json({ success: true, session });
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create Prava session';
    console.error("[Prava API Error]", errorMessage);
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('not configured')) {
      return res.status(401).json({ error: 'Authentication failed. Please provide your Live Prava API Keys.' });
    }
    return res.status(500).json({ error: errorMessage });
  }
});

// GET /api/prava/sessions/:id/result - Poll official Prava payment result (GET /v1/sessions/{id}/payment-result)
router.get('/sessions/:id/result', async (req, res) => {
  try {
    const result = await pollPaymentResult(req.params.id);
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/prava/cards/issue - Issue cards after session is completed
router.post('/cards/issue', async (req, res) => {
  try {
    const sessionId = req.body.sessionId;
    const merchants = req.body.merchants || [];
    
    if (!sessionId || merchants.length === 0) {
      return res.status(400).json({ error: 'sessionId and merchants array are required' });
    }

    const cards = await PravaService.issueCardsFromSession(sessionId, merchants);
    return res.status(201).json({ success: true, cards });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to issue Prava virtual cards' });
  }
});

// GET /api/prava/cards - List all Prava cards from SQLite
router.get('/cards', (req, res) => {
  try {
    const cards = PravaService.listCards();
    return res.json({ success: true, cards });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to list Prava cards' });
  }
});

// GET /api/prava/cards/:id - Get single Prava card by ID
router.get('/cards/:id', (req, res) => {
  try {
    const card = PravaService.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Prava Virtual Card not found' });
    }
    return res.json({ success: true, card });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/prava/authorize - Authorize a charge against a Prava card
router.post('/authorize', async (req, res) => {
  try {
    const cardId = req.body.cardId || req.body.card_id;
    const chargeAmount = req.body.chargeAmount ?? req.body.charge_amount ?? req.body.amount ?? 0;
    
    if (!cardId) {
      return res.status(400).json({ error: 'cardId is required' });
    }

    const result = await PravaService.authorizeTransaction(cardId, Number(chargeAmount));
    if (!result.success) {
      return res.status(400).json({ success: false, reason: result.reason });
    }

    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/prava/cards/:id/freeze - Freeze a Prava Virtual Card
router.post('/cards/:id/freeze', async (req, res) => {
  try {
    const success = await PravaService.freezeCard(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Prava Card not found or already frozen' });
    }
    return res.json({ success: true, message: 'Prava Card successfully frozen' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
