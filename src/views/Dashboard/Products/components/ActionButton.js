import { Button } from '@chakra-ui/react'

const ActionButton = (props) => {
  const { title, onClick, isLoading = false, isDisabled, hidden } = props
  return (
    <Button
      hidden={hidden}
      onClick={onClick}
      variant='outline'
      colorScheme='blue'
      data-testid={title}
      width={'fit-content'}
      isLoading={isLoading}
      loadingText='Saving...'
      isDisabled={isDisabled}
    >
      {title}
    </Button>
  )
}

export default ActionButton
