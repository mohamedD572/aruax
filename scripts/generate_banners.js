import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const outDir = './public/banners';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function drawGrid(ctx, w, h, size = 60, color = 'rgba(212, 175, 55, 0.07)') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawGlowCircle(ctx, x, y, r, innerColor, outerColor) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(1, outerColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoldBadge(ctx, x, y, text) {
  ctx.save();
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;
  const bgGrad = ctx.createLinearGradient(x - 200, y - 25, x + 200, y + 25);
  bgGrad.addColorStop(0, '#B8860B');
  bgGrad.addColorStop(0.5, '#FFD700');
  bgGrad.addColorStop(1, '#B8860B');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(x - 220, y - 28, 440, 56, 28);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0A0D14';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawMainAurexText(ctx, x, y, subtitle, tagText) {
  ctx.save();

  // Glow behind text
  ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
  ctx.shadowBlur = 40;

  // Main AUREX text with metallic gold gradient
  const goldGrad = ctx.createLinearGradient(x - 300, y - 80, x + 300, y + 20);
  goldGrad.addColorStop(0, '#FFE87C');
  goldGrad.addColorStop(0.3, '#FFD700');
  goldGrad.addColorStop(0.6, '#DAA520');
  goldGrad.addColorStop(0.8, '#FFF8DC');
  goldGrad.addColorStop(1, '#B8860B');

  ctx.fillStyle = goldGrad;
  ctx.font = '900 130px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A U R E X', x, y);

  // Outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeText('A U R E X', x, y);

  // Subtitle
  if (subtitle) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFD700';
    ctx.fillStyle = '#E6C687';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(subtitle, x, y + 100);
  }

  // Tag
  if (tagText) {
    drawGoldBadge(ctx, x, y + 190, tagText);
  }

  ctx.restore();
}

// Banner 1: Quantum Network
function createBanner1() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(960, 540, 100, 960, 540, 1200);
  grad.addColorStop(0, '#1E1B0E');
  grad.addColorStop(0.6, '#0B0D13');
  grad.addColorStop(1, '#050608');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 50, 'rgba(255, 215, 0, 0.08)');
  drawGlowCircle(ctx, 960, 480, 450, 'rgba(255, 215, 0, 0.25)', 'rgba(0,0,0,0)');
  drawGlowCircle(ctx, 400, 200, 300, 'rgba(218, 165, 32, 0.15)', 'rgba(0,0,0,0)');
  drawGlowCircle(ctx, 1500, 800, 350, 'rgba(255, 215, 0, 0.15)', 'rgba(0,0,0,0)');

  // Nodes & Connecting lines
  const points = [
    {x: 300, y: 300}, {x: 500, y: 200}, {x: 700, y: 350}, {x: 1200, y: 300},
    {x: 1450, y: 220}, {x: 1650, y: 400}, {x: 350, y: 750}, {x: 600, y: 850},
    {x: 1300, y: 800}, {x: 1600, y: 700}
  ];
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) < 400) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
  points.forEach(p => {
    drawGlowCircle(ctx, p.x, p.y, 12, '#FFD700', 'rgba(255, 215, 0, 0)');
  });

  drawMainAurexText(ctx, 960, 480, 'QUANTUM DEFI & HIGH-YIELD PLATFORM', '⚡ 25-DAY AUTOMATED PROFIT ENGINE');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 2: Golden Bull & Elevation
