import { Box } from '@chakra-ui/react'
import { useStyleConfig } from '@chakra-ui/system'

import { useThemeColor } from 'hooks/useThemeColors'

function Card(props) {
  const { variant, children, ...rest } = props
  const styles = useStyleConfig('Card', { variant })
  // Pass the computed styles into the `__css` prop
  const { lightAndDarkBgColor } = useThemeColor(['lightAndDarkBgColor'])
  return (
    <Box __css={styles} {...rest} bgColor={lightAndDarkBgColor}>
      {children}
    </Box>
  )
}

export default Card
