import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Icon, Link } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ExternalNavIcon = ({
  href,
  icon = ExternalLinkIcon,
  onClick,
  styles = {},
  color,
  target = '_blank',
  ...props
}) => {
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])
  return (
    <Link href={href} target={target} {...props}>
      <Icon
        as={icon}
        onClick={onClick}
        sx={{
          w: '16px',
          h: '16px',
          color: color || primaryBlueText,
          ...styles
        }}
        cursor='pointer'
      />
    </Link>
  )
}

export default ExternalNavIcon