function createBanner2() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
  grad.addColorStop(0, '#090B10');
  grad.addColorStop(0.5, '#19150B');
  grad.addColorStop(1, '#07080C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 80, 'rgba(255, 215, 0, 0.05)');

  // Candlesticks
  const candleX = [150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1650, 1800];
  const candleH = [120, 180, 240, 210, 320, 450, 380, 520, 640, 590, 750, 880];
  for (let i = 0; i < candleX.length; i++) {
    const x = candleX[i];
    const h = candleH[i];
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 1000 - h - 50);
    ctx.lineTo(x, 1000 + 30);
    ctx.stroke();

    const cGrad = ctx.createLinearGradient(0, 1000 - h, 0, 1000);
    cGrad.addColorStop(0, '#FFD700');
    cGrad.addColorStop(1, 'rgba(184, 134, 11, 0.2)');
    ctx.fillStyle = cGrad;
    ctx.fillRect(x - 18, 1000 - h, 36, h);
  }

  drawGlowCircle(ctx, 960, 450, 500, 'rgba(255, 215, 0, 0.3)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 480, 'BULLISH WEALTH MULTIPLIER', '🚀 UP TO 4.4% DAILY AUTOMATED YIELD');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 3: Hexagonal Core
function createBanner3() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#06070A';
  ctx.fillRect(0, 0, 1920, 1080);

  drawGlowCircle(ctx, 960, 540, 600, 'rgba(218, 165, 32, 0.2)', 'rgba(0,0,0,0)');

  // Hexagons
  function drawHex(x, y, r, strokeCol) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const hx = x + r * Math.cos(a);
      const hy = y + r * Math.sin(a);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (let r = 100; r <= 700; r += 120) {
    drawHex(960, 540, r, `rgba(255, 215, 0, ${1 - r / 800})`);
  }

  // Floating small hexes
  const hexes = [
    {x: 200, y: 200, r: 40}, {x: 1700, y: 250, r: 50}, {x: 300, y: 850, r: 60},
    {x: 1650, y: 800, r: 45}, {x: 1000, y: 150, r: 35}
  ];
  hexes.forEach(h => {
    drawHex(h.x, h.y, h.r, '#FFD700');
    drawGlowCircle(ctx, h.x, h.y, h.r, 'rgba(255, 215, 0, 0.4)', 'rgba(0,0,0,0)');
  });

  drawMainAurexText(ctx, 960, 480, 'HOLOGRAPHIC SMART CONTRACT MINING', '💎 INSTANT WITHDRAWALS & VIP PLANS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 4: Bank Vault Door
function createBanner4() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(960, 540, 50, 960, 540, 1000);
  grad.addColorStop(0, '#1A160A');
  grad.addColorStop(0.7, '#0A0A0E');
  grad.addColorStop(1, '#030406');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Concentric vault rings
  const center = {x: 960, y: 540};
  [500, 420, 340, 260].forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx % 2 === 0 ? '#FFD700' : '#B8860B';
    ctx.lineWidth = 8 - idx * 1.5;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.stroke();
  });

  // Vault spokes
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(center.x + 260 * Math.cos(a), center.y + 260 * Math.sin(a));
    ctx.lineTo(center.x + 500 * Math.cos(a), center.y + 500 * Math.sin(a));
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  drawMainAurexText(ctx, 960, 480, 'FORTRESS-GRADE ASSET SECURITY', '🔒 100% CAPITAL RETURN AT MATURITY');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 5: Constellation Space
function createBanner5() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, 1920, 1080);

  // Starfield
  for (let i = 0; i < 250; i++) {
    const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * 1920;
    const sy = (Math.cos(i * 678.9) * 0.5 + 0.5) * 1080;
    const size = (i % 3) + 1;
    ctx.fillStyle = i % 5 === 0 ? '#FFD700' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGlowCircle(ctx, 960, 500, 550, 'rgba(255, 215, 0, 0.25)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 480, 'FINANCIAL FREEDOM RECONFIGURED', '✨ JOIN THOUSANDS OF ACTIVE INVESTORS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 6: Gold Bullion Stack
function createBanner6() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080);
  bgGrad.addColorStop(0, '#0D0E12');
  bgGrad.addColorStop(0.5, '#201A09');
  bgGrad.addColorStop(1, '#07080B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 100, 'rgba(255, 215, 0, 0.05)');

  // Draw 3D Gold Bars at bottom
  function drawBar(x, y, w, h) {
    ctx.save();
    const bGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    bGrad.addColorStop(0, '#FFE57F');
    bGrad.addColorStop(0.5, '#FFD700');
    bGrad.addColorStop(1, '#996515');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#4A3500';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINE GOLD 999.9', x + w / 2, y + h / 2 + 6);
    ctx.restore();
  }

  drawBar(600, 850, 320, 80);
  drawBar(1000, 850, 320, 80);
  drawBar(800, 750, 320, 80);

  drawGlowCircle(ctx, 960, 450, 450, 'rgba(255, 215, 0, 0.3)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 450, 'PREMIUM DIGITAL ASSET MANAGEMENT', '👑 EXCLUSIVE VIP INVESTMENT TIERS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 7: Liquid Wave
function createBanner7() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#08090D';
  ctx.fillRect(0, 0, 1920, 1080);

  // Waves
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 300 + i * 120);
    for (let x = 0; x <= 1920; x += 50) {
      const y = 300 + i * 120 + Math.sin((x + i * 300) * 0.003) * 150;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1920, 1080);
    ctx.lineTo(0, 1080);
    ctx.closePath();

    const wGrad = ctx.createLinearGradient(0, 200, 1920, 1080);
    wGrad.addColorStop(0, `rgba(255, 215, 0, ${0.15 - i * 0.02})`);
    wGrad.addColorStop(1, 'rgba(10, 10, 15, 0.8)');
    ctx.fillStyle = wGrad;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 - i * 0.1})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawMainAurexText(ctx, 960, 480, 'NEXT-GEN DEFI YIELD ENGINE', '🌊 LIQUIDITY-BACKED GUARANTEED PROFIT');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 8: Matrix Cyber Grid
