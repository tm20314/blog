# Design — つもログ

トップページ、記事、アーカイブ、プロフィールで共有するデザインシステム。ページごとにテーマを作り直さず、必要な役割をこのファイルと `tokens.css` に追加する。

## Genre

Editorial。ガジェットを実際に使った記録と、個人開発の過程を読むための技術系個人メディア。

## Macrostructure family

- Marketing pages: Photographic。既存写真を大きく見せ、短い注釈と編集的な記事面を続ける。
- App pages: Workbench。将来のアプリ詳細では、実物の画面と制作背景を主役にする。
- Content pages: Long Document。記事本文は60–65chの一列を基本にし、アーカイブは同じ組版による索引変形、Aboutはプロフィール変形とする。

## Theme

- `--color-paper` oklch(0.972 0.006 112)
- `--color-paper-2` oklch(0.936 0.009 112)
- `--color-paper-3` oklch(0.886 0.012 112)
- `--color-ink` oklch(0.19 0.014 124)
- `--color-ink-2` oklch(0.29 0.014 124)
- `--color-muted` oklch(0.48 0.012 124)
- `--color-rule` oklch(0.79 0.012 116)
- `--color-accent` oklch(0.89 0.228 126)
- `--color-accent-ink` oklch(0.18 0.028 126)
- `--color-focus` oklch(0.52 0.152 132)

Accent is a signal, not a surface. Lime stays below roughly 5% of each viewport.

## Typography

- Display: Bricolage Grotesque Variable, weight 800, roman.
- Body: Noto Sans JP Variable, weight 400–500.
- Mono: JetBrains Mono Variable, code and compact technical labels only.
- Display tracking: unchanged; no custom letter spacing.
- Type scale anchor: `--text-display: clamp(2.75rem, 5vw + 1rem, 5.25rem)`.
- Reading measure: 60–65ch, with body line-height at least 1.7.

## Spacing

4-point named scale. Pages use the values in `tokens.css`; layout spacing is never improvised inline.

## Motion

- Page and section reveals: none.
- Focus rings: instant.
- Reduced-motion fallback remains present even though the editorial surface is static.

## Microinteractions stance

- Successful copy actions change the control label; no celebratory toast.
- Links use underline weight or colour as the single hover signal.
- Keyboard focus always has an immediate, visible ring.
- Touch targets are at least 44 × 44 CSS pixels.

## CTA voice

- Primary CTA: square-corner lime fill, dark ink, short verb-led Japanese label.
- Secondary CTA: typographic link with underline and one arrow.
- Labels stay on one line at every supported width.

## Per-page allowances

- Marketing pages may use existing photography as the dominant visual.
- App pages may use real product screenshots without re-drawn device or browser chrome.
- Content pages are typography-first. Existing article cover images may appear inline; no decorative stock imagery.

## What pages MUST share

- The `つ` symbol and `つもログ` wordmark.
- N9 edge-aligned header and Ft5 statement footer.
- Paper, ink, and lime token palette.
- Bricolage Grotesque display face and Noto Sans JP body face.
- Rectangular CTA shape, focus ring, underline language, and 4-point spacing rhythm.
- Large left-aligned page title followed by concise supporting copy.

## What pages MAY differ on

- Top page uses a photographic fold; content pages use a narrow reading measure.
- Article pages may include a sticky table of contents on wide screens.
- Archive pages may use denser ruled rows and tabular dates.
- About may use the existing portrait as its only enrichment.

## Exports

`tokens.css` is the active source of truth. The remaining blocks are portable mappings for future use; the current project remains on Tailwind CSS 3.

### tokens.css

