import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkToc from 'remark-toc'

export function markdownToHtml(markdown: string): string {
  const result = remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkHtml) // serializes through remark-rehype and rehype-stringify
    .processSync(markdown)

  return result.toString()
}

export function markdownToHtmlWithToc(markdown: string): string {
  const result = remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkToc)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .processSync(markdown)

  return result.toString()
}
