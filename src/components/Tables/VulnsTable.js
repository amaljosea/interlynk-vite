// Chakra imports
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, Text, Tag, TagLabel, Tooltip } from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { useMemo, useState } from 'react'
import { sevColor, timeSince, getFullDateAndTime, customStyles } from 'utils'
import CustomLoader from 'components/CustomLoader'
import { Link } from 'react-router-dom'
import VulnsFilters from 'views/Dashboard/Vulnerabilities/components/VulnsFilter'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const handleChange = (state) => {
}

const VulnsTable = ({ data }) => {
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

  // COLUMNS
  const columns = [
    // CVE ID
    {
      id: 'VULNS_VULN_ID',
      name: 'ID',
      wrap: true,
      selector: (row) => {
        const { vuln, id } = row
        return (
          <Link to={`/vendor/vulnerabilities?id=${id}`}>
            <Text fontSize='sm' color={'blue.500'}>
              {vuln.vulnId !== null ? `${vuln.vulnId}` : ''}
            </Text>
          </Link>
        )
      },
      width: '25%'
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
      width: '120px'
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
      width: '110px'
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
      width: '90px'
    },
    // EPSS
    {
      id: 'VULN_INFOS_EPSS_SCORES',
      name: 'EPSS*',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { epssScores } = vulnInfo ? vulnInfo : ''

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
      width: '150px'
    },
    // Products
    {
      id: 'AFFECTS',
      name: 'AFFECTS',
      selector: (row) => {
        const { vuln } = row
        const { vulnInfo } = vuln
        const { prods } = vuln

        return (
          <Flex minWidth='max-content' alignItems='center' gap='10'>
            {prods}
          </Flex>
        )
      },
      width: '150px'
    },
    // Products
    {
      id: 'RESOLVED',
      name: 'RESOLVED',
      selector: (row) => {
        const { vuln } = row
        const { resolved } = vuln

        return (
          <Flex minWidth='max-content' alignItems='right' gap='0'>
            {resolved}
          </Flex>
        )
      },
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
        return dateA - dateB // Sort in descending order
      },
      wrap: true,
      right: 'true'
    }
  ]

  const [vulnSearchInput, setVulnSearchInput] = useState('')

  // SEARCH COMPONENT
  const handleSearch = async () => {}

  // CLEAR SERACH
  const handleClear = async () => {
    setVulnSearchInput('')
  }

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} gap={3}>
        <SearchFilter
          id='vuln'
          filterText={vulnSearchInput}
          setFilterText={setVulnSearchInput}
          onFilter={handleSearch}
          onClear={handleClear}
        />

        <VulnsFilters />
      </Flex>
    )
  }, [vulnSearchInput, handleClear, handleSearch])

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponentMemo}
          responsive
          persistTableHead
          selectableRows
          onSelectedRowsChange={handleChange}
        />
      </Flex>
    </>
  )
}

export default VulnsTable
