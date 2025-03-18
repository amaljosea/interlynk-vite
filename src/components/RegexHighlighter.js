import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy, duotoneSea } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { useColorMode } from '@chakra-ui/react'

export const RegexHighlighter = ({ children }) => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  return (
    <SyntaxHighlighter style={isDark ? duotoneSea : coy} language='regex'>
      {children}
    </SyntaxHighlighter>
  )
}
