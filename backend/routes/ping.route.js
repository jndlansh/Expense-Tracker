import { Router } from 'express';
import pingController from '../controllers/ping.controller.js';

const router = Router();

router.get('/', pingController.reply);      // GET /api/ping  → "pong"

export default router;
