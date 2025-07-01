import { Icon, Link } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'
import { LuExternalLink } from 'react-icons/lu'

const ExternalNavIcon = ({
  href,
  size = 4,
  icon = LuExternalLink,
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
