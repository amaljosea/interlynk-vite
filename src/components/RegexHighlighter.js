import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const RegexHighlighter = ({ children }) => {
  return (
    <SyntaxHighlighter style={vscDarkPlus} language='regex'>
      {children}
    </SyntaxHighlighter>
  )
}
