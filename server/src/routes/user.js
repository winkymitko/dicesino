// server/src/routes/user.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/profile
router.get('/profile', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      walletAddress: user.walletAddress,
      realBalance: user.realBalance,
      virtualBalance: user.virtualBalance,
    },
  });
});

// PUT /api/profile
router.put('/profile', auth, async (req, res) => {
  const { name, phone } = req.body || {};
  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
    },
  });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      walletAddress: user.walletAddress,
      realBalance: user.realBalance,
      virtualBalance: user.virtualBalance,
    },
  });
});

// POST /api/wallet/deposit  (simulate USDT top-up)
router.post('/wallet/deposit', auth, async (req, res) => {
  const { amount } = req.body || {};
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { virtualBalance: { increment: num } },
  });

  // best-effort transaction record
  try {
    await prisma.transaction.create({
      data: {
        userId: req.user.userId,
        amount: num,
        type: 'BONUS_ADDED',  // using an existing enum type as fallback
        status: 'COMPLETED',
        balanceType: 'VIRTUAL',
        metadata: { note: 'Simulated USDT top-up' },
      },
    });
  } catch {}

  res.json({
    balance: {
      realBalance: user.realBalance,
      virtualBalance: user.virtualBalance,
    },
  });
});

// POST /api/wallet/withdraw  (simulate withdrawal request)
router.post('/wallet/withdraw', auth, async (req, res) => {
  const { amount, address } = req.body || {};
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // very light address validation for ERC20-style
  if (typeof address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if ((user.virtualBalance ?? 0) < num) return res.status(400).json({ error: 'Insufficient balance' });

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: { virtualBalance: { decrement: num } },
  });

  // best-effort transaction record
  try {
    await prisma.transaction.create({
      data: {
        userId: req.user.userId,
        amount: num,
        type: 'CASH_OUT', // fallback type
        status: 'PENDING',
        balanceType: 'VIRTUAL',
        metadata: { address, note: 'Simulated withdrawal request' },
      },
    });
  } catch {}

  res.json({
    balance: {
      realBalance: updated.realBalance,
      virtualBalance: updated.virtualBalance,
    },
    message: 'Withdrawal requested (simulated).',
  });
});

export default router;
