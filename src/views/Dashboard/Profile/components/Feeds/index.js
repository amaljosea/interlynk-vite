import { useQuery } from '@apollo/client'

import { Grid } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { GetOrgSettings } from 'graphQL/Queries'

import AdvisoryFeeds from './Advisory'
import ExploitFeeds from './Exploit'

const Feeds = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const manageFeeds = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_feeds'
  })

  const { data, loading } = useQuery(GetOrgSettings, {
    skip: !orgView ? true : activetab === 'feeds' ? false : true
  })

  const { organizationSettings } = data?.organization || ''

  const advisoryFeed = organizationSettings?.filter(
    (item) => item?.setting?.kind === `advisory_feed`
  )
  const exploitFeed = organizationSettings?.filter(
    (item) => item?.setting?.kind === `exploit_feed`
  )

  if (loading) return <CustomLoader />

  return (
    <Grid
      gap='22px'
      width={'100%'}
      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
    >
      <AdvisoryFeeds data={advisoryFeed} manageFeeds={manageFeeds} />
      <ExploitFeeds data={exploitFeed} manageFeeds={manageFeeds} />
    </Grid>
  )
}

export default Feeds
