import type { Story } from "@shared/schema";

export interface CoverTheme {
  name: string;
  background: string;
  titleColor: string;
  authorColor: string;
  accentColor: string;
  font: string;
}

export const COVER_THEMES: CoverTheme[] = [
  {
    name: "Classic",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    titleColor: "#ffffff",
    authorColor: "#f0f0f0",
    accentColor: "#ffd700",
    font: "Georgia, serif"
  },
  {
    name: "Modern",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    titleColor: "#ffffff",
    authorColor: "#f8f8f8",
    accentColor: "#ffeb3b",
    font: "Helvetica, Arial, sans-serif"
  },
  {
    name: "Dark",
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    titleColor: "#ecf0f1",
    authorColor: "#bdc3c7",
    accentColor: "#e74c3c",
    font: "Georgia, serif"
  },
  {
    name: "Nature",
    background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
    titleColor: "#ffffff",
    authorColor: "#f0f0f0",
    accentColor: "#ffeb3b",
    font: "Helvetica, Arial, sans-serif"
  },
  {
    name: "Ocean",
    background: "linear-gradient(135deg, #0077be 0%, #1e88e5 100%)",
    titleColor: "#ffffff",
    authorColor: "#e3f2fd",
    accentColor: "#00bcd4",
    font: "Georgia, serif"
  },
  {
    name: "Sunset",
    background: "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)",
    titleColor: "#ffffff",
    authorColor: "#fff3e0",
    accentColor: "#ff5722",
    font: "Helvetica, Arial, sans-serif"
  }
];

export class CoverGenerator {
  private static canvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  static initialize() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 1200;
    this.ctx = this.canvas.getContext('2d')!;
  }

  static async generateCover(
    story: Story, 
    themeName: string = 'Classic',
    customOptions?: Partial<CoverTheme>
  ): Promise<Blob> {
    if (!this.ctx) this.initialize();

    const theme = COVER_THEMES.find(t => t.name === themeName) || COVER_THEMES[0];
    const finalTheme = { ...theme, ...customOptions };

    const { ctx, canvas } = this;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    await this.drawBackground(ctx, canvas, finalTheme.background);

    // Draw decorative elements
    this.drawDecorations(ctx, canvas, finalTheme.accentColor);

    // Draw title
    this.drawTitle(ctx, story.title, finalTheme);

    // Draw author
    this.drawAuthor(ctx, story.author, finalTheme);

    // Draw fandom (if available)
    if (story.fandom) {
      const fandomText = Array.isArray(story.fandom) ? story.fandom.join(', ') : story.fandom;
      this.drawFandom(ctx, fandomText, finalTheme);
    }

    // Draw border
    this.drawBorder(ctx, canvas, finalTheme.accentColor);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  private static async drawBackground(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    background: string
  ) {
    if (background.startsWith('linear-gradient')) {
      // Parse gradient
      const gradientMatch = background.match(/linear-gradient\(([^)]+)\)/);
      if (gradientMatch) {
        const params = gradientMatch[1].split(',');
        const angle = params[0].trim();
        const colors = params.slice(1).map(c => c.trim());

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        colors.forEach((color, index) => {
          const position = index / (colors.length - 1);
          const colorValue = color.split(' ')[0];
          gradient.addColorStop(position, colorValue);
        });

        ctx.fillStyle = gradient;
      }
    } else {
      ctx.fillStyle = background;
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private static drawDecorations(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    accentColor: string
  ) {
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.1;

    // Draw some decorative circles
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 20;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  private static drawTitle(
    ctx: CanvasRenderingContext2D, 
    title: string, 
    theme: CoverTheme
  ) {
    ctx.fillStyle = theme.titleColor;
    ctx.font = `bold 72px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Wrap text if too long
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 700 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const startY = 400 - (lines.length - 1) * 40;
    lines.forEach((line, index) => {
      ctx.fillText(line, 400, startY + index * 80);
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  private static drawAuthor(
    ctx: CanvasRenderingContext2D, 
    author: string, 
    theme: CoverTheme
  ) {
    ctx.fillStyle = theme.authorColor;
    ctx.font = `italic 36px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(`by ${author}`, 400, 700);
  }

  private static drawFandom(
    ctx: CanvasRenderingContext2D, 
    fandom: string, 
    theme: CoverTheme
  ) {
    ctx.fillStyle = theme.accentColor;
    ctx.font = `24px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(fandom, 400, 800);
  }

  private static drawBorder(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    accentColor: string
  ) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  }

  static getThemes(): CoverTheme[] {
    return [...COVER_THEMES];
  }

  static getTheme(name: string): CoverTheme | undefined {
    return COVER_THEMES.find(t => t.name === name);
  }
}
