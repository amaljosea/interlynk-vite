import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  Box,
  Code,
  Divider,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList
} from '@chakra-ui/react'

import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

export const MarkdownPreview = ({ expandView = false, content }) => {
  const { isCustomerView } = useRouteFlags()
  const { grayBorderColor, primaryTextColor, primaryBlueText } = useThemeColor([
    'grayBorderColor',
    'primaryTextColor',
    'primaryBlueText'
  ])
  return (
    <Box
      p={4}
      rounded={'md'}
      minH={'auto'}
      maxH={'300px'}
      overflow={'hidden'}
      overflowY={'scroll'}
      w={expandView && !isCustomerView ? '40vw' : '100%'}
      border={`1px solid ${grayBorderColor}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <Text fontWeight={'semibold'} size='lg' my={4} {...props} />
          ),
          h2: (props) => (
            <Text fontWeight={'semibold'} size='lg' my={3} {...props} />
          ),
          h3: (props) => (
            <Text fontWeight={'semibold'} size='lg' my={2.5} {...props} />
          ),
          h4: (props) => (
            <Text fontWeight={'semibold'} size='lg' my={2} {...props} />
          ),
          h5: (props) => (
            <Text fontWeight={'semibold'} size='md' my={1.5} {...props} />
          ),
          h6: (props) => (
            <Text fontWeight={'semibold'} size='md' my={1} {...props} />
          ),
          p: (props) => (
            <Text fontSize={'sm'} mb={2} color={primaryTextColor} {...props} />
          ),
          strong: (props) => (
            <Text as='strong' fontWeight='medium' {...props} />
          ),
          code: ({ children }) => (
            <Code
              p={3}
              my={3}
              w={'full'}
              whiteSpace='pre'
              overflow={'hidden'}
              overflowX={'scroll'}
            >
              {children}
            </Code>
          ),
          a: (props) => <Link color={primaryBlueText} isExternal {...props} />,
          ul: (props) => <UnorderedList fontSize={'sm'} pl={4} {...props} />,
          ol: (props) => (
            <OrderedList fontSize={'sm'} pl={4} mb={1} {...props} />
          ),
          li: (props) => <ListItem fontSize={'sm'} mb={1} {...props} />,
          hr: () => <Divider my={6} />
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
