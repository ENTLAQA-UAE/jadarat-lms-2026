// src/lib/scorm/package-generator.ts
//
// SCORM 1.2 / 2004 package generator.
// Converts JSON course content into a self-contained SCORM ZIP that any
// compliant LMS can import and play.

import JSZip from 'jszip';
import { XMLBuilder } from 'fast-xml-parser';
import type {
  CourseContent,
  Block,
  Module,
  Lesson,
  BlockType,
  TextBlock,
  ImageBlock,
  VideoBlock,
  AudioBlock,
  EmbedBlock,
  QuoteBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  DividerBlock,
  CoverBlock,
  GalleryBlock,
  ChartBlock,
  AccordionBlock,
  TabsBlock,
  FlashcardBlock,
  LabeledGraphicBlock,
  ProcessBlock,
  TimelineBlock,
  HotspotBlock,
  ScenarioBlock,
  MultipleChoiceBlock,
  TrueFalseBlock,
  MultipleResponseBlock,
  FillInBlankBlock,
  MatchingBlock,
  SortingBlock,
} from '@/types/authoring';

// ---------------------------------------------------------------------------
// SCORM Player Localization
// ---------------------------------------------------------------------------

const SCORM_PLAYER_STRINGS = {
  en: {
    submit: 'Submit',
    tryAgain: 'Try Again',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    score: 'Score',
    complete: 'Complete',
    nextLesson: 'Next Lesson',
    prevLesson: 'Previous Lesson',
    progress: 'Progress',
    courseComplete: 'Course Complete!',
  },
  ar: {
    submit: 'إرسال',
    tryAgain: 'حاول مرة أخرى',
    correct: 'صحيح!',
    incorrect: 'غير صحيح',
    score: 'النتيجة',
    complete: 'مكتمل',
    nextLesson: 'الدرس التالي',
    prevLesson: 'الدرس السابق',
    progress: 'التقدم',
    courseComplete: 'تم إكمال الدورة!',
  },
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ScormVersion = '1.2' | '2004';

export interface ScormExportOptions {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  content: CourseContent;
  version: ScormVersion;
  organizationId: number;
  authorName?: string;
}

export interface ScormExportResult {
  blob: Blob;
  filename: string;
  fileCount: number;
  totalSize: number;
}

// ---------------------------------------------------------------------------
// Assessment block type guards
// ---------------------------------------------------------------------------

const ASSESSMENT_TYPES: Set<string> = new Set([
  'multiple_choice',
  'true_false',
  'multiple_response',
  'fill_in_blank',
  'matching',
  'sorting',
]);

function isAssessmentBlock(block: Block): boolean {
  return ASSESSMENT_TYPES.has(block.type);
}

function getAssessmentBlocks(content: CourseContent): Block[] {
  const blocks: Block[] = [];
  for (const mod of content.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (isAssessmentBlock(block)) {
          blocks.push(block);
        }
      }
    }
  }
  return blocks;
}

