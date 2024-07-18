import { useQuery } from '@apollo/client'

import { Alert, Grid } from '@chakra-ui/react'

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

  const viewFeeds = useHasPermission({
    parentKey: 'view_feeds'
  })

  const { data, refetch, loading } = useQuery(GetOrgSettings, {
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

  if (viewFeeds === false) {
    return (
      <Alert status='error' borderRadius={5}>
        You are not authorized to view feeds
      </Alert>
    )
  }

  return (
    <Grid
      gap='22px'
      width={'100%'}
      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
    >
      <AdvisoryFeeds data={advisoryFeed} refetch={refetch} />
      <ExploitFeeds data={exploitFeed} refetch={refetch} />
    </Grid>
  )
}

export default Feeds
