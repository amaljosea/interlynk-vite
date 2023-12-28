import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client'
import { Box, Image } from '@chakra-ui/react'
import Invitation from 'views/Auth/Invitation'
import DashboardBg from 'assets/img/dashboard.png'
import { useRef } from 'react'

const Success = () => {
  const navRef = useRef()

  const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

  const httpLink = createHttpLink({
    uri: graphqlAPI
  })

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    queryDeduplication: false
  })

  return (
    <ApolloProvider client={client}>
      <Box ref={navRef} w='100%' height={'100vh'} position={'relative'}>
        <Image
          src={DashboardBg}
          width={'100%'}
          height={'100%'}
          pos={'absolute'}
        />
        <Invitation />
      </Box>
    </ApolloProvider>
  )
}

export default Success