function getTotalPoints(content: CourseContent): number {
  let total = 0;
  for (const block of getAssessmentBlocks(content)) {
    const data = block.data as { points?: number };
    total += data.points ?? 1;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Escape helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return escapeHtml(str);
}

// ---------------------------------------------------------------------------
// renderBlockToHtml -- converts each block type to static HTML
// ---------------------------------------------------------------------------

export function renderBlockToHtml(block: Block): string {
  switch (block.type) {
    // ----- Content blocks -----

    case 'text': {
      const b = block as TextBlock;
      const dir = b.data.direction ?? 'auto';
      const align = b.data.alignment ?? 'start';
      return `<div class="block block-text" dir="${dir}" style="text-align:${align}">${b.data.content}</div>`;
    }

    case 'image': {
      const b = block as ImageBlock;
      const widthMap = { small: '33%', medium: '50%', large: '75%', full: '100%' };
      const w = widthMap[b.data.width] ?? '100%';
      const caption = b.data.caption
        ? `<figcaption>${escapeHtml(b.data.caption)}</figcaption>`
        : '';
      const img = `<img src="${escapeAttr(b.data.src)}" alt="${escapeAttr(b.data.alt)}" style="max-width:${w};height:auto">`;
      const linked = b.data.link_url
        ? `<a href="${escapeAttr(b.data.link_url)}" target="_blank" rel="noopener">${img}</a>`
        : img;
      return `<figure class="block block-image" style="text-align:${b.data.alignment ?? 'center'}">${linked}${caption}</figure>`;
    }

    case 'video': {
      const b = block as VideoBlock;
      const url = `https://iframe.mediadelivery.net/embed/${b.data.bunny_library_id}/${b.data.bunny_video_id}`;
      return `<div class="block block-video">
        <p><strong>${escapeHtml(b.data.title)}</strong></p>
        ${b.data.description ? `<p>${escapeHtml(b.data.description)}</p>` : ''}
        <a href="${escapeAttr(url)}" target="_blank" rel="noopener">Watch: ${escapeHtml(b.data.title)}</a>
      </div>`;
    }

    case 'audio': {
      const b = block as AudioBlock;
      return `<div class="block block-audio">
        <p><strong>${escapeHtml(b.data.title)}</strong></p>
        <audio controls src="${escapeAttr(b.data.src)}" preload="metadata">Your browser does not support the audio element.</audio>
        ${b.data.show_transcript && b.data.transcript ? `<details><summary>Transcript</summary><p>${escapeHtml(b.data.transcript)}</p></details>` : ''}
      </div>`;
    }

    case 'embed': {
      const b = block as EmbedBlock;
      const ratioMap: Record<string, string> = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%' };
      const padding = ratioMap[b.data.aspect_ratio] ?? '56.25%';
      return `<div class="block block-embed" style="position:relative;padding-bottom:${padding};height:0;overflow:hidden">
        <iframe src="${escapeAttr(b.data.url)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" ${b.data.allow_fullscreen ? 'allowfullscreen' : ''} loading="lazy"></iframe>
      </div>`;
    }

    case 'quote': {
      const b = block as QuoteBlock;
      const styleClass = b.data.style === 'large' ? 'font-size:1.4em' : b.data.style === 'highlight' ? 'border-left:4px solid var(--primary-color);padding-left:1em' : '';
      return `<blockquote class="block block-quote" style="${styleClass}">
        <p>${escapeHtml(b.data.text)}</p>
        ${b.data.attribution ? `<footer>-- ${escapeHtml(b.data.attribution)}</footer>` : ''}
      </blockquote>`;
    }

    case 'list': {
      const b = block as ListBlock;
      const tag = b.data.style === 'numbered' ? 'ol' : 'ul';
      const items = b.data.items
        .map((item) => {
          const icon = item.icon ? `<span class="list-icon">${escapeHtml(item.icon)}</span> ` : '';
          return `<li>${icon}${escapeHtml(item.text)}</li>`;
        })
        .join('\n');
      const colStyle = b.data.columns > 1 ? `style="columns:${b.data.columns}"` : '';
      return `<${tag} class="block block-list" ${colStyle}>${items}</${tag}>`;
    }

    case 'code': {
      const b = block as CodeBlock;
      return `<div class="block block-code">
        <pre${b.data.show_line_numbers ? ' class="line-numbers"' : ''}><code class="language-${escapeAttr(b.data.language)}">${escapeHtml(b.data.code)}</code></pre>
        ${b.data.caption ? `<p class="code-caption">${escapeHtml(b.data.caption)}</p>` : ''}
      </div>`;
    }

    case 'table': {
      const b = block as TableBlock;
      let html = `<div class="block block-table"><table class="${b.data.striped ? 'striped' : ''}">`;
      if (b.data.has_header_row && b.data.headers.length) {
        html += '<thead><tr>' + b.data.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead>';
      }
      html += '<tbody>';
      for (const row of b.data.rows) {
        html += '<tr>' + row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>';
      }
      html += '</tbody></table>';
      if (b.data.caption) html += `<p class="table-caption">${escapeHtml(b.data.caption)}</p>`;
      html += '</div>';
      return html;
    }

    case 'divider': {
      const b = block as DividerBlock;
      const spacingMap = { small: '0.5em', medium: '1em', large: '2em' };
      const margin = spacingMap[b.data.spacing] ?? '1em';
      if (b.data.style === 'dots') {
        return `<div class="block block-divider" style="text-align:center;margin:${margin} 0">&#8226; &#8226; &#8226;</div>`;
      }
      if (b.data.style === 'space') {
        return `<div class="block block-divider" style="margin:${margin} 0">&nbsp;</div>`;
      }
      return `<hr class="block block-divider" style="margin:${margin} 0">`;
    }

    case 'cover': {
      const b = block as CoverBlock;
      const heightMap = { small: '200px', medium: '400px', large: '600px' };
      const h = heightMap[b.data.height] ?? '400px';
      return `<div class="block block-cover" style="position:relative;height:${h};background-image:url('${escapeAttr(b.data.background_image)}');background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;text-align:${b.data.text_alignment ?? 'center'}">
        <div style="position:absolute;inset:0;background:${escapeAttr(b.data.overlay_color)}"></div>
        <div style="position:relative;color:#fff;padding:2em">
          <h1>${escapeHtml(b.data.title)}</h1>
          ${b.data.subtitle ? `<p style="font-size:1.2em">${escapeHtml(b.data.subtitle)}</p>` : ''}
        </div>
      </div>`;
    }

    case 'gallery': {
      const b = block as GalleryBlock;
      const cols = b.data.columns ?? 3;
      const items = b.data.images
        .map(
          (img) =>
            `<figure style="margin:0"><img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}" style="width:100%;height:auto">${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ''}</figure>`
        )
        .join('\n');
      return `<div class="block block-gallery" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:1em">${items}</div>`;
    }

    case 'chart': {
      const b = block as ChartBlock;
      const dataInfo = b.data.datasets
        .map((ds) => `${escapeHtml(ds.label)}: [${ds.data.join(', ')}]`)
        .join('<br>');
      return `<div class="block block-chart" style="border:1px dashed #ccc;padding:1em;text-align:center">
        <p><strong>${escapeHtml(b.data.title)}</strong></p>
        <p><em>Chart (${escapeHtml(b.data.chart_type)}) -- labels: ${b.data.labels.map(escapeHtml).join(', ')}</em></p>
        <p>${dataInfo}</p>
      </div>`;
    }

    // ----- Interactive blocks -----

    case 'accordion': {
      const b = block as AccordionBlock;
      const items = b.data.items
        .map(
          (item) =>
            `<details${b.data.start_expanded ? ' open' : ''}>
              <summary>${item.icon ? `<span>${escapeHtml(item.icon)}</span> ` : ''}${escapeHtml(item.title)}</summary>
              <div class="accordion-content">${item.content}</div>
            </details>`
        )
        .join('\n');
      return `<div class="block block-accordion">${items}</div>`;
    }

    case 'tabs': {
      const b = block as TabsBlock;
      const tabs = b.data.tabs
        .map(
          (tab) =>
            `<div class="tab-panel">
              <h4 class="tab-label">${tab.icon ? `<span>${escapeHtml(tab.icon)}</span> ` : ''}${escapeHtml(tab.label)}</h4>
              <div class="tab-content">${tab.content}</div>
            </div>`
        )
        .join('\n');
      return `<div class="block block-tabs">${tabs}</div>`;
    }

    case 'flashcard': {
      const b = block as FlashcardBlock;
      const cards = b.data.cards
        .map(
          (card) =>
            `<div class="flashcard" style="border:1px solid #ddd;border-radius:8px;padding:1em;margin-bottom:1em">
              <div class="flashcard-front"><strong>Front:</strong> ${escapeHtml(card.front)}${card.image_front ? `<br><img src="${escapeAttr(card.image_front)}" alt="Front image" style="max-width:200px">` : ''}</div>
              <details><summary>Reveal back</summary>
                <div class="flashcard-back">${escapeHtml(card.back)}${card.image_back ? `<br><img src="${escapeAttr(card.image_back)}" alt="Back image" style="max-width:200px">` : ''}</div>
              </details>
            </div>`
        )
        .join('\n');
      return `<div class="block block-flashcard">${cards}</div>`;
    }

    case 'labeled_graphic': {
      const b = block as LabeledGraphicBlock;
      const markers = b.data.markers
        .map(
          (m) =>
            `<li><strong>${escapeHtml(m.label)}</strong>: ${escapeHtml(m.description)}</li>`
        )
        .join('\n');
      return `<div class="block block-labeled-graphic">
        <img src="${escapeAttr(b.data.image)}" alt="Labeled graphic" style="max-width:100%;height:auto">
        <ul>${markers}</ul>
      </div>`;
    }

    case 'process': {
      const b = block as ProcessBlock;
      const tag = b.data.numbered ? 'ol' : 'ul';
      const steps = b.data.steps
        .map(
          (step) =>
            `<li>
              <strong>${escapeHtml(step.title)}</strong>
              <p>${escapeHtml(step.description)}</p>
              ${step.image ? `<img src="${escapeAttr(step.image)}" alt="${escapeAttr(step.title)}" style="max-width:300px">` : ''}
            </li>`
        )
        .join('\n');
      return `<div class="block block-process"><${tag}>${steps}</${tag}></div>`;
    }

    case 'timeline': {
      const b = block as TimelineBlock;
      const events = b.data.events
        .map(
          (ev) =>
            `<li>
              <strong>${escapeHtml(ev.date)} -- ${escapeHtml(ev.title)}</strong>
              <p>${escapeHtml(ev.description)}</p>
              ${ev.image ? `<img src="${escapeAttr(ev.image)}" alt="${escapeAttr(ev.title)}" style="max-width:300px">` : ''}
            </li>`
        )
        .join('\n');
      return `<div class="block block-timeline"><ol>${events}</ol></div>`;
    }

    case 'hotspot': {
      const b = block as HotspotBlock;
      const regions = b.data.regions
        .map(
          (r) =>
            `<li><strong>${escapeHtml(r.label)}</strong>: ${escapeHtml(r.content)}</li>`
        )
        .join('\n');
      return `<div class="block block-hotspot">
        <img src="${escapeAttr(b.data.image)}" alt="Hotspot image" style="max-width:100%;height:auto">
        <p><em>Mode: ${b.data.mode}</em></p>
        <ul>${regions}</ul>
      </div>`;
    }

    case 'scenario': {
      const b = block as ScenarioBlock;
      const nodes = b.data.nodes
        .map((node) => {
          let html = `<div class="scenario-node" style="border:1px solid #ddd;border-radius:8px;padding:1em;margin-bottom:0.5em">`;
          html += `<p><strong>${node.type === 'question' ? 'Question' : 'Outcome'}:</strong> ${escapeHtml(node.content)}</p>`;
          if (node.image) html += `<img src="${escapeAttr(node.image)}" alt="" style="max-width:200px">`;
          if (node.choices && node.choices.length) {
            html += '<ul>';
            for (const choice of node.choices) {
              html += `<li>${escapeHtml(choice.text)}${choice.feedback ? ` <em>(${escapeHtml(choice.feedback)})</em>` : ''}</li>`;
            }
            html += '</ul>';
          }
          if (node.type === 'outcome') {
            html += `<p><em>${node.is_positive_outcome ? 'Positive outcome' : 'Negative outcome'}</em></p>`;
          }
          html += '</div>';
          return html;
        })
        .join('\n');
      return `<div class="block block-scenario">
        <h4>${escapeHtml(b.data.title)}</h4>
        <p>${escapeHtml(b.data.description)}</p>
        ${nodes}
      </div>`;
    }

    // ----- Assessment blocks -----

    case 'multiple_choice': {
      const b = block as MultipleChoiceBlock;
      const opts = b.data.options
        .map(
          (opt) =>
            `<label style="display:block;margin:0.3em 0;cursor:pointer">
              <input type="radio" name="mc_${block.id}" value="${escapeAttr(opt.id)}" data-correct="${opt.is_correct}"${opt.feedback ? ` data-feedback="${escapeAttr(opt.feedback)}"` : ''}>
              ${escapeHtml(opt.text)}
            </label>`
        )
        .join('\n');
      return `<div class="block block-assessment block-mc" data-block-id="${block.id}" data-points="${b.data.points}">
        <p class="question"><strong>${escapeHtml(b.data.question)}</strong></p>
        <form onsubmit="return window.__checkMC(event, '${block.id}')">
          ${opts}
          <button type="submit" class="btn-check">Check Answer</button>
        </form>
        <div class="feedback" style="display:none"></div>
        <div class="explanation" style="display:none"><p>${escapeHtml(b.data.explanation)}</p></div>
      </div>`;
    }

    case 'true_false': {
      const b = block as TrueFalseBlock;
      return `<div class="block block-assessment block-tf" data-block-id="${block.id}" data-points="${b.data.points}">
        <p class="question"><strong>${escapeHtml(b.data.statement)}</strong></p>
        <form onsubmit="return window.__checkTF(event, '${block.id}', ${b.data.correct_answer})">
          <label style="display:block;margin:0.3em 0;cursor:pointer">
            <input type="radio" name="tf_${block.id}" value="true"> True
          </label>
          <label style="display:block;margin:0.3em 0;cursor:pointer">
            <input type="radio" name="tf_${block.id}" value="false"> False
          </label>
          <button type="submit" class="btn-check">Check Answer</button>
        </form>
        <div class="feedback" style="display:none"></div>
        <div class="explanation-true" style="display:none"><p>${escapeHtml(b.data.explanation_true)}</p></div>
        <div class="explanation-false" style="display:none"><p>${escapeHtml(b.data.explanation_false)}</p></div>
      </div>`;
    }

    case 'multiple_response': {
      const b = block as MultipleResponseBlock;
      const opts = b.data.options
        .map(
          (opt) =>
            `<label style="display:block;margin:0.3em 0;cursor:pointer">
              <input type="checkbox" name="mr_${block.id}" value="${escapeAttr(opt.id)}" data-correct="${opt.is_correct}"${opt.feedback ? ` data-feedback="${escapeAttr(opt.feedback)}"` : ''}>
              ${escapeHtml(opt.text)}
            </label>`
        )
        .join('\n');
      return `<div class="block block-assessment block-mr" data-block-id="${block.id}" data-points="${b.data.points}" data-scoring="${b.data.scoring}">
        <p class="question"><strong>${escapeHtml(b.data.question)}</strong></p>
        <form onsubmit="return window.__checkMR(event, '${block.id}')">
          ${opts}
          <button type="submit" class="btn-check">Check Answer</button>
        </form>
        <div class="feedback" style="display:none"></div>
        <div class="explanation" style="display:none"><p>${escapeHtml(b.data.explanation)}</p></div>
      </div>`;
    }

    case 'fill_in_blank': {
      const b = block as FillInBlankBlock;
      // Replace ___blank_X___ placeholders with input fields
      let rendered = escapeHtml(b.data.text_with_blanks);
      for (const blank of b.data.blanks) {
        const placeholder = `___${blank.id}___`;
        const input = `<input type="text" class="fib-input" data-blank-id="${escapeAttr(blank.id)}" data-answers="${escapeAttr(JSON.stringify(blank.correct_answers))}" data-case-sensitive="${blank.case_sensitive}" style="border-bottom:2px solid var(--primary-color);outline:none;padding:2px 4px;min-width:100px">`;
        rendered = rendered.replace(placeholder, input);
      }
      return `<div class="block block-assessment block-fib" data-block-id="${block.id}" data-points="${b.data.points}">
        <p>${rendered}</p>
        <button onclick="window.__checkFIB('${block.id}')" class="btn-check">Check Answer</button>
        <div class="feedback" style="display:none"></div>
        <div class="explanation" style="display:none"><p>${escapeHtml(b.data.explanation)}</p></div>
      </div>`;
    }

    case 'matching': {
      const b = block as MatchingBlock;
      const rows = b.data.pairs
        .map(
          (pair) =>
            `<tr>
              <td style="padding:0.5em;border:1px solid #ddd">${escapeHtml(pair.left)}</td>
              <td style="padding:0.5em;border:1px solid #ddd">${escapeHtml(pair.right)}</td>
            </tr>`
        )
        .join('\n');
      return `<div class="block block-assessment block-matching" data-block-id="${block.id}" data-points="${b.data.points}">
        ${b.data.instruction ? `<p><strong>${escapeHtml(b.data.instruction)}</strong></p>` : ''}
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="padding:0.5em;border:1px solid #ddd;text-align:start">Item</th><th style="padding:0.5em;border:1px solid #ddd;text-align:start">Match</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="explanation" style="display:none"><p>${escapeHtml(b.data.explanation)}</p></div>
      </div>`;
    }

    case 'sorting': {
      const b = block as SortingBlock;
      const catMap = new Map(b.data.categories.map((c) => [c.id, c.name]));
      const items = b.data.items
        .map(
          (item) =>
            `<li>${escapeHtml(item.text)} <em>(${escapeHtml(catMap.get(item.correct_category_id) ?? '')})</em></li>`
        )
        .join('\n');
      return `<div class="block block-assessment block-sorting" data-block-id="${block.id}" data-points="${b.data.points}">
        ${b.data.instruction ? `<p><strong>${escapeHtml(b.data.instruction)}</strong></p>` : ''}
        <ol>${items}</ol>
        <div class="explanation" style="display:none"><p>${escapeHtml(b.data.explanation)}</p></div>
      </div>`;
    }

    default: {
      // Fallback for any unrecognised block type
      return `<div class="block block-unknown" style="border:1px dashed #ccc;padding:1em"><em>Unsupported block type: ${escapeHtml((block as BaseBlock).type)}</em></div>`;
    }
  }
}

// We need BaseBlock for the default case
import type { BaseBlock } from '@/types/authoring';

// ---------------------------------------------------------------------------
// generateManifestXml -- builds imsmanifest.xml
// ---------------------------------------------------------------------------

export function generateManifestXml(options: ScormExportOptions): string {
  const { courseId, courseTitle, courseDescription, content, version, organizationId } = options;
  const orgId = `ORG-${organizationId}`;
  const courseIdentifier = `COURSE-${courseId}`;
  const resourceId = `RES-${courseId}`;

  if (version === '1.2') {
    return buildManifest12(courseIdentifier, orgId, courseTitle, courseDescription, resourceId, content);
  }
  return buildManifest2004(courseIdentifier, orgId, courseTitle, courseDescription, resourceId, content);
}

function buildManifest12(
  courseIdentifier: string,
  orgId: string,
  title: string,
  description: string,
  resourceId: string,
  content: CourseContent
): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: false,
    suppressBooleanAttributes: false,
  });

  const items = buildOrganizationItems(content, resourceId);

  const manifest = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    manifest: {
      '@_identifier': courseIdentifier,
      '@_version': '1.0',
      '@_xmlns': 'http://www.imsproject.org/xsd/imscp_rootv1p1p2',
      '@_xmlns:adlcp': 'http://www.adlnet.org/xsd/adlcp_rootv1p2',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xsi:schemaLocation':
        'http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd',
      metadata: {
        schema: 'ADL SCORM',
        schemaversion: '1.2',
      },
      organizations: {
        '@_default': orgId,
        organization: {
          '@_identifier': orgId,
          title: title,
          item: items,
        },
      },
      resources: {
        resource: {
          '@_identifier': resourceId,
          '@_type': 'webcontent',
          '@_adlcp:scormtype': 'sco',
          '@_href': 'index.html',
          file: {
            '@_href': 'index.html',
          },
        },
      },
    },
  };

  return builder.build(manifest);
}

