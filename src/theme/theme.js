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

const colors = {
  headingTextColor: {
    light: '#4A5568',
    dark: '#CBD5E0'
  },
  primaryTextColor: {
    light: '#1A202C', // primary gray and light color used for texts
    dark: '#F7FAFC'
  },
  secondaryTextColor: {
    light: '#A0AEC0',
    dark: '#718096'
  },
  primaryBlueText: {
    light: '#3182CE', // Primary blue color used for texts
    dark: '#5BA3DB'
  },
  primaryBgColor: {
    light: '#F7FAFC', //used in KBar, CpeInput, GithubConfigModal etc
    dark: '#1A202C'
  },
  secondaryBgColor: {
    light: '#EDF2F7',
    dark: '#2D3748'
  },
  inverseSecondaryBgColor: {
    light: '#2D3748',
    dark: '#EDF2F7'
  },
  grayBorderColor: {
    light: '#E2E8F0',
    dark: '#ffffff29'
  },
  primaryBlueBorder: {
    light: '#3182CE',
    dark: '#90cdf499'
  },
  secondaryBlueBorder: {
    light: '#3182CE66',
    dark: '#90cdf499'
  },
  primaryErrorColor: {
    light: '#E53E3E',
    dark: '#F56565'
  },
  primarySuccessColor: {
    light: '#48BB78',
    dark: '#68D391'
  }
}

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
    },
    colors
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
