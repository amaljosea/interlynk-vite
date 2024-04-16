import { useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SBOM from 'views/Sbom'

import { Flex, Skeleton, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProjectGroup, GetVulnData } from 'graphQL/Queries'

const ProductDetailsSbom = () => {
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid

  const { totalRows, prodVulnState, dispatch, userPermissions } =
    useGlobalState()

  const {
    searchInput: vulnSearch,
    severities,
    components,
    statues,
    source,
    kev,
    epss,
    direct,
    retracted,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch, globalVulnDispatch } = dispatch

  const activeProd = localStorage.getItem('activeEnv')
  // const group = JSON.stringify(localStorage.getItem('product'))
  const environment = localStorage.getItem('environment')
  const [activeEnv, setActiveEnv] = useState(activeProd || '')

  const vulnsPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_feeds'),
    [userPermissions]
  )
  // GET PROJECT DATA
  const { data, refetch, loading, error } = useQuery(GetProjectGroup, {
    fetchPolicy: 'network-only',
    variables: { id: productGroupId }
  })

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    skip: sbomId && vulnsPermissions?.value === true ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      projectId: productId || activeEnv,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: vulnSearch !== '' ? vulnSearch : undefined,
      severity: severities.length > 0 ? severities : undefined,
      source: source === true ? undefined : 'COMPONENT',
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === 'direct only' ? true : undefined,
      includeRetracted: retracted,
      vexComplete: vexComplete === 'all' ? undefined : false,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
      globalVulnDispatch({ type: 'CLEAR_GLOBAL_VULN' })
    }
  }, [globalVulnDispatch, prodVulnDispatch, sbomId])

  useEffect(() => {
    if (environment && data) {
      console.log('Environment changed')
      const env = data?.projectGroup?.projects.find(
        (item) => item.name === environment
      )
      globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
      localStorage.setItem('activeEnv', env?.id)
      setActiveEnv(env?.id)
    }
  }, [data, environment, globalVulnDispatch])

  if (loading) {
    return (
      <Card>
        <Flex width={'100%'} gap={4} direction={'row'}>
          <Skeleton width={'100%'} height='30px' />
          <Skeleton width={'100%'} height='30px' />
        </Flex>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  if (sbomId) {
    return (
      <SBOM
        prodRefetch={refetch}
        vulnData={vulnData}
        getVulnData={vulnRefetch}
      />
    )
  }
}

export default ProductDetailsSbom