function buildManifest2004(
  courseIdentifier: string,
  orgId: string,
  title: string,
  description: string,
  resourceId: string,
  content: CourseContent
): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: false,
    suppressBooleanAttributes: false,
  });

  const items = buildOrganizationItems(content, resourceId);

  const manifest = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    manifest: {
      '@_identifier': courseIdentifier,
      '@_version': '1.0',
      '@_xmlns': 'http://www.imsglobal.org/xsd/imscp_v1p1',
      '@_xmlns:adlcp': 'http://www.adlnet.org/xsd/adlcp_v1p3',
      '@_xmlns:adlnav': 'http://www.adlnet.org/xsd/adlnav_v1p3',
      '@_xmlns:adlseq': 'http://www.adlnet.org/xsd/adlseq_v1p3',
      '@_xmlns:imsss': 'http://www.imsglobal.org/xsd/imsss',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xsi:schemaLocation':
        'http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd',
      metadata: {
        schema: 'ADL SCORM',
        schemaversion: '2004 4th Edition',
      },
      organizations: {
        '@_default': orgId,
        organization: {
          '@_identifier': orgId,
          title: title,
          item: items,
        },
      },
      resources: {
        resource: {
          '@_identifier': resourceId,
          '@_type': 'webcontent',
          '@_adlcp:scormType': 'sco',
          '@_href': 'index.html',
          file: {
            '@_href': 'index.html',
          },
        },
      },
    },
  };

  return builder.build(manifest);
}

