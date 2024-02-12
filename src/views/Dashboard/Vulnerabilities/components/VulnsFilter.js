import { useQuery } from '@apollo/client'
import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuItemOption,
  MenuList,
  MenuDivider,
  MenuOptionGroup,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { useLocation, useParams } from 'react-router-dom'
import CheckMark from 'components/Misc/CheckMark'
import FilterButton from 'components/Misc/FilterButton'
import { GetProjectGroups } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRef } from 'react'

const VulnsFilters = ({ refetch }) => {
  const params = useParams()
  const location = useLocation()

  const { totalRows, globalVulnState, prodState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    severities,
    products,
    statues,
    kev,
    epss,
    minEpss,
    maxEpss
  } = globalVulnState
  const { globalVulnDispatch } = dispatch

  const { data } = useQuery(GetProjectGroups, {
    variables: {
      first: totalRows,
      enabled: true,
      field: prodState?.field,
      direction: prodState?.direction
    }
  })

  const minRef = useRef()
  const maxRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const onMinKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      maxRef.current.focus()
    }
  }

  const onMaxKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      minRef.current.focus()
    }
  }

  const vulnData = { first: totalRows, field, direction }

  const handleRefetch = async (groupIds, severities, statuses, kev, epss) => {
    const epssRange = epss !== 'all' && epss !== '' && epss.split('-')
    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }
    await refetch({
      variables: {
        first: totalRows,
        projectGroupIds:
          groupIds?.includes('all') || groupIds?.length === 0
            ? undefined
            : groupIds,
        severity:
          severities?.includes('all') || severities?.length === 0
            ? undefined
            : severities,
        status:
          statuses.includes('all') || statuses?.length === 0
            ? undefined
            : statuses,
        kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
        epss: epss === 'all' || epss === '' ? undefined : range,
        field,
        direction
      }
    })
  }

  const onFilterProduct = async (value) => {
    handleRefetch(value, severities, statues, kev, epss)
    globalVulnDispatch({ type: 'FILTER_PRODUCT', payload: value })
  }

  const onFilterSeverity = async (value) => {
    handleRefetch(products, value, statues, kev, epss)
    globalVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
  }

  const onFilterStatus = async (value) => {
    handleRefetch(products, severities, value, kev, epss)
    globalVulnDispatch({ type: 'FILTER_STATUS', payload: value })
  }

  const onFilterKev = async (value) => {
    handleRefetch(products, severities, statues, value, epss)
    globalVulnDispatch({ type: 'FILTER_KEV', payload: value })
  }

  const onFilterEpss = async (value) => {
    handleRefetch(products, severities, statues, kev, value)
    globalVulnDispatch({ type: 'FILTER_EPSS', payload: value })
  }

  const handleSubmit = async () => {
    handleRefetch(products, severities, statues, kev, `${minEpss}-${maxEpss}`)
    globalVulnDispatch({
      type: 'SET_EPSS',
      payload: `${minEpss}-${maxEpss}`
    })
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      {data && (
        <Box
          width={'fit-content'}
          position={'relative'}
          display={params?.name ? 'none' : 'block'}
        >
          <Menu closeOnSelect={false}>
            {products?.length !== 0 && !products.includes('all') && (
              <CheckMark />
            )}
            <FilterButton>Product</FilterButton>
            <MenuList>
              <MenuOptionGroup
                type='checkbox'
                value={products}
                onChange={onFilterProduct}
              >
                <MenuItemOption value={'all'} fontSize={'sm'}>
                  All
                </MenuItemOption>
                {data?.organization?.projectGroups?.nodes?.map(
                  (item, index) => (
                    <MenuItemOption
                      key={index}
                      value={item.id}
                      fontSize={'sm'}
                      textTransform={'capitalize'}
                    >
                      {item.name}
                    </MenuItemOption>
                  )
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </Box>
      )}
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {severities?.length !== 0 && !severities.includes('all') && (
            <CheckMark />
          )}
          <FilterButton>Severity</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severities}
              onChange={onFilterSeverity}
            >
              {['all', 'critical', 'high', 'medium', 'low'].map(
                (item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </MenuItemOption>
                )
              )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && !statues.includes('all') && <CheckMark />}
          <FilterButton>Status</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={statues}
              onChange={onFilterStatus}
            >
              {[
                'all',
                'Affected',
                'False Positive',
                'Fixed',
                'In Triage',
                'Not Affected'
              ].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* KEV */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {kev !== 'all' && kev !== '' && <CheckMark />}
          <FilterButton>KEV</FilterButton>
          <MenuList>
            <MenuOptionGroup type='radio' value={kev} onChange={onFilterKev}>
              {['all', 'yes', 'no'].map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* EPSS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
          {epss !== '' && epss !== 'all' && <CheckMark />}
          <FilterButton onClick={onOpen}>EPSS</FilterButton>
          <MenuList>
            <MenuOptionGroup type='radio' value={epss} onChange={onFilterEpss}>
              {['all', '0-100', '100-500', '500-1000', '1000-10000'].map(
                (item, index) => (
                  <MenuItemOption
                    key={index}
                    value={item}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </MenuItemOption>
                )
              )}
            </MenuOptionGroup>
            <MenuDivider />
            <Flex flexDirection={'column'} alignItems={'flex-start'}>
              <Stack direction={'row'} alignItems={'center'} pl={8}>
                <Input
                  type='number'
                  width={'75px'}
                  size='sm'
                  placeholder={'min'}
                  id='minValue'
                  name='minValue'
                  value={minEpss}
                  ref={minRef}
                  onKeyDown={onMinKeyDown}
                  onChange={(e) =>
                    globalVulnDispatch({
                      type: 'SET_MIN_EPSS',
                      payload: e.target.value
                    })
                  }
                />
                <Box>-</Box>
                <Input
                  type='number'
                  width={'75px'}
                  size='sm'
                  placeholder={'max'}
                  id='maxValue'
                  name='maxValue'
                  value={maxEpss}
                  ref={maxRef}
                  onKeyDown={onMaxKeyDown}
                  onChange={(e) =>
                    globalVulnDispatch({
                      type: 'SET_MAX_EPSS',
                      payload: e.target.value
                    })
                  }
                />
              </Stack>
              <Button
                ml={8}
                my={2}
                size='sm'
                onClick={handleSubmit}
                isDisabled={Number(maxEpss) <= Number(minEpss) || maxEpss === 0}
              >
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default VulnsFilters
