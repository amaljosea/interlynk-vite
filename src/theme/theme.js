import { StepsStyleConfig as Steps } from 'chakra-ui-steps'

import { extendTheme } from '@chakra-ui/react'

import { CardComponent } from './additions/card/Card'
import { CardBodyComponent } from './additions/card/CardBody'
import { CardHeaderComponent } from './additions/card/CardHeader'
import { MainPanelComponent } from './additions/layout/MainPanel'
import { PanelContainerComponent } from './additions/layout/PanelContainer'
import { PanelContentComponent } from './additions/layout/PanelContent'
import { badgeStyles } from './components/badge'
import { buttonStyles } from './components/button'
import { drawerStyles } from './components/drawer'
import { linkStyles } from './components/link'
import { breakpoints } from './foundations/breakpoints'
import { globalStyles } from './styles'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false
}

// import { mode } from "@chakra-ui/theme-tools";
export default extendTheme(
  // Breakpoints
  {
    breakpoints,
    components: {
      Steps,
      FormLabel: {
        baseStyle: {
          fontSize: '14px',
          marginBottom: '4px'
        }
      }
    }
  },
  config,
  globalStyles,
  buttonStyles, // Button styles
  badgeStyles, // Badge styles
  linkStyles, // Link styles
  drawerStyles, // Sidebar variant for Chakra's drawer
  CardComponent, // Card component
  CardBodyComponent, // Card Body component
  CardHeaderComponent, // Card Header component
  MainPanelComponent, // Main Panel component
  PanelContentComponent, // Panel Content component
  PanelContainerComponent // Panel Container component
)
