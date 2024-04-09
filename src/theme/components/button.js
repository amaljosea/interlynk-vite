export const buttonStyles = {
  components: {
    Button: {
      variants: {
        'no-hover': {
          _hover: {
            boxShadow: 'none'
          }
        },
        'transparent-with-icon': {
          bg: 'transparent',
          fontWeight: 'medium',
          borderRadius: 'inherit',
          cursor: 'pointer',
          _active: {
            bg: 'transparent',
            transform: 'none',
            borderColor: 'transparent'
          },
          _focus: {
            boxShadow: 'none'
          },
          _hover: {
            boxShadow: 'none'
          }
        }
      },
      baseStyle: {
        borderRadius: '5px',
        _focus: {
          boxShadow: 'none'
        }
      }
    }
  }
}
