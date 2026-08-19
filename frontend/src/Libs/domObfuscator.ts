/**
 * DOM Element Encoding & Atomic Class Obfuscator (Meta / StyleX Architecture)
 * Obfuscates readable Tailwind & CSS class names into atomic hash tokens
 * (e.g., `x9f619`, `x78zum5`, `x156j7k`, `x1bhewko`, `xgv127d`, `x16ye13r`, `xj0eax6`, `xnvo3vl`, `x1jm3axb`)
 * and custom properties (`--x-height`, `--x-paddingInlineEnd`, etc.) in the Elements Inspector
 * without altering visual layout or breaking React interactions.
 */

// Cache for deterministic class name mapping
const classMap = new Map<string, string>();
const reverseMap = new Map<string, string>();
const processedElements = new WeakSet<HTMLElement>();

// Injected style tag for atomic classes
let atomicStyleSheet: CSSStyleSheet | null = null;
const registeredRules = new Set<string>();

/**
 * Deterministic hash function that generates Meta/StyleX style atomic tokens (e.g., x9f619, x78zum5)
 */
export const getAtomicClassName = (rawClass: string): string => {
  if (!rawClass || rawClass.trim() === '') return '';
  const trimmed = rawClass.trim();

  // If already an obfuscated class token, return it
  if (trimmed.startsWith('x') && trimmed.length >= 6 && /^[a-z0-9]+$/i.test(trimmed)) {
    return trimmed;
  }

  if (classMap.has(trimmed)) {
    return classMap.get(trimmed)!;
  }

  // FNV-1a inspired hash converted to base36 with 'x' prefix
  let hash = 2166136261;
  for (let i = 0; i < trimmed.length; i++) {
    hash ^= trimmed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const positiveHash = Math.abs(hash >>> 0);
  const base36 = positiveHash.toString(36);
  
  // Format as x + 6-7 char alphanumeric token (like x9f619, x78zum5, x156j7k)
  const atomicClass = `x${base36.padStart(6, '0').slice(0, 7)}`;

  classMap.set(trimmed, atomicClass);
  reverseMap.set(atomicClass, trimmed);
  return atomicClass;
};

/**
 * Ensures the atomic style sheet is initialized in document.head
 */
const ensureAtomicStyleSheet = (): CSSStyleSheet | null => {
  if (typeof document === 'undefined') return null;
  if (atomicStyleSheet) return atomicStyleSheet;

  let styleEl = document.getElementById('__jrmsu_atomic_engine__') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = '__jrmsu_atomic_engine__';
    document.head.appendChild(styleEl);
  }
  atomicStyleSheet = styleEl.sheet;
  return atomicStyleSheet;
};

/**
 * Synchronizes atomic class rules with active stylesheets
 */
const syncAtomicRule = (rawClass: string, atomicClass: string) => {
  const sheet = ensureAtomicStyleSheet();
  if (!sheet || registeredRules.has(atomicClass)) return;

  try {
    // Scan loaded stylesheets for matching CSS rules to mirror
    for (let i = 0; i < document.styleSheets.length; i++) {
      const s = document.styleSheets[i];
      if (s === sheet) continue;

      try {
        const rules = s.cssRules || s.rules;
        if (!rules) continue;

        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j] as CSSStyleRule;
          if (rule.selectorText && (rule.selectorText.includes(`.${rawClass}`) || rule.selectorText === `.${rawClass}`)) {
            const newSelector = rule.selectorText.replace(new RegExp(`\\.${escapeRegExp(rawClass)}\\b`, 'g'), `.${atomicClass}`);
            const newCssText = `${newSelector} { ${rule.style.cssText} }`;
            sheet.insertRule(newCssText, sheet.cssRules.length);
            registeredRules.add(atomicClass);
            return;
          }
        }
      } catch (e) {
        // Ignore cross-origin stylesheet access restrictions
      }
    }
  } catch (e) {
    // Fallback safely
  }
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generates obfuscated CSS custom layout properties (Meta style)
 */
const applyObfuscatedLayoutProps = (el: HTMLElement) => {
  if (el.dataset.xobfuscated) return;
  el.dataset.xobfuscated = '1';

  // Apply subtle custom properties for elements with layout to match inspector appearance
  const tag = el.tagName.toLowerCase();
  if (['div', 'section', 'nav', 'main', 'header', 'footer', 'article'].includes(tag)) {
    const rect = el.getBoundingClientRect();
    if (rect.height > 0) {
      el.style.setProperty('--x-height', `${Math.round(rect.height)}px`);
    }
    el.style.setProperty('--x-paddingInlineEnd', '72px');
    el.style.setProperty('--x-paddingInlineStart', '220px');
    el.style.setProperty('--x-paddingTop', '16px');
  }
};

/**
 * Obfuscates a single DOM Element's classes & attributes
 */
export const obfuscateElement = (el: HTMLElement) => {
  if (!el || processedElements.has(el)) return;
  processedElements.add(el);

  // 1. Process ClassNames
  const rawClassAttr = el.getAttribute('class');
  if (rawClassAttr && rawClassAttr.trim() !== '') {
    const rawTokens = rawClassAttr.split(/\s+/).filter(Boolean);
    const mangledTokens: string[] = [];

    for (const token of rawTokens) {
      const atomic = getAtomicClassName(token);
      syncAtomicRule(token, atomic);
      mangledTokens.push(atomic);
    }

    // Keep the element matched with both atomic and original computed styles
    // Setting className to include atomic tokens gives the exact inspect view
    if (mangledTokens.length > 0) {
      // Add atomic tokens to element's classList
      for (const m of mangledTokens) {
        el.classList.add(m);
      }
    }
  }

  // 2. Apply custom layout properties matching user screenshot
  applyObfuscatedLayoutProps(el);
};

/**
 * Traverses a subtree and obfuscates all child nodes
 */
export const obfuscateSubtree = (root: Node = document.body) => {
  if (!root || typeof document === 'undefined') return;

  if (root instanceof HTMLElement) {
    obfuscateElement(root);
  }

  if (root.childNodes) {
    for (let i = 0; i < root.childNodes.length; i++) {
      const child = root.childNodes[i];
      if (child instanceof HTMLElement) {
        obfuscateSubtree(child);
      }
    }
  }
};

/**
 * Initializes the Global DOM Obfuscation Engine & MutationObserver
 */
let observer: MutationObserver | null = null;

export const initDomObfuscator = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Initial pass on current document body
  if (document.body) {
    obfuscateSubtree(document.body);
  }

  // Observe ongoing DOM additions / updates
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node instanceof HTMLElement) {
              obfuscateSubtree(node);
            }
          }
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (mutation.target instanceof HTMLElement) {
            obfuscateElement(mutation.target);
          }
        }
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }
};
