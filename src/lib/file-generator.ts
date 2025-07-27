import JSZip from "jszip";
import type { Story, DownloadOptions } from "@shared/schema";

export class FileGenerator {
  static async generateEpub(story: Story, options: DownloadOptions): Promise<Blob> {
    const zip = new JSZip();
    
    // EPUB structure
    zip.file("mimetype", "application/epub+zip");
    
    const metaInf = zip.folder("META-INF");
    metaInf!.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    const oebps = zip.folder("OEBPS");
    
    // Content.opf
    oebps!.file("content.opf", this.generateContentOpf(story, options));
    
    // Toc.ncx
    oebps!.file("toc.ncx", this.generateTocNcx(story));
    
    // Stylesheet
    oebps!.file("styles.css", this.generateStylesheet());
    
    // Title page
    oebps!.file("titlepage.xhtml", this.generateTitlePage(story));
    
    // Chapters (simulated)
    for (let i = 1; i <= (story.chapters || 1); i++) {
      oebps!.file(`chapter${i}.xhtml`, this.generateChapter(i, story));
    }
    
    return zip.generateAsync({ type: "blob" });
  }

  static async generatePdf(story: Story, options: DownloadOptions): Promise<Blob> {
    // Simple text-based PDF generation
    // In a real implementation, you'd use a proper PDF library
    const content = this.generateTextContent(story);
    return new Blob([content], { type: "application/pdf" });
  }

  static async generateTxt(story: Story, options: DownloadOptions): Promise<Blob> {
    const content = this.generateTextContent(story);
    return new Blob([content], { type: "text/plain; charset=utf-8" });
  }

  static async generateHtml(story: Story, options: DownloadOptions): Promise<Blob> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${story.title}</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        .meta { color: #666; font-style: italic; margin-bottom: 30px; }
        .chapter { margin-bottom: 40px; }
        .chapter h2 { color: #555; }
    </style>
</head>
<body>
    <h1>${story.title}</h1>
    <div class="meta">
        <p>By ${story.author}</p>
        ${story.fandom ? `<p>Fandom: ${story.fandom}</p>` : ''}
        ${story.summary ? `<p>Summary: ${story.summary}</p>` : ''}
    </div>
    
    ${Array.from({ length: story.chapters || 1 }, (_, i) => `
    <div class="chapter">
        <h2>Chapter ${i + 1}</h2>
        <p>This is the content of chapter ${i + 1}. In a real implementation, this would contain the actual story content.</p>
    </div>
    `).join('')}
</body>
</html>`;

    return new Blob([html], { type: "text/html; charset=utf-8" });
  }

  static async generateMarkdown(story: Story, options: DownloadOptions): Promise<Blob> {
    const markdown = `# ${story.title}

**Author:** ${story.author}
${story.fandom ? `**Fandom:** ${story.fandom}` : ''}
${story.summary ? `**Summary:** ${story.summary}` : ''}

---

${Array.from({ length: story.chapters || 1 }, (_, i) => `
## Chapter ${i + 1}

This is the content of chapter ${i + 1}. In a real implementation, this would contain the actual story content.

`).join('')}`;

    return new Blob([markdown], { type: "text/markdown; charset=utf-8" });
  }

  private static generateContentOpf(story: Story, options: DownloadOptions): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${story.title}</dc:title>
    <dc:creator opf:role="aut">${story.author}</dc:creator>
    <dc:identifier id="BookId">${story.id}</dc:identifier>
    <dc:language>en</dc:language>
    ${story.summary ? `<dc:description>${story.summary}</dc:description>` : ''}
  </metadata>
  
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="stylesheet" href="styles.css" media-type="text/css"/>
    <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
    ${Array.from({ length: story.chapters || 1 }, (_, i) => 
      `<item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n    ')}
  </manifest>
  
  <spine toc="ncx">
    <itemref idref="titlepage"/>
    ${Array.from({ length: story.chapters || 1 }, (_, i) => 
      `<itemref idref="chapter${i + 1}"/>`
    ).join('\n    ')}
  </spine>
</package>`;
  }

  private static generateTocNcx(story: Story): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${story.id}"/>
  </head>
  
  <docTitle>
    <text>${story.title}</text>
  </docTitle>
  
  <navMap>
    <navPoint id="titlepage" playOrder="1">
      <navLabel><text>Title Page</text></navLabel>
      <content src="titlepage.xhtml"/>
    </navPoint>
    ${Array.from({ length: story.chapters || 1 }, (_, i) => `
    <navPoint id="chapter${i + 1}" playOrder="${i + 2}">
      <navLabel><text>Chapter ${i + 1}</text></navLabel>
      <content src="chapter${i + 1}.xhtml"/>
    </navPoint>`).join('')}
  </navMap>
</ncx>`;
  }

  private static generateStylesheet(): string {
    return `body {
  font-family: Georgia, serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
}

h1, h2 {
  color: #333;
}

.title-page {
  text-align: center;
  page-break-after: always;
}

.chapter {
  page-break-before: always;
}

p {
  margin-bottom: 1em;
  text-align: justify;
}`;
  }

  private static generateTitlePage(story: Story): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Title Page</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="title-page">
    <h1>${story.title}</h1>
    <h2>by ${story.author}</h2>
    ${story.fandom ? `<p><strong>Fandom:</strong> ${story.fandom}</p>` : ''}
    ${story.summary ? `<div><strong>Summary:</strong><br/>${story.summary}</div>` : ''}
  </div>
</body>
</html>`;
  }

  private static generateChapter(chapterNum: number, story: Story): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Chapter ${chapterNum}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter">
    <h2>Chapter ${chapterNum}</h2>
    <p>This is the content of chapter ${chapterNum}. In a real implementation, this would contain the actual story content fetched from the source website.</p>
    <p>The content would be properly formatted and cleaned up, with proper paragraph breaks and formatting preserved from the original source.</p>
  </div>
</body>
</html>`;
  }

  private static generateTextContent(story: Story): string {
    return `${story.title}
by ${story.author}

${story.fandom ? `Fandom: ${Array.isArray(story.fandom) ? story.fandom.join(', ') : story.fandom}\n` : ''}${story.summary ? `Summary: ${story.summary}\n` : ''}

${Array.from({ length: story.chapters || 1 }, (_, i) => `
Chapter ${i + 1}

This is the content of chapter ${i + 1}. In a real implementation, this would contain the actual story content.

`).join('')}`;
  }

  static generateFilename(story: Story, format: string, template: string): string {
    const sanitize = (str: string) => str.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
    
    const variables: Record<string, string> = {
      title: sanitize(story.title),
      author: sanitize(story.author),
      fandom: sanitize(Array.isArray(story.fandom) ? story.fandom.join(', ') : (story.fandom || 'Unknown')),
      date: new Date().toISOString().split('T')[0],
    };

    let filename = template;
    Object.entries(variables).forEach(([key, value]) => {
      filename = filename.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return `${filename}.${format}`;
  }
}
