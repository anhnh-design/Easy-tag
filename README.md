# Easy Tag

A Figma plugin that auto-generates searchable description tags for icon components, so designers can find icons in the asset panel by related keywords — not just the exact component name.

## How it works

1. Select one or more icon **master components** in Figma (component sets and frames containing components work too — they're searched recursively).
2. Pick a **Description language** (English or Tiếng Việt).
3. Run **Easy Tag** and click **Generate descriptions**.
4. Each component's description is filled with up to **5 tags** with meanings similar to the icon's name, in the chosen language, separated by `, `.

Example: a component named `icon/arrow-left` gets `back, previous, return, west, before` in English, or `quay lại, trước, lùi, mũi tên, hướng` in Vietnamese.

Tags come from a built-in dictionary (~400 common icon terms and compounds) that runs fully offline, with a curated set for **each** language. The Vietnamese entries are product/UI-context translations of each icon *concept* — e.g. `cart` → `giỏ hàng` (shopping cart), not a literal `xe bò`. Name prefixes (`icon/`, `ic_`), sizes (`24px`), and style words (`filled`, `outline`, …) are ignored, and camelCase / kebab-case / snake_case names are all handled.

**Input names can be English or Vietnamese**, and are matched independently of the output language. A component named `giỏ hàng` (or the diacritic-free `gio-hang`) resolves to the *cart* concept, so it can produce `shopping, basket, buy…` in English or `mua hàng, thanh toán…` in Vietnamese. Vietnamese names are matched diacritic-aware (so `giỏ` "basket" and `giờ` "hour" don't collide), falling back to a diacritic-folded match for names typed without accents.

When an icon name isn't in the dictionary at all (e.g. `ic_speedometer`, `calculator`, `khuyến mãi`), Easy Tag looks it up online — **English names** via the free [Datamuse](https://www.datamuse.com/api/) "means-like" API, **Vietnamese names** via the free [dict.minhqnd.com](https://dict.minhqnd.com/) dictionary (whole-phrase lookup: synonyms for Vietnamese output, translations for English output). Neither needs an API key or signup. This is controlled by the **Look up names not in the dictionary online** checkbox (on by default); uncheck it to stay 100% offline. Rows filled this way are marked `online` in the results. If the request fails, the plugin quietly falls back to dictionary-only.

By default, components that already have a description are skipped; check **Overwrite existing descriptions** to replace them.

To wipe descriptions instead, select the components and click **Clear descriptions** — it empties the description of every selected component (components already empty are reported as such).

> Network note: the manifest allows exactly two domains, `https://api.datamuse.com` and `https://dict.minhqnd.com`. Nothing else is contacted, and no component data leaves Figma — only the cleaned icon name words are sent as a query.

## Development

```bash
npm install
npm run build   # compiles code.ts → code.js
npm run watch   # recompile on change
npm run lint
```

Then in Figma: **Plugins → Development → Import plugin from manifest…** and pick `manifest.json`.

## Customizing

- `MAX_TAGS` / `VI_MAX_TAGS` and `TAG_SEPARATOR` at the top of `code.ts` control tag count and separator.
- Add your own vocabulary to `SYNONYMS` / `VI_SYNONYMS` (single words) or `COMPOUNDS` / `VI_COMPOUNDS` (whole names like `arrow-left`) in `code.ts`. Keep the English and Vietnamese maps keyed by the same English icon words.
- Vietnamese *input* names resolve through `resolveConcepts` (in `code.ts`), which maps a name to an English concept key via the `VI_EXACT` / `VI_FOLD` reverse indexes built from the Vietnamese dictionaries. Adding a Vietnamese term to `VI_SYNONYMS` automatically makes it recognizable as an input name too.
- The online fallbacks live in `fetchOnlineTags` (English/Datamuse), `fetchVietnameseTags` (English word → Vietnamese, dict.minhqnd.com), and `fetchVietnameseNameTags` (whole Vietnamese phrase, dict.minhqnd.com) in `code.ts`. To use a different source, swap the endpoint there and update `allowedDomains` in `manifest.json`.
- To add another language, add a `<option>` to the `#lang` select in `ui.html`, a curated map + online fetch in `code.ts`, and branch on it in `generateTags` and the `generate` handler.
