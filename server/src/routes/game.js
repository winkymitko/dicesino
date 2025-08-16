import { Router } from 'express';
import { evalRoll } from '../../../shared/game.js';
import { auth } from '../auth.js';
import { prisma } from '../prisma.js';

const router = Router();

router.post('/roll', auth, async (req, res) => {
  try {
    const { roundId } = req.body || {};
    if (!roundId) return res.status(400).json({ error: 'Missing roundId' });

    const round = await prisma.gameRound.findUnique({ where: { id: roundId } });
    if (!round) return res.status(404).json({ error: 'Round not found' });
    if (round.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
    if (round.status !== 'ACTIVE') return res.status(400).json({ error: 'Round not active' });

    const result = evalRoll(round.pot);

    if (result.bust) {
      const updated = await prisma.gameRound.update({
        where: { id: roundId },
        data: { status: 'LOST' },
      });
      return res.json({ round: updated, result: { bust: true, dice: result.dice, combination: result.combination } });
    }

    const newRoll = {
      dice: result.dice,
      score: result.points,
      multiplier: result.multiplier,
      combination: result.combination,
    };

    const updated = await prisma.gameRound.update({
      where: { id: roundId },
      data: {
        pot: result.pot,
        totalScore: (round.totalScore ?? 0) + result.points,
        rolls: [...(round.rolls ?? []), newRoll],
      },
    });

    res.json({ round: updated, result: { bust: false, ...result } });
  } catch (e) {
    console.error('roll error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
