// server/src/routes/auth.js
import express from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { hashPassword, comparePassword, signToken, verifyToken } from '../auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name: nameIn, phone } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await hashPassword(password);
    const name =
      nameIn && nameIn.trim()
        ? nameIn.trim()
        : (email.includes('@') ? email.split('@')[0] : email);

    // simple placeholders for required wallet fields
    const walletPrivateKey = '0x' + crypto.randomBytes(32).toString('hex');
    const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        phone: phone ?? null,
        walletAddress,
        walletPrivateKey,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        realBalance: user.realBalance,
        virtualBalance: user.virtualBalance,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        realBalance: user.realBalance,
        virtualBalance: user.virtualBalance,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        realBalance: user.realBalance,
        virtualBalance: user.virtualBalance,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
