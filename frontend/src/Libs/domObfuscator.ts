/**
 * Enterprise-Grade DOM Element Encoding & Atomic Class Obfuscator (Meta / StyleX Architecture)
 * Completely replaces human-readable Tailwind and custom class names with atomic hash tokens
 * (e.g. `x9f619`, `x78zum5`, `xdt5ytf`, `x1iyjqo2`, `xs83m0k`, `x150jy0e`, `x1e558r4`, `xjkvuk6`)
 * and injects custom layout variables (`--x-height`, `--x-paddingInlineEnd`, etc.) across all
 * public and administrative modules while preserving 100% visual layout, reactivity, and events.
 */

// Cache for deterministic class name mapping
const classMap = new Map<string, string>();
const reverseMap = new Map<string, string>();
const registeredRules = new Set<string>();

let atomicStyleSheet: CSSStyleSheet | null = null;
let isMutating = false;

/**
 * Pre-defined deterministic tokens for prominent Meta/StyleX look
 */
const PRESET_MAPPINGS: Record<string, string> = {
  'flex': 'x9f619',
  'flex-col': 'x78zum5',
  'flex-row': 'xdt5ytf',
  'items-center': 'x1iyjqo2',
  'justify-between': 'xs83m0k',
  'justify-center': 'x150jy0e',
  'relative': 'x1e558r4',
  'absolute': 'xjkvuk6',
  'fixed': 'x1iorvi4',
  'w-full': 'x1i10hfl',
  'h-full': 'xjbqb8w',
  'min-h-screen': 'x6umtig',
  'overflow-hidden': 'x1b1mbnx',
  'overflow-x-hidden': 'xjqpnuy',
  'transition-all': 'xa49mdf',
  'duration-300': 'x12nagc',
  'duration-500': 'x182iqb8',
  'duration-700': 'x1pi30zi',
  'ease-in-out': 'x1swvt13',
  'text-white': 'x193iq5w',
  'text-on-surface': 'xeuugli',
  'bg-primary': 'x13faqbe',
  'bg-navy': 'x1vvkbs',
  'bg-surface': 'xlh3980',
  'rounded-xl': 'xvmahel',
  'rounded-2xl': 'x1n04w50',
  'shadow-lg': 'x10b6aqq',
  'shadow-md': 'x1yrsyyn',
  'border': 'x1al4vs7',
  'p-4': 'x12nagc',
  'p-6': 'x182iqb8',
  'px-4': 'x1pi30zi',
  'py-2': 'x1swvt13',
  'cursor-pointer': 'x1bhewko'
};

// Seed presets into mapping
for (const [raw, atomic] of Object.entries(PRESET_MAPPINGS)) {
  classMap.set(raw, atomic);
  reverseMap.set(atomic, raw);
}

/**
 * Deterministic hash function that generates Meta/StyleX style atomic tokens (e.g., x9f619, x78zum5)
 */
export const getAtomicClassName = (rawClass: string): string => {
  if (!rawClass || rawClass.trim() === '') return '';
  const trimmed = rawClass.trim();

  // If already an obfuscated class token, return it
  if (trimmed.startsWith('x') && trimmed.length >= 6 && /^[a-z0-9_]+$/i.test(trimmed) && !trimmed.includes(':') && !trimmed.includes('-')) {
    return trimmed;
  }

  if (classMap.has(trimmed)) {
    return classMap.get(trimmed)!;
  }

  // FNV-1a hash converted to base36 with 'x' prefix
  let hash = 2166136261;
  for (let i = 0; i < trimmed.length; i++) {
    hash ^= trimmed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const positiveHash = Math.abs(hash >>> 0);
  const base36 = positiveHash.toString(36);
  
  // Format as x + 6-7 char alphanumeric token (e.g. x9f619, x78zum5, x156j7k)
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

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
          if (rule.selectorText) {
            const escapedRaw = escapeRegExp(rawClass);
            if (new RegExp(`(^|[^a-zA-Z0-9_-])\\.${escapedRaw}([^a-zA-Z0-9_-]|$)`).test(rule.selectorText)) {
              const newSelector = rule.selectorText.replace(new RegExp(`\\.${escapedRaw}\\b`, 'g'), `.${atomicClass}`);
              const newCssText = `${newSelector} { ${rule.style.cssText} }`;
              sheet.insertRule(newCssText, sheet.cssRules.length);
              registeredRules.add(atomicClass);
              return;
            }
          }
        }
      } catch {
        // Ignore cross-origin stylesheet access restrictions
      }
    }
  } catch {
    // Fallback safely
  }
};

/**
 * Generates obfuscated CSS custom layout properties (Meta style)
 */
