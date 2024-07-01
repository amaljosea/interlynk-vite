import { useQuery } from '@apollo/client'

import { Grid } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useQueryParam from 'hooks/useQueryParam'

import { GetOrgSettings } from 'graphQL/Queries'

import AdvisoryFeeds from './Advisory'
import ExploitFeeds from './Exploit'

const Feeds = () => {
  const activetab = useQueryParam('tab')
  const org = localStorage.getItem('organization')

  const { data, refetch, loading } = useQuery(GetOrgSettings, {
    skip: org === 'undefined' ? true : activetab === 'feeds' ? false : true
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
      <AdvisoryFeeds data={advisoryFeed} refetch={refetch} />
      <ExploitFeeds data={exploitFeed} refetch={refetch} />
    </Grid>
  )
}

export default Feeds
