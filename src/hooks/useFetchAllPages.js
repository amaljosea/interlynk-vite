import { client } from 'context/ApolloWrapper'
import { get } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

const useFetchAllPages = (query, variables, selector, config = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { skip = false } = config

  const fetchAllPages = useCallback(async () => {
    if (skip) {
      return
    }
    setLoading(true)
    let allData = []
    let hasNextPage = true
    let endCursor = null

    try {
      while (hasNextPage) {
        if (hasNextPage) {
          const response = await client.query({
            query,
            variables: {
              ...variables,
              first: 200, // Fetch 200 items per request
              after: endCursor || undefined
            },
            fetchPolicy: 'no-cache'
          })

          const pageData = get(response.data, selector)

          const nodes = pageData?.nodes

          allData = [...allData, ...nodes]

          hasNextPage = Boolean(pageData?.pageInfo.hasNextPage)

          endCursor = pageData?.pageInfo.endCursor
        }
      }

      setData(allData)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [variables, query, selector, skip])

  useEffect(() => {
    fetchAllPages()
    // eslint-disable-next-line
  }, [])

  return { data, loading, error, fetchAllPages }
}

export default useFetchAllPages
