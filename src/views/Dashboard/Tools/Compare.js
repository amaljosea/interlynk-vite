import { useLazyQuery, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { sortByUpdatedAt } from 'utils'

import { Flex, Grid, HStack, Icon, Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import DiffTable from 'components/Tables/DiffTable'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  GetProductData,
  GetProductsForSbomDrift,
  GetProject,
  GetSbomDrift
} from 'graphQL/Queries'

import { FaScaleUnbalanced } from 'react-icons/fa6'

import SbomCompare from './SbomCompare'

const Compare = ({ selectedSboms }) => {
  const { showToast } = useCustomToast()
  const { prodState, dispatch } = useGlobalState()
  const { field, direction } = prodState
  const { toolsDispatch } = dispatch

  const { primaryTextColor, secondaryBlueText } = useThemeColor([
    'primaryTextColor',
    'secondaryBlueText'
  ])

  const [isLoading, setIsLoading] = useState(false)

  const [getProduct] = useLazyQuery(GetProject, {
    fetchPolicy: 'network-only'
  })
  const [getSbomData] = useLazyQuery(GetProductData, {
    fetchPolicy: 'network-only'
  })
  const [getDrift, { data: driftData }] = useLazyQuery(GetSbomDrift, {
    fetchPolicy: 'network-only'
  })
  const { data, loading: projectGrpLoading } = useQuery(
    GetProductsForSbomDrift,
    {
      fetchPolicy: 'network-only',
      variables: {
        first: 200,
        enabled: true,
        field: field,
        direction: direction
      }
    }
  )

  // -------------- SBOM 1 --------------
  const [selectedGroupOne, setSelectedGroupOne] = useState('')
  const [selectedProdOne, setSelectedProdOne] = useState('')
  const [selectedVersionOne, setSelectedVersionOne] = useState(null)
  const [uniqVersionsOne, setUniqVersionsOne] = useState([])
  const [productListOne, setProductListOne] = useState([])
  const [firstSbomInfo, setFirstSbomInfo] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const [isSbomOneLoading, setIsSbomOneLoading] = useState(false)

  const onSelectGroupOne = (e) => {
    setSelectedGroupOne(e.target.value)
    setProductListOne([])
    setSelectedProdOne('')
    setUniqVersionsOne([])
    setSelectedVersionOne(null)
  }

  const onSelectProductOne = (e) => {
    setSelectedProdOne(e.target.value)
    setUniqVersionsOne([])
    setSelectedVersionOne(null)
  }

  const onSubmitSbomOne = () => {
    if (selectedProdOne && selectedVersionOne) {
      getSbomData({
        variables: {
          projectId: selectedProdOne,
          sbomId: selectedVersionOne?.value
        }
      }).then((res) => {
        if (res?.data) {
          setFirstSbomInfo(res.data.sbom)
        }
      })
    }
  }

  const onClearOne = () => {
    setFirstSbomInfo(null)
    toolsDispatch({ type: 'SET_DATA', payload: [] })
  }

  useEffect(() => {
    if (selectedGroupOne) {
      const activeGroup = data?.organization?.projectGroups?.nodes.find(
        (item) => item.id === selectedGroupOne
      )
      const result = activeGroup?.projects?.map((option) => ({
        value: option.id,
        label: option.name
      }))
      setProductListOne(result)
    }
  }, [data, selectedGroupOne])

  useEffect(() => {
    if (selectedProdOne !== '' && selectedVersionOne === null) {
      setIsSbomOneLoading(true)
      getProduct({ variables: { id: selectedProdOne } }).then((res) => {
        if (res.data) {
          const data = sortByUpdatedAt(res?.data?.project?.sboms)
          if (data?.length > 0) {
            const versions = []
            data?.map((sbom) => {
              versions.push({ label: sbom?.projectVersion, value: sbom?.id })
            })
            setIsSbomOneLoading(false)
            setUniqVersionsOne(versions)
            setSelectedVersionOne(null)
          } else {
            setIsSbomOneLoading(false)
            setUniqVersionsOne([])
            setSelectedVersionOne(null)
          }
        }
      })
    }
  }, [getProduct, selectedProdOne, selectedVersionOne, selectedVersionTwo])

  // ------------- SBOM 2 --------------
  const [selectedGroupTwo, setSelectedGroupTwo] = useState('')
  const [selectedProdTwo, setSelectedProdTwo] = useState('')
  const [selectedVersionTwo, setSelectedVersionTwo] = useState(null)
  const [uniqVersionsTwo, setUniqVersionsTwo] = useState([])
  const [productListTwo, setProductListTwo] = useState([])
  const [secondSbomInfo, setSecondSbomInfo] = useState(null)
  const [isSbomTwoLoading, setIsSbomTwoLoading] = useState(false)

  const onSelectGroupTwo = (e) => {
    setSelectedGroupTwo(e.target.value)
    setProductListTwo([])
    setSelectedProdTwo('')
    setUniqVersionsTwo([])
    setSelectedVersionTwo(null)
  }

  const onSelectProductTwo = (e) => {
    setSelectedProdTwo(e.target.value)
    setUniqVersionsTwo([])
    setSelectedVersionTwo(null)
  }

  const onSubmitSbomTwo = () => {
    if (selectedProdTwo && selectedVersionTwo) {
      getSbomData({
        variables: {
          projectId: selectedProdTwo,
          sbomId: selectedVersionTwo?.value
        }
      }).then((res) => {
        if (res?.data) {
          setSecondSbomInfo(res.data.sbom)
        }
      })
    }
  }

  const onClearTwo = () => {
    setSecondSbomInfo(null)
    toolsDispatch({ type: 'SET_DATA', payload: [] })
  }

  const onVersionOneChange = (item) => {
    if (selectedVersionTwo?.value === item?.value) {
      setDisabled(true)
      setSelectedVersionOne(null)
      showToast({
        description: 'Same version comparison not allowed',
        status: 'error'
      })
    } else {
      setDisabled(false)
      setSelectedVersionOne(item)
    }
  }

  const onVersionTwoChange = (item) => {
    if (selectedVersionOne?.value === item?.value) {
      setDisabled(true)
      setSelectedVersionTwo(null)
      showToast({
        description: 'Same version comparison not allowed',
        status: 'error'
      })
    } else {
      setDisabled(false)
      setSelectedVersionTwo(item)
    }
  }

  useEffect(() => {
    if (selectedGroupTwo) {
      const activeGroup = data?.organization?.projectGroups?.nodes.find(
        (item) => item.id === selectedGroupTwo
      )
      const result = activeGroup?.projects?.map((option) => ({
        value: option.id,
        label: option.name
      }))
      setProductListTwo(result)
    }
  }, [data, selectedGroupTwo])

  useEffect(() => {
    if (selectedProdTwo !== '' && selectedVersionTwo === null) {
      setIsSbomTwoLoading(true)
      getProduct({ variables: { id: selectedProdTwo } }).then((res) => {
        if (res.data) {
          const data = sortByUpdatedAt(res?.data?.project?.sboms)
          if (data?.length > 0) {
            const versions = []
            data?.map((sbom) => {
              versions.push({ label: sbom?.projectVersion, value: sbom?.id })
            })
            setIsSbomTwoLoading(false)
            setUniqVersionsTwo(versions)
            setSelectedVersionTwo(null)
          } else {
            setIsSbomTwoLoading(false)
            setSelectedVersionTwo(null)
            setUniqVersionsTwo([])
          }
        }
      })
    }
  }, [getProduct, selectedProdTwo, selectedVersionOne, selectedVersionTwo])

  useEffect(() => {
    if (firstSbomInfo && secondSbomInfo) {
      getDrift({
        variables: {
          projectId: selectedProdOne,
          subjectSbomId: selectedVersionOne?.value,
          targetSbomId: selectedVersionTwo?.value
        }
      }).then((res) => {
        if (res?.data) {
          setIsLoading(false)
          toolsDispatch({
            type: 'SET_DATA',
            payload: res?.data?.sbom?.sbomDrift
          })
        }
      })
    }
  }, [
    firstSbomInfo,
    getDrift,
    secondSbomInfo,
    selectedProdOne,
    selectedVersionOne,
    selectedVersionTwo,
    toolsDispatch
  ])

  const handleCompare = () => {
    setIsLoading(true)
    !firstSbomInfo && onSubmitSbomOne()
    !secondSbomInfo && onSubmitSbomTwo()
  }

  const compareButtonProps = {
    firstSbomInfo,
    secondSbomInfo,
    handleCompare,
    selectedVersionOne,
    selectedVersionTwo,
    disabled
  }

  return (
    <Flex flexDirection='column' gap={6}>
      {/* HEADER */}
      <Card p={5}>
        <Flex
          alignItems={'flex-start'}
          gap={5}
          justifyContent={'space-between'}
        >
          <HStack spacing={4} alignItems={'flex-start'}>
            <Icon
              as={FaScaleUnbalanced}
              h={'64px'}
              w={'64px'}
              color={secondaryBlueText}
            />
            <Stack spacing={0}>
              <Text fontWeight={'semibold'} fontSize={24}>
                SBOM Compare
              </Text>
              <Text>
                This tool lists compare two SBOMs and report results as added,
                removed, and modified components with their licenses, PURL, and
                CPEs compared
              </Text>
            </Stack>
          </HStack>
        </Flex>
      </Card>
      {/* SBOM SELECTIONS */}
      <Grid templateColumns='repeat(2, 1fr)' gap={6} color={primaryTextColor}>
        {/* SBOM ONE */}
        <SbomCompare
          isSbomOne={true}
          data={data}
          selectedVersion={selectedVersionOne}
          projectGrpLoading={projectGrpLoading}
          onVersionChange={onVersionOneChange}
          selectedSboms={selectedSboms}
          uniqueVersions={uniqVersionsOne}
          sbomInfo={firstSbomInfo}
          selectedGroup={selectedGroupOne}
          selectedProd={selectedProdOne}
          onClear={onClearOne}
          onSelectGroup={onSelectGroupOne}
          loading={isSbomOneLoading}
          onSelectProduct={onSelectProductOne}
          productList={productListOne}
        />
        {/* SBOM TWO */}
        <SbomCompare
          isSbomOne={false}
          data={data}
          selectedVersion={selectedVersionTwo}
          projectGrpLoading={projectGrpLoading}
          onVersionChange={onVersionTwoChange}
          selectedSboms={selectedSboms}
          uniqueVersions={uniqVersionsTwo}
          sbomInfo={secondSbomInfo}
          selectedGroup={selectedGroupTwo}
          selectedProd={selectedProdTwo}
          onClear={onClearTwo}
          onSelectGroup={onSelectGroupTwo}
          loading={isSbomTwoLoading}
          onSelectProduct={onSelectProductTwo}
          productList={productListTwo}
          compareButtonProps={compareButtonProps}
        />
      </Grid>
      {/* SBOM DIFFERENCE */}
      <Card width='100%'>
        <DiffTable
          diffs={driftData?.sbom}
          isLoading={isLoading}
          sbomOne={firstSbomInfo}
          sbomTwo={secondSbomInfo}
        />
      </Card>
    </Flex>
  )
}

export default Compare
