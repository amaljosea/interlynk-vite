import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'

const LynkError = ({ error }) => {
  return (
    <Alert status='error' borderRadius={4}>
      <AlertIcon />
      <AlertDescription fontSize={'sm'} pr={2}>
        {error}
      </AlertDescription>
    </Alert>
  )
}

export default LynkError
