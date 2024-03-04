import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { Badge, Flex, Tag, Text } from '@chakra-ui/react'
import ToolsFilterMenu from 'views/Dashboard/Tools/Filters'
import React, { useMemo } from 'react'
import { customStyles } from 'utils'

const DiffTable = ({ diffs, data, setData, isLoading, sbomOne, sbomTwo }) => {
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
            colorScheme={diffType === 'added' ? 'green' : diffType === 'removed' ? 'red' : 'blue'}
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
        <Text>{row?.subjectComponent?.name || row?.targetComponent?.name || '-'}</Text>
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
              <Tag py={1.5} colorScheme='red' hidden={targetComponent?.version === ''}>{targetComponent?.version}</Tag>
              <Tag py={1.5} colorScheme='green' hidden={subjectComponent?.version === ''}>{subjectComponent?.version}</Tag>
            </Flex>
          )
        } else {
          return (
            <Tag py={1.5}>{subjectComponent?.version || targetComponent?.version || '-'}</Tag>
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
        if (diffTags?.includes('licenses_exp')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag py={1.5} colorScheme='red' hidden={targetComponent?.licensesExp === ''}>
                {targetComponent?.licensesExp}
              </Tag>
              <Tag py={1.5} colorScheme='green' hidden={subjectComponent?.licensesExp === ''}>
                {subjectComponent?.licensesExp}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag my={4} py={1.5}>
              {subjectComponent?.licensesExp || targetComponent?.licensesExp || '-'}
            </Tag>
          )
        }
      },
      width: '250px',
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
              <Tag py={1.5} colorScheme='red' hidden={targetComponent?.purl === ''}>{targetComponent?.purl || '-'}</Tag>
              <Tag py={1.5} colorScheme='green' hidden={subjectComponent?.purl === ''}>{subjectComponent?.purl || '-'}</Tag>
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
        if (diffTags?.includes('cpes')) {
          return (
            <Flex my={4} flexWrap={'wrap'} alignItems={'center'} gap={2}>
              {targetComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {targetComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5} colorScheme='red'>
                      {item}
                    </Tag>
                  ))}
                </Flex>
              )}
              {subjectComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {subjectComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5} colorScheme='green'>
                      {item}
                    </Tag>
                  ))}
                </Flex>
              )}
            </Flex>
          )
        } else {
          return (
            <>
              {targetComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {targetComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5}>
                      {item}
                    </Tag>
                  ))}
                </Flex>
              )}
              {subjectComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {subjectComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5}>
                      {item}
                    </Tag>
                  ))}
                </Flex>
              )}
            </>
          )
        }
      },
      width: '400px',
      wrap: true
    }
  ]

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-start'} mb={4} px={4}>
        {sbomOne && sbomTwo && <ToolsFilterMenu data={diffs?.sbomDrift} setData={setData} />}
      </Flex>
    )
  }, [data, setData])

  return (
    <DataTable
      columns={columns}
      data={data || []}
      customStyles={customStyles}
      progressPending={isLoading}
      subHeader
      subHeaderComponent={subHeader}
      progressComponent={<CustomLoader />}
      persistTableHead
      responsive={true}
    />
  )
}

export default DiffTable