function buildOrganizationItems(
  content: CourseContent,
  resourceId: string
): Record<string, unknown>[] {
  const sortedModules = [...content.modules].sort((a, b) => a.order - b.order);

  return sortedModules.map((mod) => {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
    const lessonItems = sortedLessons.map((lesson) => ({
      '@_identifier': `ITEM-${lesson.id}`,
      '@_identifierref': resourceId,
      title: lesson.title,
    }));

    return {
      '@_identifier': `ITEM-MOD-${mod.id}`,
      title: mod.title,
      item: lessonItems,
    };
  });
}

// ---------------------------------------------------------------------------
// generateMetadataXml -- optional metadata.xml for SCORM 2004
// ---------------------------------------------------------------------------

function generateMetadataXml(options: ScormExportOptions): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: false,
  });

  const metadata = {
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    lom: {
      '@_xmlns': 'http://ltsc.ieee.org/xsd/LOM',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xsi:schemaLocation': 'http://ltsc.ieee.org/xsd/LOM lom.xsd',
      general: {
        title: {
          string: { '@_language': options.content.settings.language, '#text': options.courseTitle },
        },
        description: {
          string: { '@_language': options.content.settings.language, '#text': options.courseDescription },
        },
        language: options.content.settings.language,
      },
      lifeCycle: {
        contribute: {
          role: { value: 'author' },
          entity: options.authorName ?? 'Unknown',
        },
      },
      technical: {
        format: 'text/html',
      },
    },
  };

  return builder.build(metadata);
}

// ---------------------------------------------------------------------------
// generatePlayerHtml -- builds the standalone HTML player
// ---------------------------------------------------------------------------

