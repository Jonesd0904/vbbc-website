const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Church colors
const NAVY = '#0f2540';
const NAVY_LIGHT = '#1a3a5c';
const GOLD = '#c9a227';
const CREAM = '#faf8f5';

// Series data with themes for visual design
const seriesData = [
  {
    name: 'Rock Solid',
    filename: 'rock-solid.jpg',
    scripture: 'Deuteronomy 32:31',
    theme: 'rock',
    tagline: 'For their rock is not as our Rock'
  },
  {
    name: 'Galatians',
    filename: 'galatians.jpg',
    scripture: 'Galatians',
    theme: 'freedom',
    tagline: 'Freedom in Christ'
  },
  {
    name: 'Ephesians',
    filename: 'ephesians.jpg',
    scripture: 'Ephesians',
    theme: 'grace',
    tagline: 'Riches of His Grace'
  },
  {
    name: 'Faith Building',
    filename: 'faith-building.jpg',
    scripture: '',
    theme: 'building',
    tagline: 'Growing Stronger in Faith'
  },
  {
    name: 'The Truth About Salvation',
    filename: 'salvation.jpg',
    scripture: '',
    theme: 'cross',
    tagline: 'The Gift of Eternal Life'
  },
  {
    name: 'First Peter',
    filename: 'first-peter.jpg',
    scripture: '1 Peter',
    theme: 'hope',
    tagline: 'Hope in the Midst of Trials'
  },
  {
    name: 'Second Peter',
    filename: 'second-peter.jpg',
    scripture: '2 Peter',
    theme: 'growth',
    tagline: 'Growing in Grace & Knowledge'
  },
  {
    name: 'Acts of the Apostles',
    filename: 'acts.jpg',
    scripture: 'Acts',
    theme: 'fire',
    tagline: 'The Early Church'
  },
  {
    name: 'The Gospel of John',
    filename: 'gospel-of-john.jpg',
    scripture: 'John',
    theme: 'light',
    tagline: 'That Ye Might Believe'
  },
  {
    name: 'End Times Prophecy',
    filename: 'end-times.jpg',
    scripture: '',
    theme: 'prophecy',
    tagline: 'Understanding Bible Prophecy'
  },
  {
    name: 'How to Share Christ',
    filename: 'share-christ.jpg',
    scripture: '',
    theme: 'witness',
    tagline: 'Sharing the Gospel'
  },
  {
    name: 'The Life of Elijah',
    filename: 'elijah.jpg',
    scripture: '1 Kings 17-19',
    theme: 'fire',
    tagline: 'Lessons from the Prophet'
  },
  {
    name: 'Colossians',
    filename: 'colossians.jpg',
    scripture: 'Colossians',
    theme: 'crown',
    tagline: 'Christ the Preeminent One'
  },
  {
    name: 'Philippians',
    filename: 'philippians.jpg',
    scripture: 'Philippians',
    theme: 'joy',
    tagline: 'Joy in the Lord'
  },
  {
    name: 'Stand-Alone Messages',
    filename: 'standalone.jpg',
    scripture: '',
    theme: 'bible',
    tagline: 'Individual Messages'
  }
];

