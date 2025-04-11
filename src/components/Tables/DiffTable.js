import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ToolsFilterMenu from 'views/Dashboard/Tools/Filters'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Badge, Flex, Tag, Text } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

const DiffTable = ({ diffs, isLoading, sbomOne, sbomTwo }) => {
  const { toolsState, dispatch } = useGlobalState()
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const { searchInput, difference, component } = toolsState
  const { toolsDispatch } = dispatch

  const [filterText, setFilterText] = useState(searchInput)

  const filteredData = diffs?.sbomDrift?.filter(
    (item) =>
      (item?.subjectComponent?.name || item?.targetComponent?.name) &&
      (item?.subjectComponent?.name || item.targetComponent.name)
        .toLowerCase()
        .includes(searchInput.toLowerCase()) &&
      item?.diffType?.toLowerCase().includes(difference.toLowerCase()) &&
      (item?.subjectComponent?.name || item?.targetComponent?.name) &&
      (item?.subjectComponent?.name || item.targetComponent.name)
        .toLowerCase()
        .includes(component.toLowerCase())
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    toolsDispatch({ type: 'CLEAR_SEARCH_INPUT' })
  }, [toolsDispatch])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && filterText !== '') {
        toolsDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      }
    },
    [filterText, toolsDispatch]
  )

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
          >
            {diffType}
          </Badge>
        )
      },
      width: '10%',
      wrap: true
    },
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => (
        <Text color={primaryTextColor}>
          {row?.subjectComponent?.name || row?.targetComponent?.name || '-'}
        </Text>
      ),
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
              <Tag
                py={1.5}
                colorScheme='green'
                hidden={subjectComponent?.version === ''}
              >
                {subjectComponent?.version}
              </Tag>
              <Tag
                py={1.5}
                colorScheme='red'
                hidden={targetComponent?.version === ''}
              >
                {targetComponent?.version}
              </Tag>
            </Flex>
          )
        } else {
          return (
            <Tag py={1.5}>
              {subjectComponent?.version || targetComponent?.version || '-'}
            </Tag>
          )
        }
      },
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
              <Tag
                py={1.5}
                colorScheme='green'
                hidden={subjectComponent?.licensesExp === ''}
              >
                {subjectComponent?.licensesExp}
              </Tag>
              <Tag
                py={1.5}
                colorScheme='red'
                hidden={targetComponent?.licensesExp === ''}
              >
                {targetComponent?.licensesExp}
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
              <Tag
                py={1.5}
                colorScheme='green'
                hidden={subjectComponent?.purl === ''}
              >
                {subjectComponent?.purl || '-'}
              </Tag>
              <Tag
                py={1.5}
                colorScheme='red'
                hidden={targetComponent?.purl === ''}
              >
                {targetComponent?.purl || '-'}
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
              {subjectComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {subjectComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5} colorScheme='green'>
                      {item}
                    </Tag>
                  ))}
                </Flex>
              )}
              {targetComponent?.cpes?.length > 0 && (
                <Flex flexDir={'column'} gap={2} alignItems={'flex-start'}>
                  {targetComponent?.cpes?.map((item, index) => (
                    <Tag key={index} py={1.5} colorScheme='red'>
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
      wrap: true
    }
  ]

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <>
        <Flex
          width={'100%'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          mb={4}
          px={4}
          gap={2}
        >
          <SearchFilter
            id='compareVersions'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          <ToolsFilterMenu />
        </Flex>
      </>
    )
  }, [filterText, handleClear, handleSearch, onSearchInputChange])

  useEffect(() => {
    if (diffs && diffs?.sbomDrift?.length > 0) {
      const componentList = diffs?.sbomDrift?.map(
        (item) => item?.targetComponent?.name || item?.subjectComponent?.name
      )
      const statusList = ['all', 'added', 'changed', 'removed']
      toolsDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: { componentList, statusList }
      })
    }
  }, [diffs, toolsDispatch])

  return (
    <LynkTable
      columns={columns}
      data={sbomOne && sbomTwo ? filteredData : []}
      progressPending={isLoading}
      subHeader={sbomOne && sbomTwo && diffs?.sbomDrift ? true : false}
      subHeaderComponent={subHeader}
    />
  )
}

export default DiffTable
