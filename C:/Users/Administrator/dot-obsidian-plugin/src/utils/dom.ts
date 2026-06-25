export function animateElement(
  el: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): Animation {
  return el.animate(keyframes, options);
}

export function bounceAnimation(el: HTMLElement): void {
  animateElement(
    el,
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.92)', offset: 0.3 },
      { transform: 'scale(1.05)', offset: 0.6 },
      { transform: 'scale(1)' },
    ],
    { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
  );
}

export function fadeInAnimation(el: HTMLElement, duration = 200): void {
  animateElement(el, [{ opacity: '0' }, { opacity: '1' }], {
    duration,
    easing: 'ease-out',
    fill: 'forwards',
  });
}

export function slideUpAnimation(el: HTMLElement, duration = 300): void {
  animateElement(
    el,
    [
      { transform: 'translateY(20px)', opacity: '0' },
      { transform: 'translateY(0)', opacity: '1' },
    ],
    { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
  );
}

export function createDiv(className?: string): HTMLDivElement {
  const el = document.createElement('div');
  if (className) el.className = className;
  return el;
}

export function createSpan(className?: string, text?: string): HTMLSpanElement {
  const el = document.createElement('span');
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
