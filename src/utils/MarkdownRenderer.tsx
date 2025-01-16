import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import 'katex/dist/katex.min.css'


interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2 text-gray-800" {...props} />,
          
          // Enhanced code block styling
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return (
              <code 
                className={`${!match
                  ? 'bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm' 
                  : 'block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto'
                }`} 
                {...props}
              >
                {children}
              </code>
            )
          },
          
          // Enhanced list styling
          ul: ({ node, ...props }) => <ul className="list-disc ml-6 my-3 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-6 my-3 space-y-1" {...props} />,
          
          // Enhanced paragraph spacing with more margin
          p: ({ node, ...props }) => (
            <p className="my-4 leading-relaxed whitespace-pre-line" {...props} />
          ),
          
          // Enhanced blockquote styling
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic text-gray-700 dark:text-gray-300" {...props} />
          ),
          
          // Style strong/bold text
          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer;