import { Button } from '@chakra-ui/react'

const ActionButton = ({ title, onClick, isDisabled, hidden, props }) => {
  return (
    <Button
      hidden={hidden}
      onClick={onClick}
      variant='outline'
      colorScheme='blue'
      width={'fit-content'}
      isDisabled={isDisabled}
      data-testid={title}
      {...props}
    >
      {title}
    </Button>
  )
}

export default ActionButton
