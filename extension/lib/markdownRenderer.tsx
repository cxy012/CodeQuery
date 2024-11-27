import React from "react"
import ReactMarkdown from "react-markdown"

interface MarkdownRendererProps {
  markdown: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown
}) => {

  const processedContent = React.useMemo(() => {
    return markdown.split("```").map((block, index) => {
      if (index % 2 === 0) {
        // non part
        return (
          <ReactMarkdown
            key={index}
            components={{
              // inline code
              code({ children }) {
                return (
                  <code className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-250 dark:bg-gray-800 text-sm font-mono">
                    {children}
                  </code>
                )
              },
              // paragraph
              p({ children }) {
                return <p className="my-4 leading-7">{children}</p>
              },
              // title
              h1({ children }) {
                return (
                  <h1 className="mt-6 mb-4 text-3xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
                    {children}
                  </h1>
                )
              },
              h2({ children }) {
                return (
                  <h2 className="mt-5 mb-3 text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">
                    {children}
                  </h2>
                )
              },
              h3({ children }) {
                return (
                  <h3 className="mt-4 mb-3 text-xl font-bold">{children}</h3>
                )
              },
              // list
              ul({ children }) {
                return <ul className="my-4 ml-6 list-disc">{children}</ul>
              },
              ol({ children }) {
                return <ol className="my-4 ml-6 list-decimal">{children}</ol>
              },
              li({ children }) {
                return <li className="my-1">{children}</li>
              },
              // link
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    target="_blank"
                    rel="noopener noreferrer">
                    {children}
                  </a>
                )
              },
              // quote
              blockquote({ children }) {
                return (
                  <blockquote className="pl-4 my-4 border-l-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {children}
                  </blockquote>
                )
              },
              // horizontal line
              hr() {
                return (
                  <hr className="my-8 border-gray-200 dark:border-gray-700" />
                )
              },
              // table
              table({ children }) {
                return (
                  <div className="my-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {children}
                    </table>
                  </div>
                )
              },
              th({ children }) {
                return (
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    {children}
                  </th>
                )
              },
              td({ children }) {
                return (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {children}
                  </td>
                )
              }
            }}>
            {block}
          </ReactMarkdown>
        )
      } else {
        // code part
        const [lang, ...code] = block.split("\n")
        return (
          <div key={index} className="my-6">
            {/* language */}
            {lang && (
              <div className="px-4 py-2 bg-gray-250 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-mono rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700">
                {lang}
              </div>
            )}
            {/* code */}
            <pre className="p-4 bg-gray-200 dark:bg-gray-900 overflow-x-auto font-mono text-sm rounded-b-lg border border-gray-200 dark:border-gray-700">
              <code className={`language-${lang}`}>{code.join("\n")}</code>
            </pre>
          </div>
        )
      }
    })
  }, [markdown])

  return <div className="markdown-container">{processedContent}</div>
}
