import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'

const LynkAlert = ({ msg, status = 'error' }) => {
  return (
    <Alert status={status} borderRadius={4}>
      <AlertIcon />
      <AlertDescription fontSize={'sm'} pr={2}>
        {msg}
      </AlertDescription>
    </Alert>
  )
}

export default LynkAlert
