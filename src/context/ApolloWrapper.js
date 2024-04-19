import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createUploadLink } from 'apollo-upload-client'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from 'utils/authUtils'

import { useToast } from '@chakra-ui/react'

let navigateCache
let toastCache

const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

const uploadLink = createUploadLink({
  uri: graphqlAPI
})
const env = process.env.NODE_ENV

const queryParams = new URLSearchParams(location.search)

const authToken = Cookies.get('authToken')
const signedUrlParams =
  queryParams.get('signed_url_params') ||
  sessionStorage.getItem('signedUrlParams')

const authLink = setContext((_, { headers }) => {
  const authHeader = signedUrlParams
    ? { 'Interlynk-ShareLynk-Token': signedUrlParams || authToken }
    : { authorization: authToken }
  if (authToken) {
    return { headers: { ...headers, ...authHeader } }
  } else {
    return { headers: { ...headers } }
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError?.statusCode === 401) {
    console.log('Unauthorized Access. Please log in.')
    logoutUser().then(() => navigateCache('/auth'))
  }
  if (graphQLErrors && env !== 'production') {
    graphQLErrors.forEach(({ message }) => {
      toastCache({
        title: 'An error occurred.',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
    })
  }
})
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache(),
  queryDeduplication: false,
  connectToDevTools: true,
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-and-network'
    },
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})

export const ApolloWrapper = ({ children }) => {
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    navigateCache = navigate
    toastCache = toast
  }, [navigate, toast])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
