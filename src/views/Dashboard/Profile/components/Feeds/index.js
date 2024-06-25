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

  if (loading) return <CustomLoader />

  return (
    <Grid
      gap='22px'
      width={'100%'}
      templateColumns={{ sm: '1fr', xl: 'repeat(3, 1fr)' }}
    >
      <AdvisoryFeeds data={data} refetch={refetch} />
      <ExploitFeeds data={data} refetch={refetch} />
    </Grid>
  )
}

export default Feeds