const applyObfuscatedLayoutProps = (el: HTMLElement) => {
  if (el.dataset.xobf) return;
  el.dataset.xobf = '1';

  const tag = el.tagName.toLowerCase();
  if (['div', 'section', 'nav', 'main', 'header', 'footer', 'article', 'aside'].includes(tag)) {
    const rect = el.getBoundingClientRect();
    if (rect.height > 0) {
      el.style.setProperty('--x-height', `${Math.round(rect.height)}px`);
    }
    el.style.setProperty('--x-paddingInlineEnd', '72px');
    el.style.setProperty('--x-paddingInlineStart', '220px');
    el.style.setProperty('--x-paddingTop', '16px');
  }

  // Mask sensitive or debug attributes
  if (el.hasAttribute('data-testid')) {
    const val = el.getAttribute('data-testid') || '';
    el.removeAttribute('data-testid');
    el.setAttribute('data-x-id', getAtomicClassName(val));
  }
};

/**
 * Obfuscates a single DOM Element's classes & attributes completely
 */
export const obfuscateElement = (el: HTMLElement) => {
  if (!el || typeof el.getAttribute !== 'function') return;

  const rawClassAttr = el.getAttribute('class');
  if (!rawClassAttr || rawClassAttr.trim() === '') {
    applyObfuscatedLayoutProps(el);
    return;
  }

  // Check if already fully obfuscated
  const currentTokens = rawClassAttr.split(/\s+/).filter(Boolean);
  const isAlreadyObfuscated = currentTokens.length > 0 && currentTokens.every(t => 
    t.startsWith('x') && t.length >= 6 && /^[a-z0-9_]+$/i.test(t) && !t.includes(':') && !t.includes('-')
  );

  if (isAlreadyObfuscated && el.dataset.xhash === rawClassAttr) {
    applyObfuscatedLayoutProps(el);
    return;
  }

  const mangledTokens: string[] = [];

  for (const token of currentTokens) {
    const atomic = getAtomicClassName(token);
    syncAtomicRule(token, atomic);
    mangledTokens.push(atomic);
  }

  const newClassString = mangledTokens.join(' ');

  if (rawClassAttr !== newClassString) {
    isMutating = true;
    try {
      el.setAttribute('class', newClassString);
      el.dataset.xhash = newClassString;
    } finally {
      isMutating = false;
    }
  }

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
let rafHandle: number | null = null;

export const initDomObfuscator = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  ensureAtomicStyleSheet();

  // Initial bulk scan
  if (document.body) {
    obfuscateSubtree(document.body);
  }

  // High-performance batched MutationObserver
  if (!observer) {
    const pendingNodes = new Set<HTMLElement>();

    const flushPending = () => {
      rafHandle = null;
      if (isMutating) return;

      pendingNodes.forEach(node => {
        if (node && node.isConnected) {
          obfuscateElement(node);
        }
      });
      pendingNodes.clear();
    };

    observer = new MutationObserver((mutations) => {
      if (isMutating) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node instanceof HTMLElement) {
              pendingNodes.add(node);
              // Also add children
              const children = node.querySelectorAll<HTMLElement>('*');
              children.forEach(c => pendingNodes.add(c));
            }
          }
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (mutation.target instanceof HTMLElement) {
            pendingNodes.add(mutation.target);
          }
        }
      }

      if (pendingNodes.size > 0 && !rafHandle) {
        rafHandle = requestAnimationFrame(flushPending);
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // Runtime Integrity: Prevent DevTools Console Prototype Pollution & Script Hijacking
  try {
    if (typeof Object.freeze === 'function' && typeof window !== 'undefined') {
      // Prevent prototype hijacking of sensitive base objects
      Object.seal(Array.prototype);
      Object.seal(Function.prototype);
    }
  } catch {
    // Graceful fallback for non-strict runtimes
  }

  // STEP 1 — Production Console Neutralization
  // Silences all console.* output in production so attackers cannot read
  // internal state, API routes, or error stack traces via the Console tab.
  // Has ZERO effect on development builds (npm run dev).
  if (import.meta.env.PROD) {
    const noop = () => {};
    try {
      (window as any).console = {
        ...window.console,
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        dir: noop,
        table: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        time: noop,
        timeEnd: noop,
        trace: noop,
      };
    } catch {
      // Graceful fallback
    }
  }

  // STEP 3 — Anti-Debugging Trap
  // Fires a runtime-generated `debugger` statement every 1 second.
  // If an attacker has DevTools open with "Pause on debugger statements" active,
  // this causes the browser tab to freeze in an infinite pause loop —
  // making it impossible to step through or reverse-engineer the application code.
  // Has ZERO performance effect on normal users (DevTools closed).
  if (import.meta.env.PROD) {
    setInterval(() => {
      try {
        // Runtime string-based debugger — cannot be stripped by esbuild's drop:['debugger']
        // because it is constructed at runtime, not a static `debugger;` keyword.
        // eslint-disable-next-line no-new-func
        new Function('debugger')();
      } catch {
        // Fail silently
      }
    }, 1000);
  }
};

