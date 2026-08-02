import { Router } from 'express';
import { OpenAiBackendService } from '../services/openaiService';

const router = Router();

// POST /api/goals/extract - Extract BOM using OpenAI and save to SQLite
router.post('/extract', async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input URL or prompt text is required' });
    }

    const result = await OpenAiBackendService.analyzeAndSaveGoal(input);
    return res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to extract BOM' });
  }
});

// GET /api/goals/:id - Retrieve goal and BOM items from SQLite
router.get('/:id', (req, res) => {
  try {
    const goal = OpenAiBackendService.getGoalById(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    return res.json({ success: true, goal });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
