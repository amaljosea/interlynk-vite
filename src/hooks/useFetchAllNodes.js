import { useEffect, useState } from 'react'
import fetchAllNodes from 'utils/fetchAllNodes'

const useFetchAllNodes = ({ query, variables, selector, skip }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (skip) return

    const fetchData = async () => {
      setLoading(true)
      const nodes = await fetchAllNodes({
        query,
        variables,
        selector
      })
      setData(nodes)
      setLoading(false)
    }

    fetchData()
  }, [query, variables, selector, skip])

  return { data, loading }
}

export default useFetchAllNodes
