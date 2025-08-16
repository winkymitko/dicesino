// shared/game.js
export const STAKES = [5, 10, 20, 50];
// roll three dice
export const rollDice = () => {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  return [randInt(1, 6), randInt(1, 6), randInt(1, 6)];
};

// multiplier ranges
const MULTIPLIER_RANGES = [
  { min: 50, max: 99, m: 1.10 },
  { min: 100, max: 149, m: 1.20 },
  { min: 150, max: 199, m: 1.30 },
  { min: 200, max: 249, m: 1.40 },
  { min: 250, max: 299, m: 1.60 },
  { min: 300, max: 399, m: 1.80 },
  { min: 400, max: 499, m: 2.00 },
  { min: 500, max: 599, m: 2.10 },
  { min: 600, max: Infinity, m: 2.20 },
];

export const getMultiplierForPoints = (pts) => {
  if (!(pts > 0)) return 0;
  const tier = MULTIPLIER_RANGES.find(r => pts >= r.min && pts <= r.max);
  return tier ? tier.m : 0;
};

const bustReason = (dice, cnt) => {
  const [a, b, c] = dice;
  const is135 = cnt[1] === 1 && cnt[3] === 1 && cnt[5] === 1;
  const is246 = cnt[2] === 1 && cnt[4] === 1 && cnt[6] === 1;
  const has1or5 = cnt[1] > 0 || cnt[5] > 0;
  if (!is135 && !is246 && !has1or5) return `no 1/5 and not 135 or 246 (${a}-${b}-${c})`;
  return `not scoring (${a}-${b}-${c})`;
};

export const calculateScore = (dice) => {
  const cnt = [0, 0, 0, 0, 0, 0, 0];
  for (const v of dice) {
    if (!Number.isInteger(v) || v < 1 || v > 6) {
      return { score: 0, multiplier: 0, combination: 'bust: invalid dice' };
    }
    cnt[v]++;
  }

  // triples
  for (let pip = 1; pip <= 6; pip++) {
    if (cnt[pip] === 3) {
      const pts = 100 * pip;
      return { score: pts, multiplier: getMultiplierForPoints(pts), combination: `triple-${pip}` };
    }
  }

  // straights
  const is135 = cnt[1] === 1 && cnt[3] === 1 && cnt[5] === 1;
  const is246 = cnt[2] === 1 && cnt[4] === 1 && cnt[6] === 1;
  if (is135 || is246) {
    const pts = 100;
    return { score: pts, multiplier: getMultiplierForPoints(pts), combination: `straight-${is135 ? 135 : 246}` };
  }

  // singles
  const singles = cnt[1] * 100 + cnt[5] * 50;
  if (singles > 0) {
    return { score: singles, multiplier: getMultiplierForPoints(singles), combination: 'singles' };
  }

  // bust
  return { score: 0, multiplier: 0, combination: `bust: ${bustReason(dice, cnt)}` };
};

export const evalRoll = (currentPot) => {
  const dice = rollDice();
  const { score, multiplier, combination } = calculateScore(dice);

  if (score <= 0 || multiplier <= 0) {
    return { bust: true, dice, points: 0, multiplier: 0, combination, pot: 0 };
  }
  const pot = Math.round(currentPot * multiplier * 100) / 100;
  return { bust: false, dice, points: score, multiplier, combination, pot };
};
