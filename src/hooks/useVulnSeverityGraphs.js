import { useLazyQuery } from '@apollo/client'
import { format, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import { formatToISO } from 'utils'

import { getVulnsBySeverity } from 'graphQL/Queries'

const useVulnSeverityGraphs = (days = 7) => {
  const [graphData, setGraphData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [fetchVulns, { loading: queryLoading, error: queryError }] =
    useLazyQuery(getVulnsBySeverity)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const results = []
        for (let i = 0; i < days; i++) {
          const date = format(subDays(new Date(), days - i - 1), 'MMM d')
          const firstMatchDateAfter = formatToISO(date)

          const { data: critical } = await fetchVulns({
            variables: {
              firstMatchDateAfter
            }
          })

          const { data: high } = await fetchVulns({
            variables: {
              firstMatchDateAfter,
              severity: ['high']
            }
          })

          const { data: low } = await fetchVulns({
            variables: {
              firstMatchDateAfter,
              severity: ['low']
            }
          })
          const { data: medium } = await fetchVulns({
            variables: {
              firstMatchDateAfter,
              severity: ['medium']
            }
          })
          const { data: unknown } = await fetchVulns({
            variables: {
              firstMatchDateAfter,
              severity: ['unknown']
            }
          })

          if (critical?.organization?.vulns) {
            results.push({
              date,
              critical: critical?.organization?.vulns?.totalCount || 0,
              high: high?.organization?.vulns?.totalCount || 0,
              medium: medium?.organization?.vulns?.totalCount || 0,
              low: low?.organization?.vulns?.totalCount || 0,
              unknown: unknown?.organization?.vulns?.totalCount || 0
            })
          }
        }

        setGraphData(results)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days, fetchVulns])

  return {
    data: graphData,
    loading: loading || queryLoading,
    error: error || queryError
  }
}

export default useVulnSeverityGraphs