```css
:root {
  --color-paper: oklch(0.972 0.006 112);
  --color-paper-2: oklch(0.936 0.009 112);
  --color-paper-3: oklch(0.886 0.012 112);
  --color-ink: oklch(0.19 0.014 124);
  --color-ink-2: oklch(0.29 0.014 124);
  --color-muted: oklch(0.48 0.012 124);
  --color-rule: oklch(0.79 0.012 116);
  --color-rule-dark: oklch(0.41 0.014 124);
  --color-accent: oklch(0.89 0.228 126);
  --color-accent-ink: oklch(0.18 0.028 126);
  --color-focus: oklch(0.52 0.152 132);

  --font-display: "Bricolage Grotesque Variable", "Noto Sans JP Variable", sans-serif;
  --font-body: "Noto Sans JP Variable", "IBM Plex Sans Variable", sans-serif;
  --font-mono: "JetBrains Mono Variable", monospace;

  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 9rem;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;
  --text-3xl: 3.0518rem;
  --text-4xl: 3.8147rem;
  --text-display: clamp(2.75rem, 5vw + 1rem, 5.25rem);

  --rule-hair: 0.0625rem;
  --rule-strong: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-frame: 2rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 180ms;
  --dur-long: 420ms;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(0.972 0.006 112);
  --color-paper-2: oklch(0.936 0.009 112);
  --color-paper-3: oklch(0.886 0.012 112);
  --color-ink: oklch(0.19 0.014 124);
  --color-ink-2: oklch(0.29 0.014 124);
  --color-muted: oklch(0.48 0.012 124);
  --color-rule: oklch(0.79 0.012 116);
  --color-accent: oklch(0.89 0.228 126);
  --color-focus: oklch(0.52 0.152 132);

  --font-display: "Bricolage Grotesque Variable", "Noto Sans JP Variable", sans-serif;
  --font-body: "Noto Sans JP Variable", "IBM Plex Sans Variable", sans-serif;
  --font-mono: "JetBrains Mono Variable", monospace;

  --spacing-2xs: 0.25rem;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;
  --spacing-4xl: 9rem;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;

  --radius-sm: 0.25rem;
  --radius-frame: 2rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(0.972 0.006 112)", "$type": "color" },
    "paper-2": { "$value": "oklch(0.936 0.009 112)", "$type": "color" },
    "paper-3": { "$value": "oklch(0.886 0.012 112)", "$type": "color" },
    "ink": { "$value": "oklch(0.19 0.014 124)", "$type": "color" },
    "ink-2": { "$value": "oklch(0.29 0.014 124)", "$type": "color" },
    "muted": { "$value": "oklch(0.48 0.012 124)", "$type": "color" },
    "rule": { "$value": "oklch(0.79 0.012 116)", "$type": "color" },
    "accent": { "$value": "oklch(0.89 0.228 126)", "$type": "color" },
    "accent-ink": { "$value": "oklch(0.18 0.028 126)", "$type": "color" },
    "focus": { "$value": "oklch(0.52 0.152 132)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Bricolage Grotesque Variable, Noto Sans JP Variable, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Noto Sans JP Variable, IBM Plex Sans Variable, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "JetBrains Mono Variable, monospace", "$type": "fontFamily" }
  },
  "space": {
    "2xs": { "$value": "0.25rem", "$type": "dimension" },
    "xs": { "$value": "0.5rem", "$type": "dimension" },
    "sm": { "$value": "0.75rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" },
    "2xl": { "$value": "4rem", "$type": "dimension" },
    "3xl": { "$value": "6rem", "$type": "dimension" },
    "4xl": { "$value": "9rem", "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "180ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 0.972 0.006 112;
  --foreground: 0.19 0.014 124;
  --card: 0.936 0.009 112;
  --card-foreground: 0.19 0.014 124;
  --popover: 0.936 0.009 112;
  --popover-foreground: 0.19 0.014 124;
  --primary: 0.89 0.228 126;
  --primary-foreground: 0.18 0.028 126;
  --secondary: 0.886 0.012 112;
  --secondary-foreground: 0.29 0.014 124;
  --muted: 0.79 0.012 116;
  --muted-foreground: 0.48 0.012 124;
  --accent: 0.89 0.228 126;
  --accent-foreground: 0.18 0.028 126;
  --border: 0.79 0.012 116;
  --input: 0.79 0.012 116;
  --ring: 0.52 0.152 132;
  --radius: 0.25rem;
}
```
