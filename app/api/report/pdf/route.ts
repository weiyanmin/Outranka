import { NextRequest, NextResponse } from 'next/server';
import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkPdf from 'remark-pdf';
import { visit } from 'unist-util-visit';
import { Root } from 'mdast';
import { createClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(() => (tree: Root) => {
    // Reports contain only text and links; don't let user/AI Markdown make the
    // PDF renderer fetch remote images or interpret raw HTML.
    visit(tree, ['image', 'imageReference', 'html'], (node, index, parent) => {
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1);
        return index;
      }
    });
    visit(tree, 'link', (node) => {
      if (!/^(https?:|mailto:)/i.test(node.url)) node.url = '';
    });
  })
  .use(remarkPdf, {
    size: 'A4',
    orientation: 'portrait',
    margin: { top: 48, right: 52, bottom: 48, left: 52 },
    spacing: 8,
    thematicBreak: 'line',
    styles: {
      default: { font: 'Helvetica', fontSize: 9.5, color: '#344054' },
      head1: { fontSize: 23, bold: true, color: '#173b39' },
      head2: { fontSize: 16, bold: true, color: '#176f68' },
      head3: { fontSize: 11.5, bold: true, color: '#202124' },
      head4: { fontSize: 10, bold: true, color: '#202124' },
      link: { color: '#176f68', underline: true },
      inlineCode: { font: 'Courier', fontSize: 8.5, color: '#344054' },
      code: { font: 'Courier', fontSize: 8, color: '#344054' },
      blockquote: { color: '#475467' },
    },
  });

async function generateReportPdf(markdown: string) {
  const markdownFile = await processor.process(markdown);
  const output = new Uint8Array(await markdownFile.result);
  const signature = new TextEncoder().encode('%PDF-');
  const endMarker = new TextEncoder().encode('%%EOF');
  const findMarker = (marker: Uint8Array, fromEnd = false) => {
    const start = fromEnd ? output.length - marker.length : 0;
    const stop = fromEnd ? -1 : output.length - marker.length + 1;
    const step = fromEnd ? -1 : 1;
    for (let offset = start; offset !== stop; offset += step) {
      if (marker.every((byte, index) => output[offset + index] === byte)) return offset;
    }
    return -1;
  };

  // remark-pdf currently returns the pooled Buffer's full backing ArrayBuffer;
  // trim it to the actual PDF bytes before sending the download response.
  const pdfStart = findMarker(signature);
  const eofStart = findMarker(endMarker, true);
  if (pdfStart < 0 || eofStart < pdfStart) throw new Error('PDF output was incomplete.');

  let pdfEnd = eofStart + endMarker.length;
  while (output[pdfEnd] === 10 || output[pdfEnd] === 13) pdfEnd += 1;
  return output.slice(pdfStart, pdfEnd);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to download this report.' }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body.markdown !== 'string' || !body.markdown.trim()) {
      return NextResponse.json({ error: 'Report content is missing.' }, { status: 400 });
    }
    if (body.markdown.length > 500_000) {
      return NextResponse.json({ error: 'This report is too large to export as a PDF.' }, { status: 413 });
    }

    const pdfContent = await generateReportPdf(body.markdown);
    const requestedFilename = typeof body.filename === 'string' ? body.filename : '';
    const filename = /^outranka-report-[a-z0-9-]{1,40}\.pdf$/.test(requestedFilename)
      ? requestedFilename
      : 'outranka-report-audit.pdf';

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('PDF report generation failed.', error);
    return NextResponse.json({ error: 'Could not generate the PDF. Please try again.' }, { status: 500 });
  }
}
