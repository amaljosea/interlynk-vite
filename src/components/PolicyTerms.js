import { Link } from 'react-router-dom'

import { Stack, Text, chakra } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const PolicyTerms = () => {
  const { sameSecondaryText, primaryBlueText } = useThemeColor([
    'sameSecondaryText',
    'primaryBlueText'
  ])
  return (
    <Stack pb={10}>
      <Text fontSize={'xs'} color={sameSecondaryText} textAlign={'center'}>
        By logging in, you acknowledge that you have read and agree to the
        <chakra.span color={primaryBlueText}>
          {' '}
          <Link target='_blank' to={'https://www.interlynk.io/privacy'}>
            Privary Policy
          </Link>
        </chakra.span>{' '}
        and{' '}
        <chakra.span color={primaryBlueText}>
          <Link target='_blank' to={'https://www.interlynk.io/terms'}>
            Terms of Service
          </Link>
        </chakra.span>
      </Text>
    </Stack>
  )
}

export default PolicyTerms
