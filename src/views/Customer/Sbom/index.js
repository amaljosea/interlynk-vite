// Chakra imports
import { Flex, Skeleton, Stack, useToast } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import Card from 'components/Card/Card.js'
import SBOMTable from './SbomTable'
import SbomInfo from '../../Sbom/components/SbomInfo'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import {
  ShareComponentData,
  ShareProductData,
  ShareProject
} from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function SBOM({ vulnData, vulnRefetch, getVulnData, prodRefetch }) {
  const { totalRows, envName, setActiveSbomTab, prodState, prodCompState } =
    useGlobalState()
  const { data: allProjectGroups } = prodState
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const [status, setStatus] = useState('created')
  const [totalComp, setTotalComp] = useState(0)
  const group = JSON.parse(localStorage.getItem('product'))
  const environment = localStorage.getItem('environment')

  // GET COMPONENT DATA
  const {
    data: compData,
    refetch: compRefetch,
    error: compError
  } = useQuery(ShareComponentData, {
    fetchPolicy: 'network-only',
    variables: {
      sbomId: sbomId,
      first: totalRows
    }
  })

  const {
    data: sbomData,
    refetch,
    error
  } = useQuery(ShareProductData, {
    variables: {
      sbomId: sbomId
    }
  })

  const { data } = useQuery(ShareProject, {
    variables: {
      id: productId
    }
  })

  const activeGroup = allProjectGroups?.nodes.find(
    (item) => item.id === group?.groupId
  )

  const selectedProject = activeGroup?.projects.find(
    (item) => item.id === productId
  )

  const uniqVersions = []

  data?.shareLynkQuery?.project?.sboms?.length > 0 &&
    data?.shareLynkQuery?.project?.sboms.map((project) => {
      uniqVersions.push({
        label: project?.projectVersion
      })
    })

  // ADD KEYBOARD SHORTCUT FOR TOGGLE DOWNLOAD MODAL
  const handleKeyDownload = (event) => {
    if (event.altKey && event.key === '3') {
      onToggle()
    }
  }

  // KEYBOARD EVENT LISTNER FOR TOGGLE DOWNLOAD MODAL
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownload)

    return () => {
      window.removeEventListener('keydown', handleKeyDownload)
    }
  }, [])

  useEffect(() => {
    if (!idRegex.test(productId) || !idRegex.test(sbomId)) {
      window.location.href = `/vendor/products`
    }
  }, [productId, sbomId])

  useEffect(() => {
    if (error) {
      toast({
        description: error.message,
        status: 'error',
        duration: 2000,
        position: 'top'
      })
      navigate('/vendor/products')
    }
  }, [])

  return (
    <>
      {/* SBOM INFO */}
      {sbomData ? (
        <Stack direction={'column'} spacing={2}>
          {/* DETAILS */}
          <SbomInfo
            sbom={sbomData?.shareLynkQuery?.sbom}
            refetch={refetch}
            getCompData={compRefetch}
            getVulnData={getVulnData}
            prodRefetch={prodRefetch}
          />
          {/* TABS */}
          <SBOMTable
            filteredData={uniqVersions}
            data={sbomData.shareLynkQuery?.sbom}
            refetch={refetch}
            status={status}
            totalComp={totalComp}
            setTotalComp={setTotalComp}
            vulnData={vulnData?.shareLynkQuery}
            vulnRefetch={vulnRefetch}
            getVulnData={getVulnData}
            getCompData={compRefetch}
            compData={compData?.shareLynkQuery}
            error={compError}
            type={
              selectedProject?.sboms.length > 0 &&
              selectedProject.sboms[0].format
            }
          />
        </Stack>
      ) : (
        <Card mb={6}>
          <Flex width={'100%'} gap={4} direction={'row'}>
            <Skeleton width={'100%'} height='30px' />
            <Skeleton width={'100%'} height='30px' />
          </Flex>
        </Card>
      )}
    </>
  )
}

export default SBOM
