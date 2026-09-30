import { lazy, Suspense } from 'react';

import type { ChatSourceDto } from '@/service/api';

const AnswerMarkdown = lazy(() => import('./AnswerMarkdown'));

export type LazyAnswerMarkdownProps = {
  text: string;
  sources?: ChatSourceDto[];
  scope: string;
  onCite?: (index: number) => void;
  streaming?: boolean;
  hideImageUrls?: Set<string>;
};

export default function LazyAnswerMarkdown(props: LazyAnswerMarkdownProps) {
  return (
    <Suspense fallback={null}>
      <AnswerMarkdown {...props} />
    </Suspense>
  );
}
