import { Stack, Text } from '@chakra-ui/react'

const AuthorInfo = ({ item }) => {
  return (
    <Stack dir='column' spacing={1}>
      <Text>Name: {item?.name || 'N/A'}</Text>
      {item?.email && <Text>Email: {item?.email}</Text>}
      {item?.phone && <Text>Phone: {item?.phone}</Text>}
    </Stack>
  )
}

export default AuthorInfo
