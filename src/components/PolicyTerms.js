import { Link } from 'react-router-dom'

import { Stack, Text, chakra } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const PolicyTerms = () => {
  const { sameSecondaryText, primaryBlueText } = useThemeColor([
    'sameSecondaryText',
    'primaryBlueText'
  ])

  return (
    <Stack>
      <Text fontSize='xs' color={sameSecondaryText} textAlign='center'>
        By logging in, you acknowledge that you have read and agree to the{' '}
        <chakra.span color={primaryBlueText}>
          <Link
            to='https://www.interlynk.io/privacy'
            target='_blank'
            rel='noopener noreferrer'
          >
            Privacy Policy
          </Link>
        </chakra.span>{' '}
        and{' '}
        <chakra.span color={primaryBlueText}>
          <Link
            to='https://www.interlynk.io/terms'
            target='_blank'
            rel='noopener noreferrer'
          >
            Terms of Service
          </Link>
        </chakra.span>
        .
      </Text>
    </Stack>
  )
}

export default PolicyTerms
