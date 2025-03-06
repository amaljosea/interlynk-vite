import { client } from 'context/ApolloWrapper'
import { fetchNodes } from 'utils'

const fetchAllNodes = async ({ query, variables, selector }) => {
  let allNodes = []
  let hasNextPage = true
  let endCursor = null

  try {
    while (hasNextPage) {
      const res = await client.query({
        query,
        variables: {
          ...variables,
          first: 200, // Fetch 200 items per request
          after: endCursor || undefined
        },
        fetchPolicy: 'no-cache'
      })

      if (res.data) {
        const selectedData = fetchNodes(res, selector)
        const pageInfo = selectedData?.pageInfo || {}

        if (selectedData?.nodes?.length > 0) {
          allNodes = [...allNodes, ...selectedData.nodes]
        }

        endCursor = pageInfo.endCursor || null
        hasNextPage = pageInfo.hasNextPage ?? false
      } else {
        hasNextPage = false
      }
    }
  } catch (error) {
    console.warn('Error fetching nodes:', error)
  }

  return allNodes
}

export default fetchAllNodes
