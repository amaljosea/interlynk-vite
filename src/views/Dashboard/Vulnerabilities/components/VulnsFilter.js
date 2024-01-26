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
  useDisclosure,
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
  const queryParams = new URLSearchParams(location.search)
  const activeEnv = localStorage.getItem('activeEnv')

  const { totalRows, globalVulnState, prodState, dispatch } = useGlobalState()
  const { severities, products, statues, kev, epss, minEpss, maxEpss } =
    globalVulnState
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

  const vulnData = { first: totalRows, last: undefined, after: undefined, before: undefined }

  const onFilterProduct = async (value) => {
    await refetch({id: params?.name ? activeEnv : undefined, 
    projectactiveEnvs: value?.includes('all') ? undefined : value, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'FILTER_PRODUCT', payload: value }))
  }

  const onFilterSeverity = async (value) => {
    await refetch({id: params?.name ? activeEnv : undefined, 
    severity: value?.includes('all') ? undefined: value, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'FILTER_SEVERITY', payload: value }))
  }

  const onFilterStatus = async (value) => {
    await refetch({id: params?.name ? activeEnv : undefined, 
    status: value.includes('all') ? undefined: value, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'FILTER_STATUS', payload: value }))
  }

  const onFilterKev = async (value) => {
    await refetch({id: params?.name ? activeEnv : undefined, 
    kev: value === 'yes' ? true : value === 'false' ? false : undefined, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'FILTER_KEV', payload: value }))
  }

  const onFilterEpss = async (value) => {
    const epssRange = value !== 'all' && value !== '' && value.split('-')
    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }
    await refetch({id: params?.name ? activeEnv : undefined, 
    epss: value === 'all' || value === '' ? undefined : range, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'FILTER_EPSS', payload: value }))
  }

  const handleSubmit = async () => {
    const range = {
      min: parseFloat(minEpss) / 10000,
      max: parseFloat(maxEpss) / 10000
    }
    await refetch({id: params?.name ? activeEnv : undefined, epss: range, ...vulnData })
    .then((res) => res?.data && globalVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` }))
    .finally(() => onClose())
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      {data && (
      <Box width={'fit-content'} position={'relative'} display={params?.name ? 'none' : 'block'}>
        <Menu closeOnSelect={true}>
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
              <MenuItemOption value={'all'} fontSize={'sm'}>All</MenuItemOption>
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
        <Menu closeOnSelect={true}>
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
        <Menu closeOnSelect={true}>
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
        <Menu closeOnSelect={true}>
          {kev !== 'all' && kev !== '' && <CheckMark />}
          <FilterButton>KEV</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={kev}
              onChange={onFilterKev}
            >
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
        <Menu closeOnSelect={true} isOpen={isOpen} onClose={onClose}>
          {epss !== '' && epss !== 'all' && <CheckMark />}
          <FilterButton onClick={onOpen}>EPSS</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={epss}
              onChange={onFilterEpss}
            >
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
