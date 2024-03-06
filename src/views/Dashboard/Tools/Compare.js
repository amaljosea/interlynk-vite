import { useLazyQuery, useQuery } from '@apollo/client'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  IconButton,
  Select,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { GetSbomDrift, GetProductsForSbomDrift, GetProductData, GetProject } from 'graphQL/Queries'
import { FaCodeCompare, FaScaleUnbalanced, FaX } from 'react-icons/fa6'
import { useGlobalState } from 'hooks/useGlobalState'
import { envOrderList, sortByUpdatedAt } from 'utils'
import DiffTable from 'components/Tables/DiffTable'
import React, { useEffect, useState } from 'react'
import SbomInfo from 'components/SbomInfo'
import ReactSelect from 'react-select'

const Compare = ({ selectedSboms }) => {
  const { prodState } = useGlobalState()
  const { field, direction } = prodState

  const [drifts, setDrifts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [getProduct] = useLazyQuery(GetProject, { fetchPolicy: 'network-only' })
  const [getSbomData] = useLazyQuery(GetProductData, {fetchPolicy: 'network-only'})
  const [getDrift, { data: driftData }] = useLazyQuery(GetSbomDrift, {fetchPolicy: 'network-only'})
  const { data } = useQuery(GetProductsForSbomDrift, {
    fetchPolicy: 'network-only',
    variables: {enabled: true,field: field,direction: direction}
  })

  // -------------- SBOM 1 --------------
  const [selectedGroupOne, setSelectedGroupOne] = useState('')
  const [selectedProdOne, setSelectedProdOne] = useState('')
  const [selectedVersionOne, setSelectedVersionOne] = useState(null)
  const [uniqVersionsOne, setUniqVersionsOne] = useState([])
  const [productListOne, setProductListOne] = useState([])
  const [firstSbomInfo, setFirstSbomInfo] = useState(null)

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
          console.log(res.data)
          setFirstSbomInfo(res.data.sbom)
        }
      })
    }
  }

  const onClearOne = () => {
    setFirstSbomInfo(null)
    setDrifts([])
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
  }, [selectedGroupOne])

  useEffect(() => {
    if (selectedProdOne !== '' && selectedVersionOne === null) {
      getProduct({
        variables: {
          id: selectedProdOne
        }
      }).then((res) => {
        if (res.data) {
          const data = sortByUpdatedAt(res?.data?.project?.sboms)
          if (data?.length > 0) {
            const versions = []
            data
              ?.filter(
                (item) => item?.projectVersion !== selectedVersionTwo?.label
              )
              ?.map((sbom) => {
                versions.push({
                  label: sbom?.projectVersion,
                  value: sbom?.id
                })
              })
            setUniqVersionsOne(versions)
            setSelectedVersionOne(null)
          } else {
            setUniqVersionsOne([])
            setSelectedVersionOne(null)
          }
        }
      })
    }
  }, [selectedProdOne])

  // ------------- SBOM 2 --------------
  const [selectedGroupTwo, setSelectedGroupTwo] = useState('')
  const [selectedProdTwo, setSelectedProdTwo] = useState('')
  const [selectedVersionTwo, setSelectedVersionTwo] = useState(null)
  const [uniqVersionsTwo, setUniqVersionsTwo] = useState([])
  const [productListTwo, setProductListTwo] = useState([])
  const [secondSbomInfo, setSecondSbomInfo] = useState(null)

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
    setDrifts([])
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
  }, [selectedGroupTwo])

  useEffect(() => {
    if (selectedProdTwo !== '' && selectedVersionTwo === null) {
      getProduct({
        variables: {
          id: selectedProdTwo
        }
      }).then((res) => {
        if (res.data) {
          const data = sortByUpdatedAt(res?.data?.project?.sboms)
          if (data?.length > 0) {
            const versions = []
            data
              ?.filter(
                (item) => item?.projectVersion !== selectedVersionOne?.label
              )
              ?.map((sbom) => {
                versions.push({
                  label: sbom?.projectVersion,
                  value: sbom?.id
                })
              })
            setUniqVersionsTwo(versions)
            setSelectedVersionTwo(null)
          } else {
            setSelectedVersionTwo(null)
            setUniqVersionsTwo([])
          }
        }
      })
    }
  }, [selectedProdTwo])

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
          console.log('dif', res?.data?.sbom?.sbomDrift)
          setDrifts(res?.data?.sbom?.sbomDrift)
        }
      })
    }
  }, [firstSbomInfo, secondSbomInfo])

  const handleCompare = () => {
    setIsLoading(true)
    !firstSbomInfo && onSubmitSbomOne()
    !secondSbomInfo && onSubmitSbomTwo()
  }

  return (
    <>
      {/* HEADER */}
      <Card p={5}>
        <Flex alignItems={'flex-start'} gap={5} justifyContent={'space-between'}>
          <HStack spacing={4} alignItems={'flex-start'}>
            <Icon as={FaScaleUnbalanced} h={'64px'} w={'64px'} color='blue.300' />
            <Stack spacing={0}>
              <Text fontWeight={'semibold'} fontSize={24}>SBOM Compare</Text>
              <Text>This tool lists compare two SBOMs and report results as added, removed, and modified components with their licenses, PURL, and CPEs compared</Text>
            </Stack>
          </HStack>
        </Flex>
      </Card>
      {/* SBOM SELECTIONS */}
      <Grid templateColumns='repeat(2, 1fr)' gap={6}>
        {/* SBOM ONE */}
        <GridItem w='100%'>
          <Card p={8} h='450px' overflowY='scroll'>
            <Flex alignItems={'flex-start'} flexWrap={'wrap'} justifyContent={'space-between'}>
              {firstSbomInfo ? (
                <Stack>
                  <Flex alignItems={'flex-end'} gap={1}>
                    <Heading fontWeight={'semibold'} color={'#333'} fontFamily={'inherit'} size='md'>
                      {firstSbomInfo?.project?.projectGroup?.name} :{' '}
                      {firstSbomInfo?.projectVersion}
                    </Heading>
                    <Badge px={1} width={'fit-content'}>Primary</Badge>
                  </Flex>
                  <Tag colorScheme='blue' width={'fit-content'} textTransform={'capitalize'}>
                    {firstSbomInfo?.project?.name}
                  </Tag>
                </Stack>
              ) : (
                <Heading fontWeight={'semibold'} fontFamily={'inherit'} size='md'>
                  Select First SBOM
                </Heading>
              )}
              {firstSbomInfo && !selectedSboms && (
                <IconButton icon={<FaX />} size='sm' colorScheme='red' onClick={onClearOne}/>
              )}
            </Flex>
            {firstSbomInfo ? (
              <SbomInfo data={firstSbomInfo} />
            ) : (
              <Stack spacing={4} direction={'column'} gap={2} mt={6}>
                {/* PROJECT GROUPS */}
                {data?.organization?.projectGroups?.nodes?.length > 0 && (
                  <FormControl fontSize={'sm'}>
                    <FormLabel htmlFor='groupOne' fontSize='md' color='gray.600'>
                      Product
                    </FormLabel>
                    <Select name='groupOne' id='groupOne' isDisabled={selectedSboms?.length > 0} value={selectedGroupOne} onChange={onSelectGroupOne}>
                      <option value=''>-- Select --</option>
                      {data?.organization?.projectGroups?.nodes?.map(
                        (item, index) => <option key={index} value={item.id}>{item.name}</option>
                      )}
                    </Select>
                  </FormControl>
                )}
                {/* ENVIRONMENT */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='productOne' fontSize='md' color='gray.600'>
                    Environment
                  </FormLabel>
                  <Select name='productOne' id='productOne' isDisabled={selectedSboms?.length > 0} value={selectedProdOne} onChange={onSelectProductOne} textTransform={'capitalize'}>
                    <option value={''}>-- Select --</option>
                    {productListOne?.length > 0 &&
                      envOrderList(productListOne).map((item, index) => (
                        <option key={index} value={item.value} style={{ textTransform: 'capitalize' }}>
                          {item.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* VERSION */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='versionOne' fontSize='md' color='gray.600'>
                    Version
                  </FormLabel>
                  {uniqVersionsOne.length > 0 ? (
                    <ReactSelect
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? 'inherit' : 'inherit',
                          fontSize: '14px',
                          padding: '2px 0',
                          '&:hover': {
                            borderColor: '#CBD5E0'
                          }
                        })
                      }}
                      components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null
                      }}
                      value={selectedVersionOne}
                      onChange={(value) => setSelectedVersionOne(value)}
                      className='react-select'
                      isSearchable
                      type='text'
                      placeholder='Select versions'
                      name='versions'
                      isDisabled={selectedSboms?.length > 0}
                      options={uniqVersionsOne}
                      noOptionsMessage={() => null}
                    />
                  ) : (
                    <Alert borderRadius={'md'} py={'8px'} status='info'>
                      <AlertIcon />
                      <AlertDescription>No version available</AlertDescription>
                    </Alert>
                  )}
                </FormControl>
              </Stack>
            )}
          </Card>
        </GridItem>
        {/* SBOM TWO */}
        <GridItem w='100%'>
          <Card p={8} h='450px' overflowY='scroll'>
            <Flex alignItems={'flex-start'} justifyContent={'space-between'}>
              {secondSbomInfo ? (
                <Stack>
                  <Heading fontWeight={'semibold'} color={'#333'} fontFamily={'inherit'} size='md'>
                    {secondSbomInfo?.project?.projectGroup?.name} :{' '}
                    {secondSbomInfo?.projectVersion}
                  </Heading>
                  <Tag colorScheme='blue' width={'fit-content'} textTransform={'capitalize'}>
                    {secondSbomInfo?.project?.name}
                  </Tag>
                </Stack>
              ) : (
                <Heading fontWeight={'semibold'} fontFamily={'inherit'} size='md'>
                  Select Second SBOM
                </Heading>
              )}
              {secondSbomInfo && !selectedSboms && (
                <IconButton icon={<FaX />} size='sm' colorScheme='red' onClick={onClearTwo}/>
              )}
            </Flex>
            {secondSbomInfo ? (
              <SbomInfo data={secondSbomInfo} />
            ) : (
              <Stack spacing={4} direction={'column'} gap={2} mt={6}>
                {/* PROJECT GROUPS */}
                {data?.organization?.projectGroups?.nodes?.length > 0 && (
                  <FormControl fontSize={'sm'}>
                    <FormLabel htmlFor='groupTwo' fontSize='md' color='gray.600'>
                      Product
                    </FormLabel>
                    <Select name='groupTwo' id='groupTwo' isDisabled={selectedVersionOne === null} value={selectedGroupTwo} onChange={onSelectGroupTwo}>
                      <option value=''>-- Select --</option>
                      {data?.organization?.projectGroups?.nodes?.map(
                        (item, index) => <option key={index} value={item.id}>{item.name}</option>
                      )}
                    </Select>
                  </FormControl>
                )}
                {/* ENVIRONMENT */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='productTwo' fontSize='md' color='gray.600'>
                    Environment
                  </FormLabel>
                  <Select name='productTwo' id='productTwo' value={selectedProdTwo} onChange={onSelectProductTwo} isDisabled={selectedVersionOne === null} textTransform={'capitalize'}>
                    <option value={''}>-- Select --</option>
                    {productListTwo?.length > 0 &&
                      envOrderList(productListTwo).map((item, index) => (
                        <option key={index} value={item.value} style={{ textTransform: 'capitalize' }}>
                          {item.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* VERSION */}
                <FormControl fontSize={'sm'}>
                  <FormLabel htmlFor='versionTwo' fontSize='md' color='gray.600'>
                    Version
                  </FormLabel>
                  {uniqVersionsTwo.length > 0 ? (
                    <ReactSelect
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? 'inherit' : 'inherit',
                          fontSize: '14px',
                          padding: '2px 0',
                          '&:hover': {
                            borderColor: '#CBD5E0'
                          }
                        })
                      }}
                      components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null
                      }}
                      value={selectedVersionTwo}
                      onChange={(value) => setSelectedVersionTwo(value)}
                      className='react-select'
                      isSearchable
                      type='text'
                      placeholder='Select versions'
                      name='versions'
                      options={uniqVersionsTwo}
                      noOptionsMessage={() => null}
                      isDisabled={selectedVersionOne === null}
                    />
                  ) : (
                    <Alert borderRadius={'md'} py={'8px'} status='info'>
                      <AlertIcon />
                      <AlertDescription>No version available</AlertDescription>
                    </Alert>
                  )}
                </FormControl>
                {/* SUBMIT */}
                {(!firstSbomInfo || !secondSbomInfo) && (
                  <Flex justifyContent={'flex-end'}>
                    <Button width={'fit-content'} colorScheme='blue' leftIcon={<FaCodeCompare />} onClick={handleCompare} isDisabled={!selectedVersionOne || !selectedVersionTwo}>
                      Compare
                    </Button>
                  </Flex>
                )}
              </Stack>
            )}
          </Card>
        </GridItem>
      </Grid>
      {/* SBOM DIFFERENCE */}
      <Card width='100%'>
        <DiffTable diffs={driftData?.sbom} data={drifts} setData={setDrifts} isLoading={isLoading} sbomOne={firstSbomInfo} sbomTwo={secondSbomInfo}/>
      </Card>
    </>
  )
}

export default Compare
