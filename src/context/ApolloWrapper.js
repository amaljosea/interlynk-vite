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

import useCustomToast from 'hooks/useCustomToast'

let toastCache

const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

const uploadLink = createUploadLink({
  uri: graphqlAPI
})
const env = process.env.NODE_ENV

const authLink = setContext((_, { headers }) => {
  const authToken = Cookies.get('authToken')
  const queryParams = new URLSearchParams(location.search)

  const signedUrlParams =
    queryParams.get('signed_url_params') ||
    sessionStorage.getItem('signedUrlParams')

  let authHeaders

  if (signedUrlParams) {
    authHeaders = {
      'Interlynk-ShareLynk-Token': signedUrlParams || authToken
    }
  }

  if (authToken) {
    authHeaders = {
      ...authHeaders,
      authorization: authToken
    }
  }

  return {
    headers: {
      ...headers,
      ...authHeaders
    }
  }
})

export const refetchActiveQueries = async () => {
  await client.refetchQueries({
    include: 'active'
  })
}

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError?.statusCode === 401) {
    console.log('Unauthorized Access. Please log in.')
    // logoutUser().then(() => navigateCache('/auth'))
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

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache(),
  queryDeduplication: true,
  connectToDevTools: true,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      nextFetchPolicy: 'no-cache'
    },
    mutate: {
      refetchQueries: 'active'
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
      nextFetchPolicy: 'no-cache'
    }
  }
})

export const ApolloWrapper = ({ children }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()

  useEffect(() => {
    toastCache = showToast
  }, [navigate, showToast])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