// Create output directory
const outputDir = path.join(__dirname, 'public', 'images', 'series');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Draw themed background patterns
function drawThemePattern(ctx, theme, width, height) {
  // Base gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, NAVY);
  gradient.addColorStop(1, NAVY_LIGHT);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;

  switch (theme) {
    case 'rock':
      // Draw mountain/rock shapes
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const x = (width / 5) * i;
        const peakHeight = 100 + Math.random() * 150;
        ctx.moveTo(x, height);
        ctx.lineTo(x + 80, height - peakHeight);
        ctx.lineTo(x + 160, height);
        ctx.closePath();
        ctx.stroke();
      }
      break;

    case 'freedom':
      // Draw bird/wing shapes
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 30, y - 20, x - 50, y);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 30, y - 20, x + 50, y);
        ctx.stroke();
      }
      break;

    case 'grace':
      // Draw flowing lines
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const startY = (height / 6) * i;
        ctx.moveTo(0, startY);
        for (let x = 0; x < width; x += 50) {
          ctx.quadraticCurveTo(x + 25, startY + 30 * Math.sin(x / 50), x + 50, startY);
        }
        ctx.stroke();
      }
      break;

    case 'building':
      // Draw building blocks
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          const x = col * 100 + (row % 2) * 50;
          const y = height - (row * 50) - 50;
          ctx.strokeRect(x, y, 90, 40);
        }
      }
      break;

    case 'cross':
      // Draw cross
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.moveTo(width / 2, 50);
      ctx.lineTo(width / 2, height - 50);
      ctx.moveTo(width / 4, height / 3);
      ctx.lineTo(width * 3 / 4, height / 3);
      ctx.stroke();
      break;

    case 'hope':
      // Draw anchor shape
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(width / 2, height / 3, 40, Math.PI, 0);
      ctx.moveTo(width / 2, height / 3 - 40);
      ctx.lineTo(width / 2, height - 80);
      ctx.moveTo(width / 2 - 60, height - 80);
      ctx.quadraticCurveTo(width / 2, height - 40, width / 2 + 60, height - 80);
      ctx.stroke();
      break;

    case 'growth':
      // Draw upward arrows/plants
      for (let i = 0; i < 7; i++) {
        const x = 60 + i * 110;
        const h = 80 + Math.random() * 120;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, height - h);
        ctx.lineTo(x - 20, height - h + 30);
        ctx.moveTo(x, height - h);
        ctx.lineTo(x + 20, height - h + 30);
        ctx.stroke();
      }
      break;

    case 'fire':
      // Draw flame shapes
      for (let i = 0; i < 5; i++) {
        const x = 100 + i * 150;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.quadraticCurveTo(x - 40, height - 100, x, height - 180);
        ctx.quadraticCurveTo(x + 40, height - 100, x, height);
        ctx.stroke();
      }
      break;

    case 'light':
      // Draw radiating lines
      ctx.globalAlpha = 0.08;
      const centerX = width / 2;
      const centerY = height / 3;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 400, centerY + Math.sin(angle) * 400);
        ctx.stroke();
      }
      // Sun circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'prophecy':
      // Draw scroll/book shapes
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 3; i++) {
        const x = 150 + i * 200;
        const y = 100 + i * 80;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 120, y);
        ctx.quadraticCurveTo(x + 140, y + 100, x + 120, y + 200);
        ctx.lineTo(x, y + 200);
        ctx.quadraticCurveTo(x - 20, y + 100, x, y);
        ctx.stroke();
      }
      break;

    case 'witness':
      // Draw speech bubbles / reaching out
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 4; i++) {
        const x = 100 + i * 180;
        const y = 150 + (i % 2) * 100;
        ctx.beginPath();
        ctx.ellipse(x, y, 60, 40, 0, 0, Math.PI * 2);
        ctx.moveTo(x - 20, y + 35);
        ctx.lineTo(x - 40, y + 70);
        ctx.lineTo(x, y + 40);
        ctx.stroke();
      }
      break;

    case 'crown':
      // Draw crown shape
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(width / 4, height / 2 + 50);
      ctx.lineTo(width / 4, height / 2 - 20);
      ctx.lineTo(width / 3, height / 2 + 20);
      ctx.lineTo(width / 2 - 40, height / 2 - 40);
      ctx.lineTo(width / 2, height / 2 + 10);
      ctx.lineTo(width / 2 + 40, height / 2 - 40);
      ctx.lineTo(width * 2 / 3, height / 2 + 20);
      ctx.lineTo(width * 3 / 4, height / 2 - 20);
      ctx.lineTo(width * 3 / 4, height / 2 + 50);
      ctx.closePath();
      ctx.stroke();
      break;

    case 'joy':
      // Draw celebration / starburst
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = width / 2 + Math.cos(angle) * 200;
        const y = height / 2 + Math.sin(angle) * 150;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Small stars
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;

    case 'bible':
    default:
      // Draw open book
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Left page
      ctx.moveTo(width / 2, height / 3);
      ctx.quadraticCurveTo(width / 4, height / 3 - 20, width / 6, height / 3);
      ctx.lineTo(width / 6, height * 2 / 3);
      ctx.quadraticCurveTo(width / 4, height * 2 / 3 + 20, width / 2, height * 2 / 3);
      // Right page
      ctx.moveTo(width / 2, height / 3);
      ctx.quadraticCurveTo(width * 3 / 4, height / 3 - 20, width * 5 / 6, height / 3);
      ctx.lineTo(width * 5 / 6, height * 2 / 3);
      ctx.quadraticCurveTo(width * 3 / 4, height * 2 / 3 + 20, width / 2, height * 2 / 3);
      // Spine
      ctx.moveTo(width / 2, height / 3);
      ctx.lineTo(width / 2, height * 2 / 3);
      ctx.stroke();
      break;
  }

  ctx.globalAlpha = 1;
}

// Generate a single series image
function generateSeriesImage(series) {
  const width = 800;
  const height = 450;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Draw themed background
  drawThemePattern(ctx, series.theme, width, height);

  // Add overlay gradient for text readability
  const overlay = ctx.createLinearGradient(0, height * 0.4, 0, height);
  overlay.addColorStop(0, 'rgba(15, 37, 64, 0)');
  overlay.addColorStop(1, 'rgba(15, 37, 64, 0.9)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  // Draw gold accent line
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(60, height - 140);
  ctx.lineTo(width - 60, height - 140);
  ctx.stroke();

  // Series name
  ctx.fillStyle = CREAM;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(series.name.toUpperCase(), width / 2, height - 85);

  // Tagline
  ctx.fillStyle = GOLD;
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(series.tagline, width / 2, height - 45);

  // Scripture reference (top right)
  if (series.scripture) {
    ctx.fillStyle = 'rgba(201, 162, 39, 0.8)';
    ctx.font = '20px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(series.scripture, width - 40, 40);
  }

  // VBBC watermark (bottom left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Victory Bible Baptist Church', 40, height - 15);

  return canvas;
}

// Main function
async function generateAllImages() {
  console.log('Generating sermon series images...\n');

  for (const series of seriesData) {
    try {
      const canvas = generateSeriesImage(series);
      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      const outputPath = path.join(outputDir, series.filename);
      
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Created: ${series.filename}`);
    } catch (error) {
      console.error(`✗ Error creating ${series.filename}:`, error.message);
    }
  }

  console.log('\n✅ Done! Images saved to: public/images/series/');
}

generateAllImages();
