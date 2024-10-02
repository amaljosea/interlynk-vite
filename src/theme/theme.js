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
  // Text Colors
  headingTextColor: {
    light: '#4A5568', // gray.600
    dark: '#E2E8F0' // gray.200
  },
  primaryTextColor: {
    light: '#1A202C', // gray.800
    dark: '#F7FAFC' // gray.50
  },
  secondaryTextColor: {
    light: '#A0AEC0', // gray.400
    dark: '#718096' // gray.500
  },
  secondaryTextInverse: {
    light: '#718096', // gray.500
    dark: '#A0AEC0' // gray.400
  },
  primaryBlueText: {
    light: '#3182CE', // blue.500
    dark: '#5BA3DB' // slightly lighter than blue.400
  },

  // Background Colors
  primaryBgColor: {
    light: '#F7FAFC', // gray.50
    dark: '#1A202C' // gray.800
  },
  secondaryBgColor: {
    light: '#EDF2F7', // gray.100
    dark: '#2D3748' // gray.700
  },
  inverseSecondaryBgColor: {
    light: '#2D3748', // gray.700
    dark: '#EDF2F7' // gray.100
  },
  lightAndDarkBgColor: {
    light: '#fff', // white for light mode
    dark: '#1f2733' // dark muted blue-gray
  },

  // Border Colors
  grayBorderColor: {
    light: '#E2E8F0', // gray.200
    dark: '#ffffff29' // custom semi-transparent white
  },
  primaryBlueBorder: {
    light: '#3182CE', // blue.500
    dark: '#90cdf499' // blue.400 with transparency
  },
  secondaryBlueBorder: {
    light: '#3182CE66', // blue.600 with transparency
    dark: '#90cdf499' // blue.400 with transparency
  },
  lightTealBorder: {
    light: '#4FD1C5', // teal.300
    dark: '#81E6D9' // teal.200
  },
  semiTransparentBorder: {
    light: '#0000001f', //  black with 12% opacity
    dark: '#ffffff1A' // white with 10% opacity
  },

  // Error Colors
  primaryErrorColor: {
    light: '#E53E3E', // red.500
    dark: '#F56565' // red.400
  },
  secondaryErrorColor: {
    light: '#FFF5F5', // red.100
    dark: '#4A1F1F' // custom dark red for night mode
  },

  // Success Colors
  primarySuccessColor: {
    light: '#48BB78', // green.400
    dark: '#68D391' // green.300
  },
  secondarySuccessColor: {
    light: '#F0FFF4', // green.100
    dark: '#1F4032' // custom dark green for night mode
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
