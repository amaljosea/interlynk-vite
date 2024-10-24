import { Box } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import SidebarContent from './SidebarContent'

const Sidebar = ({ routes }) => {
  const { mainContrastBgColor, neutralBorder } = useThemeColor([
    'mainContrastBgColor'
  ])

  return (
    <Box
      px={3.5}
      height={'100vh'}
      bg={mainContrastBgColor}
      borderRight={`-.5px solid ${neutralBorder}`}
    >
      <SidebarContent routes={routes} />
    </Box>
  )
}

export default Sidebar
