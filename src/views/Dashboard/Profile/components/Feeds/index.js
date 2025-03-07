import { useQuery } from '@apollo/client'

import { Grid } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

import { GetOrgSettings } from 'graphQL/Queries'

import AdvisoryFeeds from './Advisory'
import ExploitFeeds from './Exploit'

const Feeds = () => {
  const activeTab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const { data, loading } = useQuery(GetOrgSettings, {
    skip: !orgView || activeTab !== 'feeds'
  })

  const organizationSettings = data?.organization?.organizationSettings || []

  const advisoryFeed = organizationSettings?.filter(
    (item) => item?.setting?.kind === `advisory_feed` && item?.value
  )
  const exploitFeed = organizationSettings?.filter(
    (item) => item?.setting?.kind === `exploit_feed` && item?.value
  )

  if (loading) return <CustomLoader />

  return (
    <Grid
      gap='22px'
      width='100%'
      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
    >
      <AdvisoryFeeds data={advisoryFeed} />
      <ExploitFeeds data={exploitFeed} />
    </Grid>
  )
}

export default Feeds
