// Chakra imports
import { useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Flex, Skeleton, Stack, useToast } from '@chakra-ui/react'

import Card from 'components/Card/Card.js'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  ShareComponentData,
  ShareProductData,
  ShareProject
} from 'graphQL/Queries'

import SbomInfo from '../../Sbom/components/SbomInfo'
import SBOMTable from './SbomTable'

const idRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function SBOM({ vulnData, vulnRefetch, getVulnData, prodRefetch }) {
  const { totalRows, activeCsSbomTab, prodState, prodCompState } =
    useGlobalState()
  const { data: allProjectGroups } = prodState
  const { field, direction } = prodCompState
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const [status, setStatus] = useState('created')
  const [totalComp, setTotalComp] = useState(0)
  const group = JSON.parse(localStorage.getItem('product'))

  // GET COMPONENT DATA
  const {
    data: compData,
    refetch: compRefetch,
    error: compError
  } = useQuery(ShareComponentData, {
    fetchPolicy: 'network-only',
    variables: {
      sbomId: sbomId,
      first: totalRows,
      field,
      direction
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
      // onToggle()
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
