// Chakra imports
import { Flex, Skeleton, Stack, useToast } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import Card from 'components/Card/Card.js'
import SBOMTable from './components/SBOMTable'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFullDateAndTime, removeDuplicates } from 'utils'
import { useQuery } from '@apollo/client'
import { GetProductData, GetProject, GetComponentData } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import SbomInfo from './components/SbomInfo'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function SBOM({ vulnData, vulnRefetch, getVulnData, prodRefetch }) {
  const { totalRows, setActiveSbomTab, prodState, prodCompState } =
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

  // GET COMPONENT DATA
  const {
    data: compData,
    refetch: compRefetch,
    error: compError
  } = useQuery(GetComponentData, {
    fetchPolicy: 'network-only',
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      field: prodCompState.field,
      direction: prodCompState.direction
    }
  })

  const {
    data: sbomData,
    refetch,
    error
  } = useQuery(GetProductData, {
    variables: {
      projectId: productId,
      sbomId: sbomId
    }
  })

  const { data } = useQuery(GetProject, {
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

  const filteredDuplicated = data ? removeDuplicates(data.project.sboms) : []

  filteredDuplicated &&
    filteredDuplicated.map((project) => {
      uniqVersions.push({
        label:
          project?.primaryComponent?.version ||
          `Uploaded ${getFullDateAndTime(project.creationAt)}`,
        value: project.id,
        creationAt: project.creationAt
      })
    })

  const handleTabChange = (value) => {
    localStorage.setItem('activeSbomTab', value)
    setActiveSbomTab(value)
  }

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
            sbom={sbomData?.sbom}
            refetch={refetch}
            getCompData={compRefetch}
            getVulnData={getVulnData}
            prodRefetch={prodRefetch}
          />
          {/* TABS */}
          <SBOMTable
            filteredData={uniqVersions}
            data={sbomData.sbom}
            refetch={refetch}
            status={status}
            totalComp={totalComp}
            setTotalComp={setTotalComp}
            vulnData={vulnData}
            vulnRefetch={vulnRefetch}
            getVulnData={getVulnData}
            getCompData={compRefetch}
            compData={compData}
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


