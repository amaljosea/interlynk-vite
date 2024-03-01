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
  Link,
  Select,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import {
  GetSbomDrift,
  GetProductsForSbomDrift,
  GetProductData,
  GetProject
} from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaTimes } from 'react-icons/fa'
import {
  FaCodeCompare,
  FaPlus,
  FaRecycle,
  FaScaleUnbalanced,
  FaTrash
} from 'react-icons/fa6'
import ReactSelect from 'react-select'
import { customStyles, getFullDateAndTime, envOrderList } from 'utils'
import ToolsFilterMenu from './Filters'
import { useLocation } from 'react-router-dom'

const SbomInfo = ({ data }) => {
  return (
    <TableContainer overflowY={'scroll'}>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody fontSize={'sm'}>
          {/* CREATION TOOLS */}
          <Tr>
            <Td pl={0}>Creation Tool</Td>
            <Td>
              <Flex
                flexDirection={'row'}
                alignItems={'flex-start'}
                flexWrap={'wrap'}
                gap={2.5}
              >
                {data?.tools &&
                  data?.tools.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='teal'
                      width={'fit-content'}
                    >
                      <TagLabel>
                        {item.name} - {item.version}
                      </TagLabel>
                    </Tag>
                  ))}
              </Flex>
            </Td>
          </Tr>
          {/* CREATED AT */}
          <Tr>
            <Td pl={0}>Created At</Td>
            <Td>{getFullDateAndTime(data?.creationAt)}</Td>
          </Tr>
          {/* AUTHOR */}
          <Tr>
            <Td pl={0}>Author</Td>
            <Td>
              <Stack spacing={2} direction={'column'}>
                {data?.authors.length > 0 &&
                  data?.authors.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='blue'
                      width={'fit-content'}
                    >
                      <TagLabel>
                        {item.name} - {item.email}
                      </TagLabel>
                    </Tag>
                  ))}
              </Stack>
            </Td>
          </Tr>
          {/* SUPPLOER */}
          <Tr>
            <Td pl={0}>Supplier</Td>
            <Td>
              <HStack spacing={4}>
                {data?.suppliers?.length > 0 &&
                  data?.suppliers.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='orange'
                    >
                      <TagLabel>
                        {item.contactName}
                        {item.contactEmail && ` (${item.contactEmail})`}
                        {item.url ? (
                          <Link
                            href={
                              item?.url?.startsWith('http')
                                ? item.url
                                : `http://${item.url}`
                            }
                            isExternal
                          >
                            {' '}
                            {item.name}
                          </Link>
                        ) : (
                          ` ${item.name}`
                        )}
                      </TagLabel>
                    </Tag>
                  ))}
              </HStack>
            </Td>
          </Tr>
          {/* DATA LICENSE */}
          <Tr>
            <Td pl={0}>Data License</Td>
            <Td>
              <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                {/* SPDX */}
                {data.licenses?.length > 0 &&
                  data.licenses?.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{item}</TagLabel>
                    </Tag>
                  ))}
                {/* EXPRESSION */}
                {data.licensesExp && data.licensesExp !== '' && (
                  <Tag
                    size={'md'}
                    variant='subtle'
                    colorScheme='green'
                    width={'fit-content'}
                  >
                    <TagLabel>{data.licensesExp}</TagLabel>
                  </Tag>
                )}
                {/* CUSTOM */}
                {data.licensesCustom?.length > 0 &&
                  data.licensesCustom.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{item}</TagLabel>
                    </Tag>
                  ))}
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  )
}