export function generatePlayerHtml(options: ScormExportOptions): string {
  const { courseTitle, courseDescription, content, version } = options;
  const settings = content.settings;
  const dir = settings.direction === 'auto' ? (settings.language === 'ar' ? 'rtl' : 'ltr') : settings.direction;
  const theme = settings.theme;
  const hasAssessments = getAssessmentBlocks(content).length > 0;
  const totalPoints = getTotalPoints(content);

  // Sort modules and lessons
  const sortedModules = [...content.modules].sort((a, b) => a.order - b.order);

  // Build lesson content HTML keyed by lesson id
  const lessonHtmlMap: Record<string, string> = {};
  const lessonOrder: { moduleId: string; moduleTitle: string; lessonId: string; lessonTitle: string }[] = [];

  for (const mod of sortedModules) {
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
    for (const lesson of sortedLessons) {
      lessonOrder.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      });
      const blocksHtml = lesson.blocks
        .filter((b) => b.visible !== false)
        .sort((a, b) => a.order - b.order)
        .map((b) => renderBlockToHtml(b))
        .join('\n');
      lessonHtmlMap[lesson.id] = blocksHtml;
    }
  }

  // Build sidebar navigation HTML
  let sidebarHtml = '';
  for (const mod of sortedModules) {
    sidebarHtml += `<div class="sidebar-module">`;
    sidebarHtml += `<div class="sidebar-module-title">${escapeHtml(mod.title)}</div>`;
    const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
    sidebarHtml += `<ul class="sidebar-lessons">`;
    for (const lesson of sortedLessons) {
      sidebarHtml += `<li><a href="#" class="sidebar-lesson-link" data-lesson-id="${lesson.id}">${escapeHtml(lesson.title)}</a></li>`;
    }
    sidebarHtml += `</ul></div>`;
  }

  // Border radius map
  const radiusMap: Record<string, string> = { none: '0', small: '4px', medium: '8px', large: '12px' };
  const borderRadius = radiusMap[theme.border_radius] ?? '8px';

  // Serialize lesson content for embedding
  const lessonContentJson = JSON.stringify(lessonHtmlMap);
  const lessonOrderJson = JSON.stringify(lessonOrder);

  // SCORM API detection + wrapper differs by version
  const is12 = version === '1.2';

  return `<!DOCTYPE html>
<html lang="${settings.language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(courseTitle)}</title>
  <style>
    :root {
      --primary-color: ${theme.primary_color};
      --secondary-color: ${theme.secondary_color};
      --bg-color: ${theme.background_color};
      --text-color: ${theme.text_color};
      --font-family: ${theme.font_family === 'system' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : theme.font_family === 'cairo' ? '"Cairo", sans-serif' : theme.font_family === 'tajawal' ? '"Tajawal", sans-serif' : '"Inter", sans-serif'};
      --border-radius: ${borderRadius};
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-family);
      background: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      display: flex;
      min-height: 100vh;
    }

    /* Google Fonts (Cairo / Tajawal / Inter) loaded conditionally */
    ${theme.font_family !== 'system' ? `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.font_family.charAt(0).toUpperCase() + theme.font_family.slice(1))}:wght@400;600;700&display=swap');` : ''}

    /* Sidebar */
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: #f7f8fa;
      border-${dir === 'rtl' ? 'left' : 'right'}: 1px solid #e0e0e0;
      padding: 1em;
      overflow-y: auto;
      height: 100vh;
      position: sticky;
      top: 0;
    }

    .sidebar-header {
      padding-bottom: 1em;
      border-bottom: 2px solid var(--primary-color);
      margin-bottom: 1em;
    }

    .sidebar-header h2 {
      font-size: 1.1em;
      color: var(--primary-color);
    }

    .sidebar-module {
      margin-bottom: 1em;
    }

    .sidebar-module-title {
      font-weight: 700;
      font-size: 0.95em;
      padding: 0.4em 0;
      color: var(--text-color);
    }

    .sidebar-lessons {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-lessons li {
      margin: 0;
    }

    .sidebar-lesson-link {
      display: block;
      padding: 0.4em 0.8em;
      border-radius: var(--border-radius);
      text-decoration: none;
      color: var(--text-color);
      font-size: 0.9em;
      transition: background 0.2s;
    }

    .sidebar-lesson-link:hover {
      background: #e8e8e8;
    }

    .sidebar-lesson-link.active {
      background: var(--primary-color);
      color: #fff;
    }

    .sidebar-lesson-link.completed::before {
      content: '\\2713 ';
      color: #4caf50;
    }

    /* Main content */
    .main-content {
      flex: 1;
      padding: 2em;
      max-width: 900px;
      margin: 0 auto;
      overflow-y: auto;
    }

    .course-header {
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 1px solid #e0e0e0;
    }

    .course-header h1 {
      font-size: 1.8em;
      color: var(--primary-color);
    }

    /* Progress bar */
    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      margin: 1em 0;
      ${settings.show_progress_bar ? '' : 'display: none;'}
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 3px;
      transition: width 0.3s ease;
      width: 0%;
    }

    /* Lesson content */
    .lesson-header {
      margin-bottom: 1em;
    }

    .lesson-header h2 {
      font-size: 1.4em;
      color: var(--secondary-color);
    }

    .lesson-body {
      margin-bottom: 2em;
    }

    /* Block styles */
    .block { margin-bottom: 1.5em; }

    .block-quote blockquote,
    blockquote.block-quote {
      border-${dir === 'rtl' ? 'right' : 'left'}: 4px solid var(--primary-color);
      padding-${dir === 'rtl' ? 'right' : 'left'}: 1em;
      margin: 1em 0;
      color: #555;
    }

    .block-code pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1em;
      border-radius: var(--border-radius);
      overflow-x: auto;
      font-size: 0.9em;
    }

    .block-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .block-table table.striped tbody tr:nth-child(even) {
      background: #f5f5f5;
    }

    .block-cover { border-radius: var(--border-radius); overflow: hidden; }

    figure { margin: 1em 0; }
    figcaption { font-size: 0.85em; color: #666; margin-top: 0.3em; }

    details { margin: 0.5em 0; }
    details summary {
      cursor: pointer;
      font-weight: 600;
      padding: 0.5em;
      background: #f5f5f5;
      border-radius: var(--border-radius);
    }
    details > div,
    details > p { padding: 0.5em; }

    .tab-panel {
      border: 1px solid #e0e0e0;
      border-radius: var(--border-radius);
      margin-bottom: 0.5em;
      overflow: hidden;
    }

    .tab-label {
      padding: 0.5em 1em;
      background: #f5f5f5;
      margin: 0;
    }

    .tab-content { padding: 0.8em 1em; }

    /* Assessment styles */
    .btn-check {
      display: inline-block;
      margin-top: 0.8em;
      padding: 0.5em 1.5em;
      background: var(--primary-color);
      color: #fff;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-size: 0.95em;
    }

    .btn-check:hover { opacity: 0.9; }

    .feedback {
      margin-top: 0.5em;
      padding: 0.5em;
      border-radius: var(--border-radius);
    }

    .feedback.correct { background: #e8f5e9; color: #2e7d32; }
    .feedback.incorrect { background: #fbe9e7; color: #c62828; }

    .fib-input {
      font-size: inherit;
      font-family: inherit;
    }

    /* Navigation buttons */
    .nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid #e0e0e0;
    }

    .nav-btn {
      padding: 0.6em 1.5em;
      background: var(--primary-color);
      color: #fff;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-size: 1em;
    }

    .nav-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .nav-btn:hover:not(:disabled) { opacity: 0.9; }

    /* Score display */
    .score-summary {
      background: #f5f5f5;
      padding: 1em;
      border-radius: var(--border-radius);
      margin-top: 1em;
      text-align: center;
    }

    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar {
        width: 100%;
        min-width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
      }
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  ${settings.show_lesson_list ? `
  <nav class="sidebar">
    <div class="sidebar-header">
      <h2>${escapeHtml(courseTitle)}</h2>
    </div>
    ${sidebarHtml}
  </nav>
  ` : ''}

  <!-- Main content area -->
  <div class="main-content">
    <div class="course-header">
      <h1>${escapeHtml(courseTitle)}</h1>
      ${courseDescription ? `<p>${escapeHtml(courseDescription)}</p>` : ''}
      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="progressBar"></div>
      </div>
    </div>

    <div id="lessonContainer">
      <div class="lesson-header">
        <h2 id="lessonTitle"></h2>
      </div>
      <div class="lesson-body" id="lessonBody"></div>
    </div>

    <div class="nav-buttons">
      <button class="nav-btn" id="btnPrev" onclick="window.__navPrev()">&#8592; Previous</button>
      <span id="pageIndicator" style="align-self:center;font-size:0.9em;color:#888"></span>
      <button class="nav-btn" id="btnNext" onclick="window.__navNext()">Next &#8594;</button>
    </div>

    ${hasAssessments ? '<div class="score-summary" id="scoreSummary" style="display:none"></div>' : ''}
  </div>

  <script>
  // ===================================================================
  // SCORM API Wrapper
  // ===================================================================
  (function() {
    var scormVersion = '${version}';
    var api = null;
    var initialized = false;

    // Find the SCORM API object in parent/opener frames
    function findAPI(win) {
      var attempts = 0;
      while (win && attempts < 500) {
        if (scormVersion === '1.2') {
          if (win.API) return win.API;
        } else {
          if (win.API_1484_11) return win.API_1484_11;
        }
        if (win.parent && win.parent !== win) {
          win = win.parent;
        } else if (win.opener) {
          win = win.opener;
        } else {
          break;
        }
        attempts++;
      }
      return null;
    }

    function getAPI() {
      if (api) return api;
      api = findAPI(window);
      if (!api && window.opener) {
        api = findAPI(window.opener);
      }
      if (!api && window.parent && window.parent !== window) {
        api = findAPI(window.parent);
      }
      return api;
    }

    // SCORM wrapper methods
    window.__scorm = {
      initialize: function() {
        var a = getAPI();
        if (!a) { console.warn('SCORM API not found. Running in standalone mode.'); return false; }
        var result;
        if (scormVersion === '1.2') {
          result = a.LMSInitialize('');
        } else {
          result = a.Initialize('');
        }
        initialized = (result === 'true' || result === true);
        return initialized;
      },

      setValue: function(element, value) {
        var a = getAPI();
        if (!a || !initialized) return false;
        if (scormVersion === '1.2') {
          return a.LMSSetValue(element, value);
        } else {
          return a.SetValue(element, value);
        }
      },

      getValue: function(element) {
        var a = getAPI();
        if (!a || !initialized) return '';
        if (scormVersion === '1.2') {
          return a.LMSGetValue(element);
        } else {
          return a.GetValue(element);
        }
      },

      commit: function() {
        var a = getAPI();
        if (!a || !initialized) return false;
        if (scormVersion === '1.2') {
          return a.LMSCommit('');
        } else {
          return a.Commit('');
        }
      },

      finish: function() {
        var a = getAPI();
        if (!a || !initialized) return false;
        var result;
        if (scormVersion === '1.2') {
          result = a.LMSFinish('');
        } else {
          result = a.Terminate('');
        }
        initialized = false;
        return result;
      },

      setStatus: function(status) {
        if (scormVersion === '1.2') {
          this.setValue('cmi.core.lesson_status', status);
        } else {
          // Map 1.2 status names to 2004 equivalents
          var completionMap = { 'completed': 'completed', 'incomplete': 'incomplete', 'not attempted': 'not attempted', 'passed': 'completed', 'failed': 'completed' };
          var successMap = { 'passed': 'passed', 'failed': 'failed', 'completed': 'unknown', 'incomplete': 'unknown', 'not attempted': 'unknown' };
          this.setValue('cmi.completion_status', completionMap[status] || 'incomplete');
          if (successMap[status] && successMap[status] !== 'unknown') {
            this.setValue('cmi.success_status', successMap[status]);
          }
        }
        this.commit();
      },

      setScore: function(raw, min, max) {
        if (scormVersion === '1.2') {
          this.setValue('cmi.core.score.raw', String(raw));
          this.setValue('cmi.core.score.min', String(min));
          this.setValue('cmi.core.score.max', String(max));
        } else {
          var scaled = max > 0 ? (raw / max) : 0;
          this.setValue('cmi.score.raw', String(raw));
          this.setValue('cmi.score.min', String(min));
          this.setValue('cmi.score.max', String(max));
          this.setValue('cmi.score.scaled', String(Math.round(scaled * 100) / 100));
        }
        this.commit();
      },

      setLocation: function(loc) {
        if (scormVersion === '1.2') {
          this.setValue('cmi.core.lesson_location', loc);
        } else {
          this.setValue('cmi.location', loc);
        }
        this.commit();
      },

      getLocation: function() {
        if (scormVersion === '1.2') {
          return this.getValue('cmi.core.lesson_location');
        } else {
          return this.getValue('cmi.location');
        }
      },

      setSuspendData: function(data) {
        if (scormVersion === '1.2') {
          this.setValue('cmi.suspend_data', data);
        } else {
          this.setValue('cmi.suspend_data', data);
        }
        this.commit();
      },

      getSuspendData: function() {
        if (scormVersion === '1.2') {
          return this.getValue('cmi.suspend_data');
        } else {
          return this.getValue('cmi.suspend_data');
        }
      }
    };
  })();

  // ===================================================================
  // Course Player Logic
  // ===================================================================
  (function() {
    // Embedded course data
    var lessonContentMap = ${lessonContentJson};
    var lessonOrder = ${lessonOrderJson};
    var totalLessons = lessonOrder.length;
    var currentIndex = 0;
    var completedLessons = {};
    var hasAssessments = ${hasAssessments ? 'true' : 'false'};
    var totalPoints = ${totalPoints};
    var earnedPoints = 0;
    var answeredBlocks = {};
    var navigationMode = '${settings.navigation}';
    var passingScore = ${settings.passing_score ?? 0};

    // Initialize SCORM on load
    window.__scorm.initialize();

    // Try to restore position from SCORM
    var savedLocation = window.__scorm.getLocation();
    if (savedLocation) {
      var idx = lessonOrder.findIndex(function(l) { return l.lessonId === savedLocation; });
      if (idx >= 0) currentIndex = idx;
    }

    // Restore completed lessons from suspend data
    var savedData = window.__scorm.getSuspendData();
    if (savedData) {
      try {
        var parsed = JSON.parse(savedData);
        if (parsed.completedLessons) completedLessons = parsed.completedLessons;
        if (typeof parsed.earnedPoints === 'number') earnedPoints = parsed.earnedPoints;
        if (parsed.answeredBlocks) answeredBlocks = parsed.answeredBlocks;
      } catch(e) { /* ignore parse errors */ }
    }

    function saveSuspendData() {
      var data = JSON.stringify({
        completedLessons: completedLessons,
        earnedPoints: earnedPoints,
        answeredBlocks: answeredBlocks
      });
      window.__scorm.setSuspendData(data);
    }

    function renderLesson(index) {
      if (index < 0 || index >= totalLessons) return;
      currentIndex = index;

      var lesson = lessonOrder[index];
      var html = lessonContentMap[lesson.lessonId] || '<p>No content available.</p>';

      document.getElementById('lessonTitle').textContent = lesson.moduleTitle + ' - ' + lesson.lessonTitle;
      document.getElementById('lessonBody').innerHTML = html;

      // Update page indicator
      document.getElementById('pageIndicator').textContent = (index + 1) + ' / ' + totalLessons;

      // Update navigation buttons
      var btnPrev = document.getElementById('btnPrev');
      var btnNext = document.getElementById('btnNext');
      btnPrev.disabled = (index === 0);

      if (index === totalLessons - 1) {
        btnNext.textContent = hasAssessments ? 'Finish' : 'Complete';
      } else {
        btnNext.innerHTML = '${dir === 'rtl' ? '&#8592; Next' : 'Next &#8594;'}';
      }

      // Sequential lock: can only navigate forward if current or previous is completed
      if (navigationMode === 'sequential' && index > 0) {
        var prevLesson = lessonOrder[index - 1];
        if (!completedLessons[prevLesson.lessonId]) {
          // Allow viewing but warn
        }
      }

      // Update sidebar active state
      var links = document.querySelectorAll('.sidebar-lesson-link');
      links.forEach(function(link) {
        link.classList.remove('active');
        var lid = link.getAttribute('data-lesson-id');
        if (lid === lesson.lessonId) link.classList.add('active');
        if (completedLessons[lid]) link.classList.add('completed');
      });

      // Save location in SCORM
      window.__scorm.setLocation(lesson.lessonId);

      // Mark lesson as completed (simple: completed when visited)
      completedLessons[lesson.lessonId] = true;
      saveSuspendData();

      updateProgress();

      // Scroll to top
      document.querySelector('.main-content').scrollTop = 0;
    }

    function updateProgress() {
      var completed = Object.keys(completedLessons).length;
      var pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
      var bar = document.getElementById('progressBar');
      if (bar) bar.style.width = pct + '%';

      // Update sidebar completion marks
      var links = document.querySelectorAll('.sidebar-lesson-link');
      links.forEach(function(link) {
        var lid = link.getAttribute('data-lesson-id');
        if (completedLessons[lid]) link.classList.add('completed');
      });

      // Check course completion
      if (completed >= totalLessons) {
        if (hasAssessments && totalPoints > 0) {
          var scorePct = Math.round((earnedPoints / totalPoints) * 100);
          window.__scorm.setScore(scorePct, 0, 100);
          if (passingScore > 0 && scorePct >= passingScore) {
            window.__scorm.setStatus('passed');
          } else if (passingScore > 0 && scorePct < passingScore) {
            window.__scorm.setStatus('failed');
          } else {
            window.__scorm.setStatus('completed');
          }
        } else {
          window.__scorm.setStatus('completed');
        }
      } else {
        window.__scorm.setStatus('incomplete');
      }
    }

    // Navigation
    window.__navPrev = function() {
      if (currentIndex > 0) renderLesson(currentIndex - 1);
    };

    window.__navNext = function() {
      if (currentIndex < totalLessons - 1) {
        renderLesson(currentIndex + 1);
      } else {
        // Last lesson -- show score if assessments exist
        if (hasAssessments && totalPoints > 0) {
          var scorePct = Math.round((earnedPoints / totalPoints) * 100);
          var summary = document.getElementById('scoreSummary');
          if (summary) {
            summary.style.display = 'block';
            summary.innerHTML = '<h3>Course Complete</h3>' +
              '<p>Your Score: <strong>' + scorePct + '%</strong> (' + earnedPoints + ' / ' + totalPoints + ' points)</p>' +
              (passingScore > 0 ? '<p>' + (scorePct >= passingScore ? 'Result: <strong style="color:#2e7d32">Passed</strong>' : 'Result: <strong style="color:#c62828">Failed</strong> (passing score: ' + passingScore + '%)') + '</p>' : '');
          }
        }
        // Set status one final time
        updateProgress();
      }
    };

    // Sidebar click handler
    document.querySelectorAll('.sidebar-lesson-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var lessonId = this.getAttribute('data-lesson-id');
        var idx = lessonOrder.findIndex(function(l) { return l.lessonId === lessonId; });
        if (idx >= 0) {
          if (navigationMode === 'sequential') {
            // Only allow navigating to completed lessons or the next one
            var prevCompleted = (idx === 0) || completedLessons[lessonOrder[idx - 1].lessonId];
            if (!prevCompleted && idx > currentIndex) return;
          }
          renderLesson(idx);
        }
      });
    });

    // ===================================================================
    // Assessment check handlers
    // ===================================================================

    // Multiple Choice
    window.__checkMC = function(event, blockId) {
      event.preventDefault();
      if (answeredBlocks[blockId]) return false;

      var container = document.querySelector('[data-block-id="' + blockId + '"]');
      var selected = container.querySelector('input[type="radio"]:checked');
      if (!selected) return false;

      var isCorrect = selected.getAttribute('data-correct') === 'true';
      var feedback = container.querySelector('.feedback');
      var explanation = container.querySelector('.explanation');
      var points = parseInt(container.getAttribute('data-points')) || 1;
      var optFeedback = selected.getAttribute('data-feedback');

      feedback.style.display = 'block';
      feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
      feedback.textContent = isCorrect ? 'Correct!' : ('Incorrect.' + (optFeedback ? ' ' + optFeedback : ''));

      if (explanation) explanation.style.display = 'block';

      if (isCorrect) earnedPoints += points;
      answeredBlocks[blockId] = true;
      saveSuspendData();
      updateProgress();

      // Disable inputs
      container.querySelectorAll('input').forEach(function(inp) { inp.disabled = true; });
      container.querySelector('.btn-check').disabled = true;

      return false;
    };

    // True/False
    window.__checkTF = function(event, blockId, correctAnswer) {
      event.preventDefault();
      if (answeredBlocks[blockId]) return false;

      var container = document.querySelector('[data-block-id="' + blockId + '"]');
      var selected = container.querySelector('input[type="radio"]:checked');
      if (!selected) return false;

      var answer = selected.value === 'true';
      var isCorrect = answer === correctAnswer;
      var feedback = container.querySelector('.feedback');
      var points = parseInt(container.getAttribute('data-points')) || 1;

      feedback.style.display = 'block';
      feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
      feedback.textContent = isCorrect ? 'Correct!' : 'Incorrect.';

      // Show the appropriate explanation
      var expTrue = container.querySelector('.explanation-true');
      var expFalse = container.querySelector('.explanation-false');
      if (answer && expTrue) expTrue.style.display = 'block';
      if (!answer && expFalse) expFalse.style.display = 'block';

      if (isCorrect) earnedPoints += points;
      answeredBlocks[blockId] = true;
      saveSuspendData();
      updateProgress();

      container.querySelectorAll('input').forEach(function(inp) { inp.disabled = true; });
      container.querySelector('.btn-check').disabled = true;

      return false;
    };

    // Multiple Response
    window.__checkMR = function(event, blockId) {
      event.preventDefault();
      if (answeredBlocks[blockId]) return false;

      var container = document.querySelector('[data-block-id="' + blockId + '"]');
      var checkboxes = container.querySelectorAll('input[type="checkbox"]');
      var scoring = container.getAttribute('data-scoring') || 'all_or_nothing';
      var points = parseInt(container.getAttribute('data-points')) || 1;
      var feedback = container.querySelector('.feedback');
      var explanation = container.querySelector('.explanation');

      var totalCorrect = 0;
      var userCorrect = 0;
      var userWrong = 0;

      checkboxes.forEach(function(cb) {
        var isOptionCorrect = cb.getAttribute('data-correct') === 'true';
        var isChecked = cb.checked;
        if (isOptionCorrect) totalCorrect++;
        if (isChecked && isOptionCorrect) userCorrect++;
        if (isChecked && !isOptionCorrect) userWrong++;
      });

      var isFullyCorrect = (userCorrect === totalCorrect && userWrong === 0);

      feedback.style.display = 'block';
      if (isFullyCorrect) {
        feedback.className = 'feedback correct';
        feedback.textContent = 'Correct!';
        earnedPoints += points;
      } else if (scoring === 'partial' && userCorrect > 0 && userWrong === 0) {
        var partial = Math.round((userCorrect / totalCorrect) * points * 100) / 100;
        feedback.className = 'feedback correct';
        feedback.textContent = 'Partially correct! (' + partial + '/' + points + ' points)';
        earnedPoints += partial;
      } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = 'Incorrect.';
      }

      if (explanation) explanation.style.display = 'block';

      answeredBlocks[blockId] = true;
      saveSuspendData();
      updateProgress();

      checkboxes.forEach(function(cb) { cb.disabled = true; });
      container.querySelector('.btn-check').disabled = true;

      return false;
    };

    // Fill in the Blank
    window.__checkFIB = function(blockId) {
      if (answeredBlocks[blockId]) return;

      var container = document.querySelector('[data-block-id="' + blockId + '"]');
      var inputs = container.querySelectorAll('.fib-input');
      var points = parseInt(container.getAttribute('data-points')) || 1;
      var feedback = container.querySelector('.feedback');
      var explanation = container.querySelector('.explanation');

      var allCorrect = true;
      var inputCount = inputs.length;
      var correctCount = 0;

      inputs.forEach(function(input) {
        var answers = JSON.parse(input.getAttribute('data-answers') || '[]');
        var caseSensitive = input.getAttribute('data-case-sensitive') === 'true';
        var userAnswer = input.value.trim();

        var isCorrect = answers.some(function(ans) {
          if (caseSensitive) return userAnswer === ans;
          return userAnswer.toLowerCase() === ans.toLowerCase();
        });

        if (isCorrect) {
          input.style.borderColor = '#4caf50';
          correctCount++;
        } else {
          input.style.borderColor = '#c62828';
          allCorrect = false;
        }
        input.disabled = true;
      });

      feedback.style.display = 'block';
      if (allCorrect) {
        feedback.className = 'feedback correct';
        feedback.textContent = 'Correct!';
        earnedPoints += points;
      } else {
        feedback.className = 'feedback incorrect';
        feedback.textContent = 'Incorrect. ' + correctCount + '/' + inputCount + ' blanks correct.';
      }

      if (explanation) explanation.style.display = 'block';

      answeredBlocks[blockId] = true;
      saveSuspendData();
      updateProgress();

      var btn = container.querySelector('.btn-check');
      if (btn) btn.disabled = true;
    };

    // Render the first lesson
    renderLesson(currentIndex);

    // Finish SCORM session on page unload
    window.addEventListener('beforeunload', function() {
      window.__scorm.finish();
    });

  })();
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// generateScormPackage -- main entry point
// ---------------------------------------------------------------------------

export async function generateScormPackage(
  options: ScormExportOptions
): Promise<ScormExportResult> {
  const zip = new JSZip();

  // 1. Generate and add imsmanifest.xml
  const manifestXml = generateManifestXml(options);
  zip.file('imsmanifest.xml', manifestXml);

  // 2. Generate and add index.html
  const playerHtml = generatePlayerHtml(options);
  zip.file('index.html', playerHtml);

  // 3. For SCORM 2004, add optional metadata.xml
  if (options.version === '2004') {
    const metadataXml = generateMetadataXml(options);
    zip.file('metadata.xml', metadataXml);
  }

  // 4. Generate the ZIP blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // 5. Count files and compute total size
  const fileCount = Object.keys(zip.files).length;

  // Build a safe filename from the course title
  const safeTitle = options.courseTitle
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 60);
  const filename = `${safeTitle}_scorm_${options.version.replace('.', '')}.zip`;

  return {
    blob,
    filename,
    fileCount,
    totalSize: blob.size,
  };
}
