import { useRegisterActions } from 'kbar'

import { useColorMode } from '@chakra-ui/system'

import { FaDisplay, FaMoon, FaSun } from 'react-icons/fa6'

import { useThemeColor } from './useThemeColors'

export default function useThemeActions() {
  const { setColorMode } = useColorMode()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  useRegisterActions([
    {
      id: 'theme',
      name: 'Change Theme',
      section: 'Preferences',
      icon: <FaDisplay color={sameSecondaryText} />
    },
    {
      id: 'darkTheme',
      name: 'Dark Mode',
      keywords: 'dark theme',
      section: 'Theme',
      icon: <FaMoon color={sameSecondaryText} />,
      perform: () => setColorMode('dark'),
      parent: 'theme'
    },
    {
      id: 'lightTheme',
      name: 'Light Mode',
      keywords: 'light theme',
      section: 'Theme',
      icon: <FaSun color={sameSecondaryText} />,
      perform: () => setColorMode('light'),
      parent: 'theme'
    }
  ])
}
