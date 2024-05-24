import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const RegexHighlighter = ({ children }) => {
  return (
    <SyntaxHighlighter style={coy} language='regex'>
      {children}
    </SyntaxHighlighter>
  )
}
