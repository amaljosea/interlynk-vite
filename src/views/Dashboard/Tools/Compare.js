import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { sortByUpdatedAt } from 'utils'

import { Flex, Grid, HStack, Icon, Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'
import DiffTable from 'components/Tables/DiffTable'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  GetProductData,
  GetProject,
  GetProjectGroups,
  GetSbomDrift
} from 'graphQL/Queries'

import { FaScaleUnbalanced } from 'react-icons/fa6'

import SbomCompare from './SbomCompare'

const Compare = ({ selectedSboms }) => {
  const { showToast } = useCustomToast()
  const { prodState, dispatch } = useGlobalState()
  const { field, direction } = prodState
  const { toolsDispatch } = dispatch
  const { style } = useSelect('lynkSelect')
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

  // -------------- SBOM 1 --------------
  const [selectedGroupOne, setSelectedGroupOne] = useState('')
  const [selectedProdOne, setSelectedProdOne] = useState({})
  const [selectedVersionOne, setSelectedVersionOne] = useState(null)
  const [uniqVersionsOne, setUniqVersionsOne] = useState([])
  const [productListOne, setProductListOne] = useState([])
  const [firstSbomInfo, setFirstSbomInfo] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const [isSbomOneLoading, setIsSbomOneLoading] = useState(false)

  const onSelectGroupOne = (group) => {
    setSelectedGroupOne(group)
    setProductListOne([])
    setSelectedProdOne(null)
    setUniqVersionsOne([])
    setSelectedVersionOne(null)
  }

  const onSelectProductOne = (env) => {
    setSelectedProdOne(env)
    setUniqVersionsOne([])
    setSelectedVersionOne(null)
  }

  const onSubmitSbomOne = () => {
    if (selectedProdOne && selectedVersionOne) {
      getSbomData({
        variables: {
          projectId: selectedProdOne?.value,
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
      const activeGroup = nodes?.find((item) => item.id === selectedGroupOne.id)
      const result = activeGroup?.projects?.map((option) => ({
        value: option.id,
        label: option.name
      }))
      setProductListOne(result)
    }
  }, [selectedGroupOne, nodes])

  useEffect(() => {
    if (selectedProdOne?.value && selectedVersionOne === null) {
      setIsSbomOneLoading(true)
      getProduct({ variables: { id: selectedProdOne?.value } }).then((res) => {
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
  const [selectedProdTwo, setSelectedProdTwo] = useState({})
  const [selectedVersionTwo, setSelectedVersionTwo] = useState(null)
  const [uniqVersionsTwo, setUniqVersionsTwo] = useState([])
  const [productListTwo, setProductListTwo] = useState([])
  const [secondSbomInfo, setSecondSbomInfo] = useState(null)
  const [isSbomTwoLoading, setIsSbomTwoLoading] = useState(false)

  const onSelectGroupTwo = (group) => {
    setSelectedGroupTwo(group)
    setProductListTwo([])
    setSelectedProdTwo(null)
    setUniqVersionsTwo([])
    setSelectedVersionTwo(null)
  }

  const onSelectProductTwo = (env) => {
    setSelectedProdTwo(env)
    setUniqVersionsTwo([])
    setSelectedVersionTwo(null)
  }

  const onSubmitSbomTwo = () => {
    if (selectedProdTwo && selectedVersionTwo) {
      getSbomData({
        variables: {
          projectId: selectedProdTwo?.value,
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
      const activeGroup = nodes?.find((item) => item.id === selectedGroupTwo.id)
      const result = activeGroup?.projects?.map((option) => ({
        value: option.id,
        label: option.name
      }))
      setProductListTwo(result)
    }
  }, [selectedGroupTwo, nodes])

  useEffect(() => {
    if (selectedProdTwo?.value && selectedVersionTwo === null) {
      setIsSbomTwoLoading(true)
      getProduct({ variables: { id: selectedProdTwo?.value } }).then((res) => {
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
          projectId: selectedProdOne?.value,
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

  const { lazyDropDownProps } = useLazyDropDown(GetProjectGroups, {
    selector: 'organization.projectGroups',
    variables: {
      field: field,
      direction: direction,
      first: 5
    },
    selectorForActualCount: 'organization.projectGroups',
    styles: style,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: CustomDropdownIndicator
    },
    optionLabel: 'name'
  })

  const { nodes, loading } = lazyDropDownProps

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
          selectedVersion={selectedVersionOne}
          projectGrpLoading={loading}
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
          lazyDropDownProps={lazyDropDownProps}
        />
        {/* SBOM TWO */}
        <SbomCompare
          isSbomOne={false}
          selectedVersion={selectedVersionTwo}
          projectGrpLoading={loading}
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
          lazyDropDownProps={lazyDropDownProps}
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
