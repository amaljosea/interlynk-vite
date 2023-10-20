// Chakra imports
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons'
import {
  Flex,
  Text,
  useDisclosure,
  Tag,
  TagLabel,
  Icon,
  useColorModeValue,
  Button,
  Link,
  Box,
  Grid,
  GridItem,
  Tooltip,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  FormControl,
  FormLabel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  IconButton,
  ButtonGroup
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaEllipsisV } from 'react-icons/fa'
import { FaCopy } from 'react-icons/fa6'
import { useState, useRef, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styled from '@emotion/styled'
import CopyTable from './CopyTable'
import Multistep from 'views/Sbom/components/Multistep'
import { getFullDateAndTime } from 'utils'
import ProdStatusDrawer from 'components/Drawer/ProdStatusDrawer'
import VulnFilterMenu from 'views/Sbom/components/VulnFilterMenu'
import { sevColor } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  },
  subHeader: {
    style: {
      padding: 0,
      margin: 0
    }
  }
}

const statusColor = (status) => {
  if (status && status === 'Fixed') {
    return 'blue'
  } else if (status && status === 'Not Affected') {
    return 'green'
  } else if (status && status === 'Affected') {
    return 'red'
  } else if (status && status === 'False Positive') {
    return 'gray'
  } else {
    return 'cyan'
  }
}

