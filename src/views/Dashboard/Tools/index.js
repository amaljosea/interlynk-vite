import { useLazyQuery, useQuery } from '@apollo/client'
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
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
import { GetSbomDrift, GetProductsForSbomDrift, GetProductData, GetProject } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { FaTimes } from 'react-icons/fa'
import { FaPlus, FaRecycle, FaTrash } from 'react-icons/fa6'
import { customStyles } from 'utils'
import { getFullDateAndTime, envOrderList } from 'utils'

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

const Tools = () => {
  const { totalRows, prodState } = useGlobalState()
  const { field, direction } = prodState

  const [drifts, setDrifts] = useState([])

  const [getProduct] = useLazyQuery(GetProject, { fetchPolicy: 'network-only' })
  const [getSbomData] = useLazyQuery(GetProductData, {
    fetchPolicy: 'network-only'
  })
  const [getDrift] = useLazyQuery(GetSbomDrift, {
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
          <Button
            width={'130px'}
            size='sm'
            pointerEvents={'none'}
            textTransform={'capitalize'}
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
          </Button>
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
      width: '320px',
      wrap: true
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { subjectComponent, targetComponent } = row
        return (
          <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
            {targetComponent?.version && (
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.version}
              </Tag>
            )}
            {subjectComponent?.version && (
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.version}
              </Tag>
            )}
          </Flex>
        )
      },
      width: '200px',
      wrap: true
    },
    {
      id: 'PURL',
      name: 'PURL',
      selector: (row) => {
        const { subjectComponent, targetComponent } = row
        return (
          <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
            {targetComponent?.purl && (
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.purl}
              </Tag>
            )}
            {subjectComponent?.purl && (
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.purl}
              </Tag>
            )}
          </Flex>
        )
      },
      width: '400px',
      wrap: true
    },
    {
      id: 'CPE',
      name: 'CPE',
      selector: (row) => {
        const { subjectComponent, targetComponent } = row
        return (
          <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
            {targetComponent?.cpe?.length > 0 && (
              <Tag py={1.5} colorScheme='red'>
                {targetComponent?.cpe[0]}
              </Tag>
            )}
            {subjectComponent?.cpe?.length > 0 && (
              <Tag py={1.5} colorScheme='green'>
                {subjectComponent?.cpe[0]}
              </Tag>
            )}
          </Flex>
        )
      },
      width: '250px',
      wrap: true
    }
  ]

  // -------------- SBOM 1 --------------
  const [selectedGroupOne, setSelectedGroupOne] = useState('')
  const [selectedProdOne, setSelectedProdOne] = useState('')
  const [selectedVersionOne, setSelectedVersionOne] = useState('')
  const [versionNameOne, setVersionNameOne] = useState('')
  const [uniqVersionsOne, setUniqVersionsOne] = useState([])
  const [productListOne, setProductListOne] = useState([])
  const [firstSbomInfo, setFirstSbomInfo] = useState(null)

  const onSelectGroupOne = (e) => {
    setSelectedGroupOne(e.target.value)
    setSelectedVersionOne('')
    setVersionNameOne('')
    setSelectedProdOne('')
  }

  const onSelectProductOne = (e) => {
    const { value } = e.target
    setSelectedVersionOne('')
    setVersionNameOne('')
    setSelectedProdOne(value)
  }

  const onSubmitSbomOne = () => {
    getSbomData({
      variables: {
        projectId: selectedProdOne,
        sbomId: selectedVersionOne
      }
    }).then((res) => {
      if (res?.data) {
        console.log(res.data)
        setFirstSbomInfo(res.data.sbom)
      }
    })
  }

  const onClearOne = () => {
    setSelectedGroupOne('')
    setSelectedProdOne('')
    setSelectedVersionOne('')
    setVersionNameOne('')
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
    if (selectedProdOne !== '' && selectedVersionOne === '') {
      getProduct({
        variables: {
          id: selectedProdOne
        }
      }).then((res) => {
        if (res.data) {
          const data = res?.data?.project?.sboms
          if (data?.length > 0) {
            setUniqVersionsOne(data)
            setSelectedVersionOne('')
          } else {
            setSelectedVersionOne('')
            setUniqVersionsOne([])
          }
        }
      })
    }
  }, [selectedProdOne])

  // ------------- SBOM 2 --------------
  const [selectedGroupTwo, setSelectedGroupTwo] = useState('')
  const [selectedProdTwo, setSelectedProdTwo] = useState('')
  const [selectedVersionTwo, setSelectedVersionTwo] = useState('')
  const [versionNameTwo, setVersionNameTwo] = useState('')
  const [uniqVersionsTwo, setUniqVersionsTwo] = useState([])
  const [productListTwo, setProductListTwo] = useState([])
  const [secondSbomInfo, setSecondSbomInfo] = useState(null)

  const onSelectGroupTwo = (e) => {
    setSelectedGroupTwo(e.target.value)
    setSelectedVersionTwo('')
    setVersionNameTwo('')
    setSelectedProdTwo('')
  }

  const onSelectProductTwo = (e) => {
    const { value } = e.target
    setSelectedVersionTwo('')
    setVersionNameTwo('')
    setSelectedProdTwo(value)
  }

  const onSubmitSbomTwo = () => {
    getSbomData({
      variables: {
        projectId: selectedProdTwo,
        sbomId: selectedVersionTwo
      }
    }).then((res) => {
      if (res?.data) {
        setSecondSbomInfo(res.data.sbom)
      }
    })
  }

  const onClearTwo = () => {
    setSelectedGroupTwo('')
    setSelectedProdTwo('')
    setSelectedVersionTwo('')
    setVersionNameTwo('')
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
    if (selectedProdTwo !== '' && selectedVersionTwo === '') {
      getProduct({
        variables: {
          id: selectedProdTwo
        }
      }).then((res) => {
        if (res.data) {
          const data = res?.data?.project?.sboms
          if (data?.length > 0) {
            setUniqVersionsTwo(data)
            setSelectedVersionTwo('')
          } else {
            setSelectedVersionTwo('')
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
          subjectSbomId: selectedVersionOne,
          targetSbomId: selectedVersionTwo
        }
      }).then((res) => {
        if (res?.data) {
          console.log('dif', res?.data?.sbom?.sbomDrift)
          setDrifts(res?.data?.sbom?.sbomDrift)
        }
      })
    }
  }, [firstSbomInfo, secondSbomInfo])

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
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
                  <Text></Text>
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
              {firstSbomInfo && (
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
                    <Select
                      name='versionOne'
                      id='versionOne'
                      value={selectedVersionOne}
                      onChange={(e) => {
                        setSelectedVersionOne(e.target.value)
                        const version =
                          e.target.options[e.target.selectedIndex].text
                        setVersionNameOne(version)
                      }}
                    >
                      <option value={''}>-- Select --</option>
                      {uniqVersionsOne
                        ?.filter(
                          (item) =>
                            item.id !== selectedVersionTwo &&
                            item?.projectVersion !== versionNameTwo
                        )
                        .map((item, index) => (
                          <option key={index} value={item.id}>
                            {item?.projectVersion}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <Alert borderRadius={'md'} py={'8px'} status='info'>
                      <AlertIcon />
                      No version available
                    </Alert>
                  )}
                </FormControl>
                {/* SUBMIT */}
                <Button
                  width={'fit-content'}
                  colorScheme='blue'
                  onClick={onSubmitSbomOne}
                  isDisabled={
                    selectedProdOne === '' || selectedVersionOne === ''
                  }
                >
                  Submit
                </Button>
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
                  <Text></Text>
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
              {secondSbomInfo && (
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
                    <Select
                      name='versionTwo'
                      id='versionTwo'
                      value={selectedVersionTwo}
                      onChange={(e) => {
                        setSelectedVersionTwo(e.target.value)
                        const version =
                          e.target.options[e.target.selectedIndex].text
                        setVersionNameTwo(version)
                      }}
                    >
                      <option value={''}>-- Select --</option>
                      {uniqVersionsTwo
                        ?.filter(
                          (item) =>
                            item.id !== selectedVersionOne &&
                            item?.projectVersion !== versionNameOne
                        )
                        ?.map((item, index) => (
                          <option key={index} value={item.id}>
                            {item?.projectVersion}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <Alert borderRadius={'md'} py={'8px'} status='info'>
                      <AlertIcon />
                      No version available
                    </Alert>
                  )}
                </FormControl>
                {/* SUBMIT */}
                <Button
                  width={'fit-content'}
                  colorScheme='blue'
                  onClick={onSubmitSbomTwo}
                  isDisabled={
                    selectedProdTwo === '' || selectedVersionTwo === ''
                  }
                >
                  Submit
                </Button>
              </Stack>
            )}
          </Card>
        </GridItem>
      </Grid>
      {/* SBOM DIFFERENCE */}
      <Card width='100%' mt={6}>
        <DataTable
          columns={columns}
          data={drifts || []}
          customStyles={customStyles}
          persistTableHead
          responsive={true}
        />
      </Card>
    </Flex>
  )
}

export default Tools
