/* eslint-disable */
import { StepsStyleConfig as Steps } from 'chakra-ui-steps'
import { getItem } from 'utils/localStorageUtils'

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
  // Text Colors(used as background in soome places also)
  headingTextColor: {
    light: '#4A5568', // gray.600
    dark: '#E2E8F0' // gray.200
  },
  headingTextSecondary: {
    light: '#CBD5E0', // gray.300
    dark: '#4A5568' // gray.600
  },
  primaryTextColor: {
    light: '#1A202C', // gray.800
    dark: '#F7FAFC' // gray.50
  },
  primaryTextColorWithOpacity: {
    light: '#1A202C', // gray.800
    dark: '#FFFFFF99' // white with 60% opacity
  },

  secondaryTextColor: {
    light: '#A0AEC0', // gray.400
    dark: '#718096' // gray.500
  },
  secondaryTextInverse: {
    light: '#718096', // gray.500
    dark: '#A0AEC0' // gray.400
  },
  sameSecondaryText: {
    light: '#718096', // gray.500
    dark: '#718096' // gray.500
  },
  primaryBlueText: {
    light: '#3182CE', // blue.500
    dark: '#5BA3DB' // slightly lighter than blue.400
  },
  secondaryBlueText: {
    light: '#63b3ed', // blue.300
    dark: '#5a9fdc' //intermediate shade between blue.300 and blue.400
  },

  contrastTextColor: {
    light: '#030303', // very dark gray/black for light mode
    dark: '#FFFFFFCC' // white with 80% opacity for dark mode
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
  mainContrastBgColor: {
    light: '#fff', // white for light mode
    dark: '#171923' // gray.900
  },

  lightBlueBg: {
    light: '#ebf8ff', // blue.50
    dark: '#1A202C' // gray.800
  },
  blurBackground: {
    light: '#00000029', // blackAlpha 300
    dark: '#00000029' // blackAlpha 300
  },
  customLightBlue: {
    light: '#BEE3F8', // Light blue
    dark: '#2B6CB0' // Darker blue for dark mode
  },
  customDarkBlue: {
    light: '#2A4365', // Light blue-gray
    dark: '#B7C9D9' // Dark blue
  },

  // Border Colors
  neutralBorder: {
    light: '#E2E8F0', // light gray.200
    dark: '#1A202C' // dark gray.800
  },
  grayBorderColor: {
    light: '#E2E8F0', // gray.200
    dark: '#ffffff29' // custom semi-transparent white
  },
  primaryBlueBorder: {
    light: '#3182CE', // blue.500
    dark: '#90cdf499' // blue.400 with transparency
  },
  secondaryBlueBorder: {
    light: '#3182CE66', // blue.500 with transparency
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
  mutedBorder: {
    light: '#1A202C29', // dark gray with 16% opacity
    dark: '#ffffff12' // white with 7% opacity
  },
  vibrantBlue: {
    light: '#0D0CEE', // vibrant blue for light mode
    dark: '#009bff' //  vibrant blue for dark mode
  },
  primaryRedBorder: {
    light: '#E53E3E', // red.500
    dark: '#63171B' // red.900
  },
  primaryGreenBorder: {
    light: '#38A169', // green.500
    dark: '#1C4532' // green.900
  },
  secondaryRedBorder: {
    light: '#FED7D7', // red.100
    dark: '#1A202C' // gray.800
  },
  secondaryGreenBorder: {
    light: '#C6F6D5', //green.100
    dark: '#1A202C' //gray.800
  },
  // Error Colors
  primaryErrorColor: {
    light: '#E53E3E', // red.500
    dark: '#EC4C4C' // slightly lighter than red.500
  },

  // Success Colors
  primarySuccessColor: {
    light: '#48BB78', // green.400
    dark: '#68D391' // green.300
  },
  infoTextColor: {
    light: '#034E78', // dark blue
    dark: 'gray.300' // white
  }
}

const colorMode = getItem('chakra-ui-color-mode')

export const config = {
  initialColorMode: colorMode ? colorMode : 'system',
  useSystemColorMode: colorMode ? false : true
}

export default extendTheme(
  {
    breakpoints,
    components: {
      Steps,
      Heading: { baseStyle: { fontFamily: 'inherit', fontWeight: 'semibold' } },
      FormLabel: { baseStyle: { fontSize: 12, marginBottom: '4px' } },
      Input: { variants: { outline: { field: { fontSize: 'sm' } } } },
      Textarea: { variants: { outline: { fontSize: 'sm' } } },
      Select: { variants: { outline: { field: { fontSize: 'sm' } } } },
      Table: { baseStyle: { th: { fontFamily: 'inherit' } } }
    },
    colors,
    config: config
  },
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
