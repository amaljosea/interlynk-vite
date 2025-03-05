import { FormLabel, Link } from '@chakra-ui/react'

import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

const IdentifierLabel = ({ isOpen, onOpen, onClose, title }) => {
  const { isCustomerView } = useRouteFlags()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  const testId = title?.startsWith('Package') ? 'purl_expand' : 'cpe_expand'

  return (
    <FormLabel>
      {title}
      <Link
        data-testid={testId}
        hidden={isCustomerView}
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
