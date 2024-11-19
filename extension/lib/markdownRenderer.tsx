import React from "react"
import ReactMarkdown from "react-markdown"

interface MarkdownRendererProps {
  markdown: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown
}) => {
  console.log("markdown", markdown)
  const processedContent = React.useMemo(() => {
    return markdown.split("```").map((block, index) => {
      if (index % 2 === 0) {
        // non part
        return <ReactMarkdown key={index}>{block}</ReactMarkdown>
      } else {
        // code part
        const [lang, ...code] = block.split("\n")
        return (
          <pre key={index}>
            <code className={`language-${lang}`}>{code.join("\n")}</code>
          </pre>
        )
      }
    })
  }, [markdown])

  return <div className="markdown-container">{processedContent}</div>
}