function createBanner8() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#040507';
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 40, 'rgba(255, 215, 0, 0.1)');

  // Rain characters simulation
  ctx.fillStyle = '#FFD700';
  ctx.font = '16px monospace';
  for (let x = 20; x < 1920; x += 60) {
    for (let y = 40; y < 1080; y += 40) {
      if (Math.sin(x * y) > 0.3) {
        ctx.fillStyle = Math.sin(x + y) > 0.8 ? '#FFFFFF' : 'rgba(255, 215, 0, 0.4)';
        ctx.fillText(Math.floor(Math.sin(x * y * 10) * 99).toString(), x, y);
      }
    }
  }

  drawGlowCircle(ctx, 960, 480, 500, 'rgba(255, 215, 0, 0.3)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 480, 'AI CLOUD MINING ALGORITHM', '💻 HIGH-THROUGHPUT HASHRATE POOL');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 9: Royal Crown Empire
function createBanner9() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const bgGrad = ctx.createRadialGradient(960, 540, 100, 960, 540, 1100);
  gradAdd(bgGrad, ['#211506', '#0E0903', '#050302']);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Crown shape
  ctx.save();
  ctx.translate(960, 220);
  ctx.beginPath();
  ctx.moveTo(-150, 80);
  ctx.lineTo(-200, -80);
  ctx.lineTo(-100, -20);
  ctx.lineTo(0, -120);
  ctx.lineTo(100, -20);
  ctx.lineTo(200, -80);
  ctx.lineTo(150, 80);
  ctx.closePath();
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 35;
  ctx.fill();
  ctx.restore();

  drawMainAurexText(ctx, 960, 520, 'WHERE WEALTH MULTIPLIES DAILY', '👑 THE KING OF TELEGRAM INVESTMENT APPS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 10: Worldwide Globe
function createBanner10() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#06070B';
  ctx.fillRect(0, 0, 1920, 1080);

  // Globe wireframe
  const gCenter = {x: 960, y: 500};
  const gRadius = 400;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(gCenter.x, gCenter.y, gRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Latitude / Longitude lines
  for (let r = 80; r < gRadius; r += 80) {
    ctx.beginPath();
    ctx.ellipse(gCenter.x, gCenter.y, gRadius, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gCenter.x, gCenter.y, r, gRadius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  drawGlowCircle(ctx, 960, 500, 480, 'rgba(255, 215, 0, 0.25)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 480, 'GLOBAL 25-DAY INVESTMENT PROTOCOL', '🌐 SERVING INVESTORS WORLDWIDE');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 11: Candlestick Breakout
function createBanner11() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080A0E';
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 60, 'rgba(255, 215, 0, 0.08)');

  // Explosive Line Chart
  ctx.beginPath();
  ctx.moveTo(100, 900);
  ctx.bezierCurveTo(400, 850, 700, 700, 1000, 400);
  ctx.bezierCurveTo(1200, 200, 1500, 300, 1820, 100);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 30;
  ctx.stroke();

  drawMainAurexText(ctx, 960, 500, '24-HOUR AUTOMATED PROFIT DISTRIBUTION', '📈 CONSTANT ACCELERATED GROWTH');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 12: Molten Gold Ring
function createBanner12() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#030305';
  ctx.fillRect(0, 0, 1920, 1080);

  // Molten Ring
  drawGlowCircle(ctx, 960, 500, 420, 'rgba(255, 215, 0, 0.4)', 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(960, 500, 350, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFE57F';
  ctx.lineWidth = 20;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 50;
  ctx.stroke();

  drawMainAurexText(ctx, 960, 500, 'INTELLIGENT WEALTH GENERATION', '⚡ ZERO EFFORT DAILY EARNINGS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 13: Shield Security
function createBanner13() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#07080C';
  ctx.fillRect(0, 0, 1920, 1080);

  // Shield outline
  ctx.save();
  ctx.translate(960, 460);
  ctx.beginPath();
  ctx.moveTo(0, -320);
  ctx.lineTo(250, -220);
  ctx.lineTo(250, 100);
  ctx.bezierCurveTo(250, 280, 120, 360, 0, 400);
  ctx.bezierCurveTo(-120, 360, -250, 280, -250, 100);
  ctx.lineTo(-250, -220);
  ctx.closePath();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 8;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 40;
  ctx.stroke();
  ctx.restore();

  drawMainAurexText(ctx, 960, 480, 'BANK-GRADE SECURITY & VERIFIED PAYOUTS', '🛡️ MULTI-SIG COLD STORAGE PROTECTED');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 14: Pyramid Escalator
function createBanner14() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, 1920, 1080);

  // Pyramid tiers
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const y = 900 - i * 110;
    const w = 1200 - i * 180;
    const x = 960 - w / 2;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + i * 0.15})`;
    ctx.fillRect(x, y, w, 80);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, 80);
  }

  drawGlowCircle(ctx, 960, 300, 300, 'rgba(255, 215, 0, 0.4)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 450, 'ELEVATE YOUR CRYPTO PORTFOLIO', '🏆 EARN CONSISTENT DAILY RETURNS');
  return canvas.toBuffer('image/jpeg', 95);
}

// Banner 15: Smart Ecosystem
function createBanner15() {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#07090E';
  ctx.fillRect(0, 0, 1920, 1080);

  drawGrid(ctx, 1920, 1080, 50, 'rgba(255, 215, 0, 0.08)');

  // Circuit traces
  const traces = [
    [{x: 100, y: 100}, {x: 500, y: 100}, {x: 700, y: 300}],
    [{x: 1800, y: 100}, {x: 1400, y: 100}, {x: 1200, y: 300}],
    [{x: 100, y: 980}, {x: 500, y: 980}, {x: 700, y: 780}],
    [{x: 1800, y: 980}, {x: 1400, y: 980}, {x: 1200, y: 780}],
  ];
  traces.forEach(t => {
    ctx.beginPath();
    ctx.moveTo(t[0].x, t[0].y);
    t.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.stroke();
  });

  drawGlowCircle(ctx, 960, 480, 500, 'rgba(255, 215, 0, 0.3)', 'rgba(0,0,0,0)');
  drawMainAurexText(ctx, 960, 480, 'TELEGRAM MINI APP WEALTH HUB', '⚡ START INVESTING IN LESS THAN 1 MINUTE');
  return canvas.toBuffer('image/jpeg', 95);
}

function gradAdd(grad, colors) {
  colors.forEach((c, idx) => grad.addColorStop(idx / (colors.length - 1), c));
}

const generators = [
  createBanner1, createBanner2, createBanner3, createBanner4, createBanner5,
  createBanner6, createBanner7, createBanner8, createBanner9, createBanner10,
  createBanner11, createBanner12, createBanner13, createBanner14, createBanner15
];

console.log('Generating 15 Ultra HD 1920x1080 Banners...');
generators.forEach((gen, idx) => {
  const num = idx + 1;
  const buf = gen();
  const filePath = path.join(outDir, `banner${num}.jpg`);
  fs.writeFileSync(filePath, buf);
  console.log(`Saved banner${num}.jpg (${buf.length} bytes, 1920x1080)`);
});
console.log('All 15 banners generated successfully!');
