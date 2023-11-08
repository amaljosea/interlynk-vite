import { useMutation } from '@apollo/client'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Tag,
  TagLabel,
  Icon,
  Link,
  Tooltip,
  useColorModeValue,
  Select,
  Checkbox
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import GlobalContext from 'context/GlobalContext'
import { updateCompVulnVex } from 'graphQL/Mutation'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation } from 'react-router-dom'
import { mergeData, sevColor } from 'utils'

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

const CopyTable = ({
  data,
  productId,
  sbomId,
  getVulns,
  refetch,
  setFinalData
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const currentSbomId = queryParams.get('sbom')

  const [selectedRows, setSelectedRows] = useState([])

  const textColor = useColorModeValue('gray.700', 'white')

  const { vulnField, vulnDirection, totalVulns } = useContext(GlobalContext)

  const [compVexCreate] = useMutation(updateCompVulnVex)

  const fetchMergeList = async (currentData) => {
    await getVulns({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalVulns,
        field: vulnField,
        direction: vulnDirection
      }
    }).then((res) => {
      const data = mergeData(currentData, res.data.sbom.vulns.nodes)
      setFinalData(data)
    })
  }

  const refetchCurrentVuln = async () => {
    try {
      await refetch({
        variables: {
          projectId: productId,
          sbomId: currentSbomId,
          first: totalVulns,
          field: vulnField,
          direction: vulnDirection
        }
      }).then((res) => {
        if (res.data) {
          fetchMergeList(res.data.sbom.vulns.nodes)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleUpdate = (e, row) => {
    const { value } = e.target
    const { importJustification, importStatus, id } = row
    if (value === 'Replace from import') {
      try {
        compVexCreate({
          variables: {
            compVulnId: id,
            notes: 'testing',
            sbomId: sbomId,
            vexStatusId: importStatus.id,
            vexJustificationId: importJustification
              ? importJustification.id
              : undefined
          }
        }).then(() => refetchCurrentVuln())
      } catch (error) {
        console.log('Mutation error', error)
      }
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
                  {vuln.vulnId !== null ? vuln.vulnId : ''}
                </Text>
              </Tooltip>
            </Flex>
          </Link>
        )
      }
    },
    // SEVERITY
    {
      id: 'serverity',
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
      width: '130px',
      width: '150px'
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
      wrap: true,
      width: '200px'
    },
    // VERSION
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.component.version,
      wrap: true,
      width: '200px'
    },
    // CURRENT STATUS
    {
      id: 'currentStatus',
      name: 'CURRENT STATUS',
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
      width: '200px'
    },
    // SELECTED STATUS
    {
      id: 'selectedStatus',
      name: 'IMPORT STATUS',
      selector: (row) => {
        const { importStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(
              importStatus ? importStatus.name : 'Unspecified'
            )}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {importStatus ? importStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      width: '200px'
    },
    // UPDATED AT
    {
      id: 'action',
      name: 'ACTI0N',
      selector: (row) => {
        return (
          <Select
            name='import'
            defaultValue={row.importFrom}
            size='sm'
            width={'fit-content'}
            onChange={(e) => handleUpdate(e, row)}
          >
            <option value={'Keep existing'}>Keep existing</option>
            <option value={'Replace from import'}>Replace from import</option>
          </Select>
        )
      }
    },
    {
      id: 'statusHistory',
      name: 'STATUS HISTORY',
      selector: (row) => {
        return (
          <Checkbox
            name='status'
            defaultChecked={row.statusHistory}
            // onChange={() => setUpdateHistory(!updateHistory)}
          />
        )
      }
    }
  ]

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Text>Total : {data && data.length}</Text>
      </Flex>
    )
  }, [data])

  const linkURl = (type, id) => {
    if (type === 'osv') {
      return `https://osv.dev/vulnerability/${id}`
    } else {
      return `https://nvd.nist.gov/vuln/detail/${id}`
    }
  }

  return (
    <Card p={0}>
      <Flex flexDir={'column'} width={'100%'} mb={6}>
        <DataTable
          columns={columns}
          data={data}
          customStyles={customStyles}
          subHeader
          progressPending={data ? false : true}
          subHeaderComponent={subHeaderComponentMemo}
          responsive={true}
          selectableRows={true}
          // selectableRowSelected={(row) => row}
        />
      </Flex>
    </Card>
  )
}

export default CopyTable
