import { isCustomerView } from 'utils'

import { FormLabel, Link } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const IdentifierLabel = ({ isOpen, onOpen, onClose, title }) => {
  const { customerView } = isCustomerView()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const testId = title?.startsWith('Package') ? 'purl_expand' : 'cpe_expand'

  return (
    <FormLabel>
      {title}
      <Link
        data-testid={testId}
        hidden={customerView}
        color={primaryBlueText}
        onClick={isOpen ? onClose : onOpen}
        _hover={{ textDecoration: 'underline' }}
        sx={{ mx: 2, fontSize: '11px', fontWeight: 'medium' }}
      >
        {isOpen ? '(Collapse)' : '(Expand)'}
      </Link>
    </FormLabel>
  )
}

export default IdentifierLabel
