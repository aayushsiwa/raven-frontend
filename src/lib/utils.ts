import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'No date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function normalizeBaseUrl(input: string): string {
  const raw = input.trim();
  if (!raw) {
    return 'http://127.0.0.1:8080';
  }

  return raw.replace(/\/$/, '');
}

export function toInt(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) {
    return fallback;
  }
  return n;
}

export function sanitizeHTML(input: string): string {
  if (!input) {
    return '';
  }

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = input;

  // Allowed tags and attributes
  const allowedTags = new Set([
    'p',
    'br',
    'b',
    'i',
    'strong',
    'em',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h2',
    'h3',
    'h4',
    'img',
  ]);
  const allowedAttributes = new Set([
    'href',
    'target',
    'rel',
    'src',
    'alt',
    'title',
    'loading',
  ]);

  // Recursively clean nodes
  function cleanNode(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      // If tag not allowed, remove the element (but keep its children)
      if (!allowedTags.has(elem.tagName.toLowerCase())) {
        // Replace the element with its children
        const parent = elem.parentNode;
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (elem.firstChild) {
            fragment.appendChild(elem.firstChild);
          }
          parent.replaceChild(fragment, elem);
          // Now clean the fragment (which is now in parent's place)
          cleanNode(parent);
          return;
        }
      }

      // Remove disallowed attributes
      const attrs = elem.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        if (!allowedAttributes.has(attr.name)) {
          elem.removeAttribute(attr.name);
        }
      }

      // Special handling for anchor tags: ensure target and rel for safety
      if (elem.tagName.toLowerCase() === 'a') {
        const href = elem.getAttribute('href');
        if (!href || !/^https?:\/\//i.test(href)) {
          elem.removeAttribute('href');
        } else {
          elem.setAttribute('target', '_blank');
          elem.setAttribute('rel', 'noopener');
        }
      }

      if (elem.tagName.toLowerCase() === 'img') {
        const src = elem.getAttribute('src');
        if (!src || !/^https?:\/\//i.test(src)) {
          elem.remove();
          return;
        }
        elem.setAttribute('loading', 'lazy');
      }

      // Recurse into children
      elem.childNodes.forEach(cleanNode);
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Text nodes are fine
      return;
    }
    // Other node types (comments, etc.) we ignore but could keep if needed
  }

  cleanNode(tempDiv);
  return tempDiv.innerHTML;
}

export function formatLabel(str: string): string {
  if (!str) return '';
  // Handle snake_case and kebab-case
  const result = str.replace(/[_-]/g, ' ');
  // Handle camelCase
  const final = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Capitalize words
  return final.charAt(0).toUpperCase() + final.slice(1);
}
