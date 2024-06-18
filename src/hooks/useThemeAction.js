import { useRegisterActions } from 'kbar'

import { useColorMode } from '@chakra-ui/system'

import { FaDisplay, FaMoon, FaSun } from 'react-icons/fa6'

export default function useThemeActions() {
  const { setColorMode } = useColorMode()

  useRegisterActions([
    {
      id: 'theme',
      name: 'Change Theme',
      section: 'Preferences',
      icon: <FaDisplay color='#718096' />
    },
    {
      id: 'darkTheme',
      name: 'Dark Mode',
      keywords: 'dark theme',
      section: 'Theme',
      icon: <FaMoon color='#718096' />,
      perform: () => setColorMode('dark'),
      parent: 'theme'
    },
    {
      id: 'lightTheme',
      name: 'Light Mode',
      keywords: 'light theme',
      section: 'Theme',
      icon: <FaSun color='#718096' />,
      perform: () => setColorMode('light'),
      parent: 'theme'
    }
  ])
}
