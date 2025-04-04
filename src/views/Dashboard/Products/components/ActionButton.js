import { Button } from '@chakra-ui/react'

const ActionButton = (props) => {
  const { title, onClick, isLoading = false, isDisabled, hidden, icon } = props
  return (
    <Button
      name={title}
      hidden={hidden}
      onClick={onClick}
      variant='outline'
      colorScheme='blue'
      width={'fit-content'}
      isLoading={isLoading}
      loadingText='Saving...'
      isDisabled={isDisabled}
      leftIcon={icon}
    >
      {title}
    </Button>
  )
}

export default ActionButton