const Compare = ({ selectedSboms }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const activeEnv = localStorage.getItem('activeEnv')

  const { prodState } = useGlobalState()
  const { field, direction } = prodState

  const [drifts, setDrifts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [getProduct] = useLazyQuery(GetProject, { fetchPolicy: 'network-only' })
  const [getSbomData] = useLazyQuery(GetProductData, {
    fetchPolicy: 'network-only'
  })
  const [getDrift, { data: driftData }] = useLazyQuery(GetSbomDrift, {
    fetchPolicy: 'network-only'
  })
  const { data } = useQuery(GetProductsForSbomDrift, {
    fetchPolicy: 'network-only',
    variables: {
      enabled: true,
      field: field,
      direction: direction
    }
  })

  // COLUMNS
  const columns = [
    {
      id: 'DIFFERENCE',
      name: 'DIFFERENCE',
      selector: (row) => {
        const { diffType } = row
        return (
          <Badge
            width={24}
            p={2}
            textTransform={'capitalize'}
            textAlign={'center'}
            colorScheme={
              diffType === 'added'
                ? 'green'
                : diffType === 'removed'
                  ? 'red'
                  : 'blue'
            }
            leftIcon={
              diffType === 'added' ? (
                <FaPlus />
              ) : diffType === 'removed' ? (
                <FaTrash />
              ) : (
                <FaRecycle />
              )
            }
          >
            {diffType}
          </Badge>
        )
      },
      wrap: true,
      width: '200px'
    },
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => (
        <Text>{row?.subjectComponent?.name || row?.targetComponent?.name}</Text>
      ),
      width: '250px',
      wrap: true
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { subjectComponent, targetComponent, diffTags } = row
        if (diffTags?.includes('version')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.version}
              </Tag>
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.version}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag py={1.5}>
              {subjectComponent?.version || targetComponent?.version}
            </Tag>
          )
        }
      },
      width: '200px',
      wrap: true
    },
    {
      id: 'LICENSE EXP',
      name: 'LICENSE EXP',
      selector: (row) => {
        const { subjectComponent, targetComponent, diffTags } = row
        if (diffTags?.includes('license_exp')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.licensesExp}
              </Tag>
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.licensesExp}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag my={4} py={1.5}>
              {subjectComponent?.licensesExp ||
                targetComponent?.licensesExp ||
                '-'}
            </Tag>
          )
        }
      },
      width: '220px',
      wrap: true
    },
    {
      id: 'PURL',
      name: 'PURL',
      selector: (row) => {
        const { subjectComponent, targetComponent, diffTags } = row
        if (diffTags?.includes('purl')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.purl || '-'}
              </Tag>
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.purl || '-'}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag my={4} py={1.5}>
              {subjectComponent?.purl || targetComponent?.purl || '-'}
            </Tag>
          )
        }
      },
      width: '360px',
      wrap: true
    },
    {
      id: 'CPE',
      name: 'CPE',
      selector: (row) => {
        const { subjectComponent, targetComponent, diffTags } = row
        if (diffTags?.includes('cpe')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.cpe?.length > 0 && targetComponent?.cpe[0]}
              </Tag>
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.cpe?.length > 0 && subjectComponent?.cpe[0]}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag py={1.5}>
              {(targetComponent?.cpe?.length > 0 && targetComponent?.cpe[0]) ||
                (subjectComponent?.cpe?.length > 0 &&
                  subjectComponent?.cpe[0]) ||
                '-'}
            </Tag>
          )
        }
      },
      width: '250px',
      wrap: true
    }
  ]

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-start'}
        mb={4}
        px={4}
      >
        <ToolsFilterMenu
          data={driftData?.sbom?.sbomDrift}
          setData={setDrifts}
        />
      </Flex>
    )
  }, [drifts, setDrifts])

  // -------------- SBOM 1 --------------
  const [selectedGroupOne, setSelectedGroupOne] = useState('')
  const [selectedProdOne, setSelectedProdOne] = useState('')
  const [selectedVersionOne, setSelectedVersionOne] = useState(null)
  const [uniqVersionsOne, setUniqVersionsOne] = useState([])
  const [productListOne, setProductListOne] = useState([])
  const [firstSbomInfo, setFirstSbomInfo] = useState(null)

  const onSelectGroupOne = (e) => {
    setSelectedGroupOne(e.target.value)
    setSelectedVersionOne(null)
    setSelectedProdOne('')
  }

  const onSelectProductOne = (e) => {
    const { value } = e.target
    setSelectedVersionOne(null)
    setSelectedProdOne(value)
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
    setSelectedGroupOne('')
    setSelectedProdOne('')
    setSelectedVersionOne(null)
    setProductListOne([])
    setUniqVersionsOne([])
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
          const data = [...res?.data?.project?.sboms]?.sort((a, b) => {
            const dateA = new Date(a.updatedAt)
            const dateB = new Date(b.updatedAt)
            return dateB - dateA
          })
          if (data?.length > 0) {
            const versions = []
            data
              ?.filter(
                (item) =>
                  item.id !== selectedVersionTwo?.value &&
                  item?.projectVersion !== selectedVersionTwo?.label
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
    setSelectedVersionTwo(null)
    setSelectedProdTwo('')
  }

  const onSelectProductTwo = (e) => {
    const { value } = e.target
    setSelectedVersionTwo(null)
    setSelectedProdTwo(value)
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
    setSelectedGroupTwo('')
    setSelectedProdTwo('')
    setSelectedVersionTwo(null)
    setProductListTwo([])
    setUniqVersionsTwo([])
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
          const data = [...res?.data?.project?.sboms]?.sort((a, b) => {
            const dateA = new Date(a.updatedAt)
            const dateB = new Date(b.updatedAt)
            return dateB - dateA
          })
          if (data?.length > 0) {
            const versions = []
            data
              ?.filter(
                (item) =>
                  item.id !== selectedVersionOne?.value &&
                  item?.projectVersion !== selectedVersionOne?.label
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

  const sortByUpdatedAt = (data) => {
    const sortedData = [...data]?.sort((a, b) => {
      const dateA = new Date(a.updatedAt)
      const dateB = new Date(b.updatedAt)
      return dateB - dateA
    })
    return sortedData
  }

  const filterSbom = (data, activeVerion) => {
    const versionList = []
    data
      ?.filter(
        (item) =>
          item.id !== activeVerion?.id &&
          item?.projectVersion !== activeVerion?.projectVersion
      )
      ?.map((sbom) => {
        versionList.push({
          label: sbom?.projectVersion,
          value: sbom?.id
        })
      })
    return versionList
  }

  useEffect(() => {
    if (productId) {
      setSelectedGroupOne(productId)
      setSelectedGroupTwo(productId)
      const activeGroup = data?.organization?.projectGroups?.nodes.find(
        (item) => item.id === productId
      )
      const result = activeGroup?.projects?.map((option) => ({
        value: option.id,
        label: option.name
      }))
      setProductListOne(result)
      setProductListTwo(result)
      setSelectedProdOne(activeEnv)
      setSelectedProdTwo(activeEnv)
      getProduct({
        variables: {
          id: activeEnv
        }
      }).then((res) => {
        if (res.data) {
          const activeSboms = sortByUpdatedAt(selectedSboms)
          console.log('activeSboms', activeSboms)
          const versions = sortByUpdatedAt(res?.data?.project?.sboms)
          if (versions?.length > 0) {
            const versionsOne = filterSbom(versions, activeSboms[1])
            console.log('versionsOne', versionsOne)
            const versionsTwo = filterSbom(versions, activeSboms[0])
            console.log('versionsTwo', versionsTwo)
            setUniqVersionsOne(versionsOne)
            setUniqVersionsTwo(versionsTwo)
            setSelectedVersionOne({
              value: activeSboms[0]?.id,
              label: activeSboms[0]?.projectVersion
            })
            setSelectedVersionTwo({
              value: activeSboms[1]?.id,
              label: activeSboms[1]?.projectVersion
            })
          }
        }
      })
    }
  }, [productId, data])

  return (
    <>
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
              color='blue.300'
            />
            <Stack spacing={0}>
              <Text fontWeight={'semibold'} fontSize={24}>
                SBOM Comparison
              </Text>
              <Text>
                It refers to the process of comparing SBOMs from different
                software packages or versions.{' '}
              </Text>
            </Stack>
          </HStack>
          {(!firstSbomInfo || !secondSbomInfo) && (
            <Button
              colorScheme='blue'
              rightIcon={<FaCodeCompare />}
              onClick={handleCompare}
              isDisabled={!selectedVersionOne || !selectedVersionTwo}
            >
              Compare
            </Button>
          )}
        </Flex>
      </Card>
      {/* SBOM SELECTIONS */}
      <Grid templateColumns='repeat(2, 1fr)' gap={6}>
        {/* SBOM ONE */}
        <GridItem w='100%'>
          <Card p={10} h='450px' overflowY='scroll'>
            <Flex
              alignItems={'flex-start'}
              flexWrap={'wrap'}
              justifyContent={'space-between'}
            >
              {firstSbomInfo ? (
                <Stack>
                  <Heading
                    fontWeight={'semibold'}
                    color={'#333'}
                    fontFamily={'inherit'}
                    size='md'
                  >
                    {firstSbomInfo?.project?.projectGroup?.name} :{' '}
                    {firstSbomInfo?.projectVersion}
                  </Heading>
                  <Tag colorScheme='blue' width={'fit-content'}>
                    {firstSbomInfo?.project?.name}
                  </Tag>
                </Stack>
              ) : (
                <Heading
                  fontWeight={'semibold'}
                  fontFamily={'inherit'}
                  size='md'
                >
                  Select First SBOM
                </Heading>
              )}
              {firstSbomInfo && !selectedSboms && (
                <Button
                  leftIcon={<FaTimes />}
                  size='sm'
                  colorScheme={'red'}
                  onClick={onClearOne}
                >
                  Clear
                </Button>
              )}
            </Flex>
            {firstSbomInfo ? (
              <SbomInfo data={firstSbomInfo} />
            ) : (
              <Stack spacing={4} direction={'column'} gap={2} mt={6}>
                {/* PROJECT GROUPS */}
                {data?.organization?.projectGroups?.nodes?.length > 0 && (
                  <FormControl fontSize={'sm'}>
                    <FormLabel
                      htmlFor='groupOne'
                      fontSize='md'
                      color='gray.600'
                    >
                      Product
                    </FormLabel>
                    <Select
                      name='groupOne'
                      id='groupOne'
                      isDisabled={selectedSboms?.length > 0}
                      value={selectedGroupOne}
                      onChange={onSelectGroupOne}
                    >
                      <option value=''>-- Select --</option>
                      {data?.organization?.projectGroups?.nodes?.map(
                        (item, index) => (
                          <option key={index} value={item.id}>
                            {item.name}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                )}
                {/* ENVIRONMENT */}
                <FormControl fontSize={'sm'}>
                  <FormLabel
                    htmlFor='productOne'
                    fontSize='md'
                    color='gray.600'
                  >
                    Environment
                  </FormLabel>
                  <Select
                    name='productOne'
                    id='productOne'
                    isDisabled={selectedSboms?.length > 0}
                    value={selectedProdOne}
                    onChange={onSelectProductOne}
                    textTransform={'capitalize'}
                  >
                    <option value={''}>-- Select --</option>
                    {productListOne?.length > 0 &&
                      envOrderList(productListOne).map((item, index) => (
                        <option
                          key={index}
                          value={item.value}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {item.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* VERSION */}
                <FormControl fontSize={'sm'}>
                  <FormLabel
                    htmlFor='versionOne'
                    fontSize='md'
                    color='gray.600'
                  >
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
          <Card p={10} h='450px' overflowY='scroll'>
            <Flex alignItems={'flex-start'} justifyContent={'space-between'}>
              {secondSbomInfo ? (
                <Stack>
                  <Heading
                    fontWeight={'semibold'}
                    color={'#333'}
                    fontFamily={'inherit'}
                    size='md'
                  >
                    {secondSbomInfo?.project?.projectGroup?.name} :{' '}
                    {secondSbomInfo?.projectVersion}
                  </Heading>
                  <Tag colorScheme='blue' width={'fit-content'}>
                    {secondSbomInfo?.project?.name}
                  </Tag>
                </Stack>
              ) : (
                <Heading
                  fontWeight={'semibold'}
                  fontFamily={'inherit'}
                  size='md'
                >
                  Select Second SBOM
                </Heading>
              )}
              {secondSbomInfo && !selectedSboms && (
                <Button
                  leftIcon={<FaTimes />}
                  size='sm'
                  colorScheme='red'
                  onClick={onClearTwo}
                >
                  Clear
                </Button>
              )}
            </Flex>
            {secondSbomInfo ? (
              <SbomInfo data={secondSbomInfo} />
            ) : (
              <Stack spacing={4} direction={'column'} gap={2} mt={6}>
                {/* PROJECT GROUPS */}
                {data?.organization?.projectGroups?.nodes?.length > 0 && (
                  <FormControl fontSize={'sm'}>
                    <FormLabel
                      htmlFor='groupTwo'
                      fontSize='md'
                      color='gray.600'
                    >
                      Product
                    </FormLabel>
                    <Select
                      name='groupTwo'
                      id='groupTwo'
                      isDisabled={selectedSboms?.length > 0}
                      value={selectedGroupTwo}
                      onChange={onSelectGroupTwo}
                    >
                      <option value=''>-- Select --</option>
                      {data?.organization?.projectGroups?.nodes?.map(
                        (item, index) => (
                          <option key={index} value={item.id}>
                            {item.name}
                          </option>
                        )
                      )}
                    </Select>
                  </FormControl>
                )}
                {/* ENVIRONMENT */}
                <FormControl fontSize={'sm'}>
                  <FormLabel
                    htmlFor='productTwo'
                    fontSize='md'
                    color='gray.600'
                  >
                    Environment
                  </FormLabel>
                  <Select
                    name='productTwo'
                    id='productTwo'
                    value={selectedProdTwo}
                    onChange={onSelectProductTwo}
                    isDisabled={selectedSboms?.length > 0}
                    textTransform={'capitalize'}
                  >
                    <option value={''}>-- Select --</option>
                    {productListTwo?.length > 0 &&
                      envOrderList(productListTwo).map((item, index) => (
                        <option
                          key={index}
                          value={item.value}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {item.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {/* VERSION */}
                <FormControl fontSize={'sm'}>
                  <FormLabel
                    htmlFor='versionTwo'
                    fontSize='md'
                    color='gray.600'
                  >
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
                      isDisabled={selectedSboms?.length > 0}
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
      </Grid>
      {/* SBOM DIFFERENCE */}
      <Card width='100%'>
        <DataTable
          columns={columns}
          data={drifts || []}
          customStyles={customStyles}
          progressPending={isLoading}
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          persistTableHead
          responsive={true}
        />
      </Card>
    </>
  )
}

export default Compare
