import { mode } from '@chakra-ui/theme-tools'

export const globalStyles = {
  colors: {
    gray: {
      // eslint-disable-next-line
      700: '#1f2733'
    }
  },
  styles: {
    global: (props) => ({
      body: {
        // eslint-disable-next-line
        bg: mode('blue.50', 'gray.800')(props),
        fontFamily: "'Sora', sans-serif"
      },
      html: {
        fontFamily: "'Sora', sans-serif"
      }
    })
  }
}
