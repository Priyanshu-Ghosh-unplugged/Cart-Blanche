import { Router } from 'express';
import { AutomationRunner } from '../services/automationRunner';

const router = Router();

// POST /api/orders/create - Save completed order receipt in SQLite DB
router.post('/create', (req, res) => {
  try {
    const { goalId, merchantName, subtotal, pravaCardId } = req.body;
    if (!goalId || !merchantName || !subtotal || !pravaCardId) {
      return res.status(400).json({ error: 'goalId, merchantName, subtotal, and pravaCardId are required' });
    }

    const order = AutomationRunner.createOrderReceipt(goalId, merchantName, Number(subtotal), pravaCardId);
    return res.status(201).json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/goal/:goalId - Retrieve orders for a goal from SQLite DB
router.get('/goal/:goalId', (req, res) => {
  try {
    const orders = AutomationRunner.getOrdersForGoal(req.params.goalId);
    return res.json({ success: true, orders });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/orders/log-step - Log execution step to SQLite
router.post('/log-step', (req, res) => {
  try {
    const { goalId, tabId, merchantName, stepTitle, status, logMessage, activeSelector } = req.body;
    AutomationRunner.logStep(goalId, tabId, merchantName, stepTitle, status, logMessage, activeSelector);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
