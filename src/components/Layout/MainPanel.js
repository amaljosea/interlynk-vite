import { Box } from '@chakra-ui/react'
import { useStyleConfig } from '@chakra-ui/system'

function MainPanel(props) {
  const { variant, children, ...rest } = props
  const styles = useStyleConfig('MainPanel', { variant })
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  )
}

export default MainPanel
