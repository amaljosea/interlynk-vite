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
import { getSignedUrlParams } from 'utils'
import { logoutUser } from 'utils/authUtils'
import promiseToObservable from 'utils/promiseToObservable'

import useCustomToast from 'hooks/useCustomToast'

let toastCache

const graphqlAPI = process.env.REACT_APP_GRAPHQL_API

const uploadLink = createUploadLink({
  uri: graphqlAPI
})
const env = process.env.NODE_ENV

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    const response = await fetch(
      `${process.env.REACT_APP_REFRESH_TOKEN_URL}?refresh_token=${refreshToken}`,
      {
        method: 'POST',
        credentials: 'include' // To include cookies
      }
    )

    if (!response.ok) {
      const errorResponse = await response.json()
      console.warn('Server error:', errorResponse)
      throw new Error('Failed to refresh token')
    }

    const { access_token, refresh_token } = await response.json()

    if (!access_token || !refresh_token) {
      throw new Error('Failed to refresh token')
    }

    // Update cookies with the new tokens
    Cookies.set('authToken', `Bearer ${access_token}`, {
      sameSite: 'Strict',
      secure: true,
      path: '/'
    })
    Cookies.set('refreshToken', refresh_token)

    return access_token
  } catch (error) {
    logoutUser().then(() => (window.location.href = '/auth'))
    console.warn('Token refresh failed:', error)
    toastCache({
      title: 'Session Expired',
      description: 'Please log in again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top'
    })
    return null
  }
}

// Authentication link to attach tokens
const authLink = setContext(async (_, { headers }) => {
  const authToken = Cookies.get('authToken')
  const queryParams = new URLSearchParams(location.search)

  const signedUrlParams =
    queryParams.get('signed_url_params') || getSignedUrlParams()

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

let isRefreshing = false

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message === 'Authorization token is invalid or expired') {
        if (!isRefreshing) {
          isRefreshing = true
          return promiseToObservable(
            refreshToken().finally(() => {
              isRefreshing = false
            })
          ).flatMap(() => forward(operation))
        }

        return promiseToObservable(
          new Promise((resolve) => setTimeout(resolve, 100))
        ).flatMap(() => forward(operation))
      }
    }
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

export const refetchActiveQueries = async () => {
  await client.refetchQueries({
    include: 'active'
  })
}

// Apollo Client setup
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
