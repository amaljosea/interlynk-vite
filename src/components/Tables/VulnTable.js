// Chakra imports
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
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
  Select,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useToast,
  IconButton,
  ButtonGroup,
  Badge
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { FaCopy } from 'react-icons/fa6'
import { useState, useMemo, useEffect, useContext } from 'react'
import styled from '@emotion/styled'
import Multistep from 'views/Sbom/components/Multistep'
import { getFullDateAndTime } from 'utils'
import ProdStatusDrawer from 'components/Drawer/ProdStatusDrawer'
import VulnFilterMenu from 'views/Sbom/components/VulnFilterMenu'
import { sevColor } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import GlobalContext from 'context/GlobalContext'
import { timeSince } from 'utils'
import CustomLoader from 'components/CustomLoader'
import Cookies from 'js-cookie'
import RowLimit from 'views/Sbom/components/RowLimit'
import { useLazyQuery, useMutation } from '@apollo/client'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { findSimilarItems } from 'utils'
import { GetVulnData } from 'graphQL/Queries'

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
    return 'purple'
  } else if (status && status === 'In Triage') {
    return 'cyan'
  } else {
    return 'gray'
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
  filterRefetch
}) => {
  const toast = useToast()
  const customerView = location.pathname.startsWith('/customer')
  const signedParams = Cookies.get(`signedParamId`)

  const {
    vulnFilters,
    vulnField,
    setVulnField,
    vulnDirection,
    setVulnDirection,
    signedVulnField,
    setSignedVulnField,
    signedVulnDirection,
    setSignedVulnDirection,
    vulnSearchInput,
    setSignedVulnSearchInput,
    setVulnSearchInput,
    vulnSeverity,
    vulnComponent,
    vulnStatus,
    vulnKev,
    vulnEpss,
    signedVulnSearchInput,
    signedVulnSeverity,
    signedVulnComponent,
    signedVulnStatus,
    signedVulnKev,
    signedVulnEpss,
    mergeData,
    setMergeData,
    totalVulns,
    currentSbom,
    setCurrentSbom,
    importSbom,
    setImportSbom
  } = useContext(GlobalContext)

  const textColor = useColorModeValue('gray.700', 'white')

  const x = window.matchMedia('(min-width: 2500px)')
  const y = window.matchMedia('(max-width: 1440px)')

  // STEPS
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [stepTitle, setStepTitle] = useState('')
  const [filterText, setFilterText] = useState('')
  const [vulnAfter, setVulnAfter] = useState('')
  const [vulnBefore, setVulnBefore] = useState('')

  const [stepOne, setStepOne] = useState(false)
  const [stepTwo, setStepTwo] = useState(false)
  const [stepThree, setStepThree] = useState(false)

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
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { kev } = vulnInfo
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
                  {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
                </Text>
              </Tooltip>
              {kev === true && (
                <Badge variant='subtle' colorScheme='red'>
                  KEV
                </Badge>
              )}
            </Flex>
          </Link>
        )
      },
      width: y.matches ? '15%' : '20%',
      sortable: true
    },
    // SEVERITY
    {
      id: 'VULNS_SEV',
      name: 'SEVERITY',
      selector: (row) => {
        const { vuln } = row
        return (
          <>
            {vuln.sev !== null ? (
              <Tag
                size='md'
                variant='subtle'
                width={'80px'}
                colorScheme={sevColor(`${vuln.sev}`)}
              >
                <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
                  {vuln.sev}
                </TagLabel>
              </Tag>
            ) : (
              ''
            )}
          </>
        )
      },
      width: '120px',
      sortable: true
    },
    // SOURCE
    {
      id: 'VULNS_SOURCE',
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
      width: '110px',
      sortable: true
    },
    // CVSS
    {
      id: 'VULNS_CVSS_SCORE',
      name: 'CVSS',
      selector: (row) => {
        const { vuln } = row
        return (
          <Flex minWidth='max-content' alignItems='center' gap='2'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'50px'}
              colorScheme={cvssColor(vuln.cvssScore)}
            >
              <TagLabel mx={'auto'}>
                {vuln.cvssScore ? vuln.cvssScore : 0}
              </TagLabel>
            </Tag>
          </Flex>
        )
      },
      width: '90px',
      sortable: true
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS*',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { epssScores } = vulnInfo

        return (
          <Flex minWidth='max-content' alignItems='center' gap='0'>
            <Tag
              size='md'
              key='md'
              variant='subtle'
              width={'60px'}
              justifyContent='center'
              alignItems='center'
            >
              <TagLabel style={{ textAlign: 'center' }}>
                {Math.ceil(epssScores[0] * 10000)}
                {/* {epssScores.length > 1 && `- ${epssScores[1]}`} */}
              </TagLabel>
            </Tag>
            {epssScores.length > 1 ? (
              epssScores[0] > epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Up from ${Math.ceil(
                    epssScores[epssScores.length - 1] * 10000
                  )} last week`}
                >
                  <ChevronUpIcon w={5} h={5} color='green.500' />
                </Tooltip>
              ) : epssScores[0] < epssScores[epssScores.length - 1] ? (
                <Tooltip
                  placement='top'
                  label={`Down from ${Math.ceil(
                    epssScores[epssScores.length - 1] * 10000
                  )} last week`}
                >
                  <ChevronDownIcon w={5} h={5} color='red.500' />
                </Tooltip>
              ) : null
            ) : null}
          </Flex>
        )
      },
      width: '120px',
      sortable: true
    },
    // COMPONENT
    {
      id: 'COMPONENTS_NAME',
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
      wrap: true,
      width: y.matches ? '10%' : x.matches ? '18%' : '15%',
      sortable: true
    },
    // VERSION
    {
      id: 'COMPONENTS_VERSION',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row.component.version} placement='top'>
          {row.component.version}
        </Tooltip>
      ),
      wrap: true,
      width: y.matches ? '10%' : x.matches ? '18%' : '15%',
      sortable: true
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      sortable: true,
      width: '150px'
    },
    // UPDATED AT
    {
      id: 'COMPONENT_VULNS_UPDATED_AT',
      name: 'UPDATED AT',
      selector: (row) => (
        <Tooltip
          label={getFullDateAndTime(row.vuln.updatedAt)}
          placement={'top'}
        >
          {timeSince(row.vuln.updatedAt)}
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.vuln.updatedAt)
        const dateB = new Date(b.vuln.updatedAt)
        return dateB - dateA // Sort in descending order
      },
      right: 'true'
    }
  ]

  // SEARCH COMPONENT
  const handleSearch = async (event) => {
    if (event.key === 'Enter') {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          search: customerView ? signedVulnSearchInput : vulnSearchInput,
          first: totalRows,
          field: customerView ? signedVulnField : vulnField,
          direction: customerView ? signedVulnDirection : vulnDirection,
          signedParams: customerView ? signedParams : undefined
        }
      })
      setPageIndex(1)
    }
  }

  // CLEAR SERACH
  const handleClear = async () => {
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        search: undefined,
        field: customerView ? signedVulnField : vulnField,
        direction: customerView ? signedVulnDirection : vulnDirection,
        signedParams: customerView ? signedParams : undefined
      }
    })
    if (customerView) {
      setSignedVulnSearchInput('')
    } else {
      setVulnSearchInput('')
    }
    setPageIndex(1)
  }

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
          {customerView ? (
            <SearchFilter
              id='vuln'
              filterText={signedVulnSearchInput}
              setFilterText={setSignedVulnSearchInput}
              onFilter={handleSearch}
              onClear={handleClear}
            />
          ) : (
            <SearchFilter
              id='vuln'
              filterText={vulnSearchInput}
              setFilterText={setVulnSearchInput}
              onFilter={handleSearch}
              onClear={handleClear}
            />
          )}

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {vulnFilters && (
            <VulnFilterMenu
              refetch={refetch}
              productId={productId}
              sbomId={sbomId}
              setPageIndex={setPageIndex}
              totalRows={totalRows}
            />
          )}
        </Stack>

        {!customerView && (
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
        )}
      </Flex>
    )
  }, [vulnSearchInput, vulnFilters, handleClear, handleSearch])

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
          templateColumns='repeat(5, 1fr)'
          gap={6}
          width={'90%'}
          margin={'0 auto'}
        >
          {/* VULN DATA */}
          <GridItem
            w='100%'
            colSpan={2}
            display={'flex'}
            flexDirection={'column'}
            gap={4}
          >
            {/* Description */}
            <Box>
              <CustomText>Description :</CustomText>
              <Text mt={1} fontSize={14}>
                {vuln.desc}
              </Text>
            </Box>
            {/* Published At  */}
            <Box>
              <CustomText>Published:</CustomText>
              <Text mt={1} fontSize={14}>
                {getFullDateAndTime(vuln.publishedAt)}
              </Text>
            </Box>
            {/* Last Modified At */}
            <Box>
              <CustomText>Last Modified:</CustomText>
              <Text mt={1} fontSize={14}>
                {getFullDateAndTime(vuln.lastModifiedAt)}
              </Text>
            </Box>
            {/* CVSS Vector */}
            <Box>
              <CustomText>CVSS Vector :</CustomText>
              <Text mt={1} fontSize={14}>
                {vuln.cvssVector}
              </Text>
            </Box>
            {/* NVD ALIAS ID */}
            {vuln.nvdAliasId ? (
              <Box>
                <CustomText>NVD Alias ID:</CustomText>
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
              </Box>
            ) : null}
          </GridItem>
          {/* STATUS UPDATE */}
          <GridItem w='100%' colSpan={3}>
            <ProdStatusDrawer
              data={data}
              textColor={textColor}
              refetch={refetch}
              totalRows={totalRows}
              filteredData={filteredData}
              filterRefetch={filterRefetch}
              after={vulnAfter}
              before={vulnBefore}
            />
          </GridItem>
        </Grid>
      </Box>
    )
  }

  const handleUpdate = async () => {
    try {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalRows,
          field: customerView ? signedVulnField : vulnField,
          direction: customerView ? signedVulnDirection : vulnDirection,
          signedParams: customerView ? signedParams : undefined
        }
      }).then((res) => {
        setStep(1)
        setProgress(25)
        onTableClose()
      })
    } catch (error) {
      console.log(error)
    }
  }

  const [compVexCreate] = useMutation(updateCompVulnVex)

  const [getVulns] = useLazyQuery(GetVulnData)

  const refetchCurrentVuln = async (item) => {
    try {
      await getVulns({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalVulns,
          field: vulnField,
          direction: vulnDirection
        }
      }).then((res) => {
        if (res.data) {
          const data = findSimilarItems(
            res.data.sbom.vulns.nodes,
            importSbom,
            'Keep existing',
            'yes'
          )
          const filterData = data.filter((item) => item.importStatus !== null)
          setMergeData(filterData)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = () => {
    const updatedList = mergeData.filter(
      (item) => item.importFrom === 'Replace from import'
    )
    console.log(updatedList)
    if (updatedList.length > 0) {
      updatedList.map((item) => {
        try {
          compVexCreate({
            variables: {
              compVulnId: item.id,
              notes: item.importNotes,
              sbomId: sbomId,
              vexStatusId: item.importStatus.id,
              vexJustificationId: item.importJustification
                ? item.importJustification.id
                : undefined,
              impact: item.importStatement ? item.importStatement : undefined
            }
          }).then(() => refetchCurrentVuln(item))
        } catch (error) {
          console.log('Mutation error', error)
        }
      })
    } else {
      setStep(1)
      setProgress(25)
      onTableClose()
    }
  }

  const handleRefetch = async (
    search,
    severity,
    componentName,
    status,
    kev,
    epss,
    first,
    after,
    last,
    before,
    field,
    direction
  ) => {
    const vulnEpss = epss !== 'all' && epss.split('-')

    const range = {
      min: parseFloat(vulnEpss[0]) / 10000,
      max: parseFloat(vulnEpss[1]) / 10000
    }
    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        signedParams: customerView ? signedParams : undefined,
        search: search !== '' ? search : undefined,
        severity: severity.length > 0 ? severity : undefined,
        componentName: componentName.length > 0 ? componentName : undefined,
        status: status.length > 0 ? status : undefined,
        kev:
          kev === 'all' || kev === ''
            ? undefined
            : kev === 'yes'
            ? true
            : false,
        epss: epss !== '' && epss !== 'all' ? range : undefined,
        first: first,
        after: after,
        last: last,
        before: before,
        field: field,
        direction: direction
      }
    })
  }

  const onPreviousPage = async () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    setVulnBefore(data.pageInfo.startCursor)
    setVulnAfter('')
    if (customerView) {
      handleRefetch(
        signedVulnSearchInput,
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        signedVulnEpss,
        undefined,
        undefined,
        totalRows,
        data.pageInfo.startCursor,
        signedVulnField,
        signedVulnDirection
      )
    } else {
      handleRefetch(
        vulnSearchInput,
        vulnSeverity,
        vulnComponent,
        vulnStatus,
        vulnKev,
        vulnEpss,
        undefined,
        undefined,
        totalRows,
        data.pageInfo.startCursor,
        vulnField,
        vulnDirection
      )
    }
  }

  const onNextPage = async () => {
    setPageIndex((prev) => prev < Math.ceil(data.totalCount) && prev + 1)
    setVulnAfter(data.pageInfo.endCursor)
    setVulnBefore('')
    if (customerView) {
      handleRefetch(
        signedVulnSearchInput,
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        signedVulnEpss,
        totalRows,
        data.pageInfo.endCursor,
        undefined,
        undefined,
        signedVulnField,
        signedVulnDirection
      )
    } else {
      handleRefetch(
        vulnSearchInput,
        vulnSeverity,
        vulnComponent,
        vulnStatus,
        vulnKev,
        vulnEpss,
        totalRows,
        data.pageInfo.endCursor,
        undefined,
        undefined,
        vulnField,
        vulnDirection
      )
    }
  }

  const handleSort = (column, sortDirection) => {
    if (customerView) {
      setSignedVulnField(column.id)
      setSignedVulnDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    } else {
      setVulnField(column.id)
      setVulnDirection(sortDirection === 'asc' ? 'ASC' : 'DESC')
    }
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        signedParams: customerView ? signedParams : undefined,
        first: totalRows,
        field: column.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  // SET ROW LENGTH
  const handleSetRow = async (e) => {
    setTotalRows(Number(e.target.value))
    if (customerView) {
      handleRefetch(
        signedVulnSearchInput,
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        signedVulnEpss,
        Number(e.target.value),
        undefined,
        undefined,
        undefined,
        signedVulnField,
        signedVulnDirection
      )
    } else {
      handleRefetch(
        vulnSearchInput,
        vulnSeverity,
        vulnComponent,
        vulnStatus,
        vulnKev,
        vulnEpss,
        Number(e.target.value),
        undefined,
        undefined,
        undefined,
        vulnField,
        vulnDirection
      )
    }
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
          data={data && data.nodes}
          customStyles={customStyles}
          onSort={handleSort}
          defaultSortAsc={false}
          defaultSortFieldId={customerView ? signedVulnField : vulnField}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          expandableRows
          persistTableHead
          expandableRowsComponent={ExpandedComponent}
        />
      </Flex>

      {/* PAGINATION */}
      {data && (
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

          <RowLimit onChange={handleSetRow} name='vulnerabilities' />
        </Flex>
      )}

      {/* COPY DATA TABLE */}
      {isTableOpen && data && (
        <Drawer
          isOpen={isTableOpen}
          placement='right'
          size='full'
          onClose={onTableClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton
              onClick={() => {
                setStep(1)
                setProgress(25)
                onTableClose()
              }}
            />
            <DrawerHeader>
              <Text fontSize={20} fontWeight={'medium'} visibility={'hidden'}>
                {stepTitle}
              </Text>
            </DrawerHeader>

            <DrawerBody mt={2}>
              {/* IMPORT WIZARD */}
              <Multistep
                step={step}
                progress={progress}
                getVulns={getVulns}
                currentSbomId={sbomId}
                currentProductId={productId}
                setStepOne={setStepOne}
                setStepTwo={setStepTwo}
                setStepThree={setStepThree}
              />
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
                    colorScheme='green'
                    variant='solid'
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    isDisabled={
                      step === 4 ||
                      stepOne === false ||
                      stepTwo === false ||
                      stepThree === false
                    }
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
    </>
  )
}

export default VulnTable