const VulnTable = ({
  data,
  refetch,
  productId,
  sbomId,
  pageIndex,
  setPageIndex,
  filteredData,
  totalRows,
  setTotalRows,
  filterHeads,
  filterRefetch
}) => {
  const location = useLocation()
  const toast = useToast()
  const customerView = location.pathname.startsWith('/customer')

  const textColor = useColorModeValue('gray.700', 'white')

  const [activeRow, setActiveRow] = useState(null)
  const [version, setVersion] = useState('')

  // STEPS
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)

  const [stepTitle, setStepTitle] = useState('')

  const [filterText, setFilterText] = useState('')

  const btnRef = useRef(null)
  const tableRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isCopyOpen,
    onOpen: onCopyOpen,
    onClose: onCopyClose
  } = useDisclosure()

  const {
    isOpen: isTableOpen,
    onOpen: onTableOpen,
    onClose: onTableClose
  } = useDisclosure()

  const cvssColor = (cvss) => {
    if (cvss >= 9.0) {
      return 'red'
    } else if (cvss >= 7.0) {
      return 'orange'
    } else if (cvss >= 6.0) {
      return 'yellow'
    } else {
      return 'green'
    }
  }

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'cve',
      name: 'CVE ID',
      selector: (row) => {
        const { vuln } = row
        return (
          <Link href={linkURl(vuln.source, vuln.vulnId)} target={'_blank'}>
            <Flex direction='row' alignItems={'center'} gap={2}>
              <Icon
                as={ExternalLinkIcon}
                h={'16px'}
                w={'16px'}
                color={'blue.500'}
              />
              <Tooltip label={vuln.vulnId} placement={'top'}>
                <Text fontSize='sm' color={textColor}>
                  {vuln.vulnId !== null
                    ? `${vuln.vulnId?.substring(0, 15)}${
                        vuln.vulnId.length > 15 ? '...' : ''
                      }`
                    : ''}
                </Text>
              </Tooltip>
            </Flex>
          </Link>
        )
      },
      width: '200px'
    },
    // SEVERITY
    {
      id: 'serverity',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            size='md'
            key='md'
            variant='subtle'
            colorScheme={sevColor(`${vuln.sev}`)}
          >
            <TagLabel>{vuln.sev}</TagLabel>
          </Tag>
        )
      },
      width: '150px'
    },
    // SOURCE
    {
      id: 'source',
      name: 'SOURCE',
      selector: (row) => {
        const { vuln } = row
        return (
          <Tag
            size='sm'
            key='md'
            variant='solid'
            colorScheme={vuln.source === 'osv' ? 'red' : 'blue'}
            textTransform={'uppercase'}
            width={'100%'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <TagLabel>{vuln.source}</TagLabel>
          </Tag>
        )
      },
      width: '110px'
    },
    // CVSS
    {
      id: 'cvss',
      name: 'CVSS',
      selector: (row) => {
        const { vuln } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              colorScheme={cvssColor(vuln.cvssScore)}
            >
              <TagLabel>{vuln.cvssScore ? vuln.cvssScore : 0}</TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '100px'
    },
    // COMPONENT
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Tooltip label={component.name} placement='top'>
            <Text textTransform={'capitalize'}>
              {component.name !== null
                ? `${component.name?.substring(0, 30)}${
                    component.name.length > 30 ? '...' : ''
                  }`
                : ''}
            </Text>
          </Tooltip>
        )
      },
      width: '250px'
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.component.version,
      width: '130px'
    },
    // STATUS
    {
      id: 'status',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            fontWeight={'normal'}
            variant='solid'
            size='sm'
            colorScheme={statusColor(vexStatus ? vexStatus.name : 'In Triage')}
          >
            {vexStatus !== null ? vexStatus.name : 'In Triage'}
          </Tag>
        )
      }
    },
    // // UPDATED AT
    // {
    //   id: 'updatedAt',
    //   name: 'UPDATED AT',
    //   selector: (row) => getFullDateAndTime(row.vuln.updatedAt),
    //   sortable: true
    // },
    // ACTION
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        return (
          <>
            {!customerView && (
              <Button
                p='0px'
                bg='transparent'
                ref={btnRef}
                onClick={() => {
                  setActiveRow(row)
                  onOpen()
                }}
              >
                <Icon as={FaEllipsisV} color='gray.400' cursor='pointer' />
              </Button>
            )}
          </>
        )
      },
      omit: customerView
    }
  ]

  const handleCopy = () => {
    if (version !== '') {
      onCopyClose()
      onTableOpen()
    } else {
      toast({
        description: 'Please select any version',
        position: 'top',
        duration: 2000,
        status: 'error'
      })
    }
  }

  // SEARCH COMPONENT
  // const handleSearch = async (event) => {
  //   if (event.key === 'Enter') {
  //     await refetch({
  //       projectId: productId,
  //       sbomId: sbomId,
  //       search: filterText,
  //       first: totalRows,
  //       last: undefined,
  //       after: undefined,
  //       last: undefined,
  //       field: 'UPDATED_AT',
  //       direction: 'DESC'
  //     })
  //     setPageIndex(1)
  //   }
  // }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      search: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
  }

  const filteredItems =
    data &&
    data.nodes.filter(
      (item) =>
        (item.vuln.vulnId &&
          item.vuln.vulnId.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.vuln.desc &&
          item.vuln.desc.toLowerCase().includes(filterText.toLowerCase()))
    )

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={4}
          alignItems={'flex-start'}
        >
          {/* SEARCH COMPONENTS */}
          {/* <Flex alignItems={'center'} gap={4}>
            <Box position='relative' width={'300px'}>
              <Input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={handleSearch}
                placeholder='Search vulnerabilities'
                ref={searchInputRef}
              />
              {filterText !== '' && (
                <CloseIcon
                  w={'18px'}
                  h={'18px'}
                  bg={'blue.500'}
                  color={'white'}
                  p={1}
                  rounded={'full'}
                  position={'absolute'}
                  zIndex={9999}
                  right={3}
                  top={'11px'}
                  onClick={handleClear}
                  cursor={'pointer'}
                />
              )}
            </Box>
          </Flex> */}
          <SearchFilter
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHeads && (
            <VulnFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              compNames={filterHeads.sbom.filters.vulnCompNames}
              statuses={filterHeads.sbom.filters.vulnStatuses}
              severities={filterHeads.sbom.filters.vulnSeverities}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
            />
          )}
        </Stack>

        <Tooltip label='Import Statuses'>
          <IconButton
            variant='solid'
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            onClick={onTableOpen}
            icon={<FaCopy size={18} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [filterText, filterHeads, handleClear, filteredItems, filterText])

  const ExpandedComponent = ({ data }) => {
    const { vuln } = data

    const CustomText = styled(Text)`
      font-size: 13px;
      font-weight: bold;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    `

    return (
      <Box
        width={'100%'}
        p={5}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid
          templateColumns='repeat(3, 1fr)'
          gap={6}
          width={'80%'}
          margin={'0 auto'}
        >
          <GridItem w='100%' colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text mt={1} fontSize={14}>
              {vuln.desc}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Last Modified At :</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.lastModifiedAt)}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>Published At :</CustomText>
            <Text mt={1} fontSize={14}>
              {getFullDateAndTime(vuln.publishedAt)}
            </Text>
          </GridItem>
          <GridItem w='100%'>
            <CustomText>NVD Alias ID :</CustomText>
            {vuln.nvdAliasId && (
              <Link href={linkURl('nvd', vuln.nvdAliasId)} target={'_blank'}>
                <Flex mt={1} direction='row' alignItems={'center'} gap={2}>
                  <Icon
                    as={ExternalLinkIcon}
                    h={'16px'}
                    w={'16px'}
                    color={'blue.500'}
                  />
                  <Tooltip label={vuln.nvdAliasId} placement={'top'}>
                    <Text fontSize='sm' color={textColor}>
                      {vuln.nvdAliasId}
                    </Text>
                  </Tooltip>
                </Flex>
              </Link>
            )}
          </GridItem>
        </Grid>
      </Box>
    )
  }

  const handleSubmit = () => {
    setStep(1)
    setProgress(25)
    onTableClose()
    toast({
      description: 'Data Imported successsfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  const onPreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: undefined,
      last: totalRows,
      before: data.pageInfo.startCursor,
      after: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
  }

  const onNextPage = () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
  }

  const handleSort = (column, sortDirection) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      field: column.name,
      direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    await refetch({
      projectId: productId,
      sbomId: sbomId,
      first: Number(e.target.value),
      last: undefined,
      after: undefined,
      last: undefined,
      search: undefined,
      field: 'UPDATED_AT',
      direction: 'DESC'
    })
    setFilterText('')
    setPageIndex(1)
  }

  useEffect(() => {
    if (step === 1) {
      setStepTitle('Select source of data')
    } else if (step === 2) {
      setStepTitle('Select fields to be imported')
    } else if (step === 3) {
      setStepTitle('Choose import defaults')
    } else if (step === 4) {
      setStepTitle('Review vulnerability import')
    }
  }, [step])

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={filteredItems.length > 0 ? filteredItems : data.nodes}
          customStyles={customStyles}
          onSort={handleSort}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          expandableRows
          expandableRowsComponent={ExpandedComponent}
        />
      </Flex>

      {/* PAGINATION */}
      {!filteredItems && (
        <Flex
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'space-between'}
        >
          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Button
              colorScheme='blue'
              onClick={onPreviousPage}
              isDisabled={!data.pageInfo.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              colorScheme='blue'
              onClick={onNextPage}
              isDisabled={!data.pageInfo.hasNextPage}
            >
              Next
            </Button>
            <Box>
              Page {pageIndex} of{' '}
              {data.totalCount === 0
                ? 1
                : Math.ceil(data.totalCount / totalRows)}
            </Box>
          </Stack>

          <Stack alignItems={'center'} direction={'row'} spacing={4}>
            <Text>Show</Text>
            <Select width={20} value={totalRows} onChange={handleSetRow}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Stack>
        </Flex>
      )}

      {/* COPY MODAL */}
      {isCopyOpen && (
        <Modal isOpen={isCopyOpen} onClose={onCopyClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Import Vulnerability Statuses</ModalHeader>
            <ModalBody mt={2}>
              <FormControl>
                <FormLabel>Import From:</FormLabel>
                <Select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                >
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <option key={index} value={item.id} name={item.version}>
                        {item.version}
                      </option>
                    ))
                  ) : (
                    <option value=''>-- --</option>
                  )}
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onCopyClose}>
                Cancel
              </Button>
              <Button variant='solid' colorScheme='blue' onClick={handleCopy}>
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* COPY DATA TABLE */}
      {isTableOpen && (
        <Drawer
          isOpen={isTableOpen}
          placement='right'
          size='full'
          onClose={onTableClose}
          finalFocusRef={tableRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <Text fontSize={20} fontWeight={'medium'}>
                {stepTitle}
              </Text>
            </DrawerHeader>

            <DrawerBody mt={2}>
              {/* IMPORT WIZARD */}
              <Multistep step={step} progress={progress} />
            </DrawerBody>

            <DrawerFooter>
              <Stack
                width={'100%'}
                justifyContent={'space-between'}
                direction={'row'}
                spacing={4}
              >
                <ButtonGroup>
                  {step > 1 && (
                    <Button
                      leftIcon={<ChevronLeftIcon w={6} h={6} />}
                      onClick={() => {
                        setStep(step - 1)
                        setProgress(progress - 25)
                      }}
                      isDisabled={step === 1}
                      colorScheme='blue'
                      variant='solid'
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setStep(1)
                      setProgress(25)
                      onTableClose()
                    }}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
                {step === 4 ? (
                  <Button
                    colorScheme='red'
                    variant='solid'
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    isDisabled={step === 4}
                    rightIcon={<ChevronRightIcon w={6} h={6} />}
                    onClick={() => {
                      setStep(step + 1)
                      if (step === 4) {
                        setProgress(100)
                      } else {
                        setProgress(progress + 25)
                      }
                    }}
                    colorScheme='blue'
                    variant='solid'
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <ProdStatusDrawer
              isOpen={isOpen}
              onClose={onClose}
              btnRef={btnRef}
              data={activeRow}
              textColor={textColor}
              refetch={refetch}
              totalRows={totalRows}
              filteredData={filteredData}
              filterRefetch={filterRefetch}
            />
          )}
        </>
      )}
    </>
  )
}

export default VulnTable
