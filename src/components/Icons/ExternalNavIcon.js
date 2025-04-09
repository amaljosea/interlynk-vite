import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Icon, Link } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const ExternalNavIcon = ({
  href,
  size = 4,
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
        cursor='pointer'
        onClick={onClick}
        sx={{
          w: size,
          h: size,
          color: color || primaryBlueText,
          ...styles
        }}
      />
    </Link>
  )
}

export default ExternalNavIcon
