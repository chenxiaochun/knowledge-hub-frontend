import styles from './AnswerMarkdown.module.scss';

export function citeAnchorId(scope: string, index: number) {
  return `chat-cite-${scope}-${index}`;
}

export function focusCite(scope: string, index: number) {
  const el = document.getElementById(citeAnchorId(scope, index));
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  el.classList.remove(styles.flash);
  void el.offsetWidth;
  el.classList.add(styles.flash);
}
