export const drawerStyles = {
  components: {
    Drawer: {
      sizes: {
        '2xl': { dialog: { maxW: '8xl' } }
      },
      // 3. We can add a new visual variant
      variants: {
        'with-shadow': {
          placement: 'right',
          boxShadow: '0 0 2px 2px #efdfde',
          bgColor: 'red'
        }
      }
    }
  }
}
