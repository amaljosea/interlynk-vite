import { Alert, AlertDescription, AlertIcon, Skeleton } from '@chakra-ui/react'

import Card from 'components/Card/Card'

const ViewAlert = ({ loading, category }) => {
  if (loading) {
    return (
      <Card>
        <Skeleton width={'100%'} height={5} />
      </Card>
    )
  }

  return (
    <Alert status='error' borderRadius={5}>
      <AlertIcon />
      <AlertDescription>
        You are not authorized to view {category}
      </AlertDescription>
    </Alert>
  )
}

export default ViewAlert
