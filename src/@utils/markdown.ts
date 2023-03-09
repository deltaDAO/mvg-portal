import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export function markdownToHtml(markdown: string): string {
  const result = remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkHtml) // serializes through remark-rehype and rehype-stringify
    .processSync(markdown)

  return result.toString()
}
