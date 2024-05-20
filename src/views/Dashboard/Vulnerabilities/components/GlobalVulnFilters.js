import { useQuery } from '@apollo/client'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  useDisclosure
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProductNames } from 'graphQL/Queries'

const GlobalVulnsFilters = ({ setFilters }) => {
  const params = useParams()

  const { totalRows, prodState, userPermissions } = useGlobalState()

  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const { data } = useQuery(GetProductNames, {
    skip:
      window.location.pathname.startsWith(`/vendor/products`) ||
      productPermissions?.value === false
        ? true
        : false,
    variables: {
      first: totalRows,
      enabled: true,
      field: prodState?.field,
      direction: prodState?.direction
    }
  })

  const envList = ['all', 'default', 'development', 'production']

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

  // FILTER BY ENVIRONMENT
  const [envs, setEnvs] = useState([])
  const onFilterEnv = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setEnvs(value?.includes('all') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      projectNames: filterValue
    }))
  }
  // FILTER BY PRODUCT
  const [products, setProducts] = useState([])
  const onFilterProduct = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setProducts(value?.includes('all') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      projectGroupIds: filterValue
    }))
  }
  // FILTER BY SEVERITY
  const [severities, setSeverities] = useState([])
  const onFilterSeverity = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setSeverities(value?.includes('all') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      severity: filterValue
    }))
  }
  // FILTER BY STATUS
  const [statues, setStatues] = useState([])
  const onFilterStatus = (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setStatues(value?.includes('all') ? [] : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      status: filterValue
    }))
  }
  // FILTER BY KEV
  const [kev, setKev] = useState('')
  const onFilterKev = (value) => {
    const filterValue =
      value === 'yes' ? true : value === 'false' ? false : undefined
    setKev(value === 'all' ? '' : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      kev: filterValue
    }))
  }
  // FILTER BY EPSS
  const [epss, setEpss] = useState('')
  const onFilterEpss = (value) => {
    const epssRange = value !== 'all' && value !== '' && value?.split('-')
    const range = {
      min: parseFloat(epssRange[0]) / 100,
      max: parseFloat(epssRange[1]) / 100
    }
    const filterValue = value === 'all' || value === '' ? undefined : range
    setEpss(value === 'all' ? '' : value)
    setFilters((oldFilters) => ({
      ...oldFilters,
      epss: filterValue
    }))
    setMinEpss(0)
    setMaxEpss(0)
  }
  // FILTER BY CUSTOM EPSS RANGE
  const [minEpss, setMinEpss] = useState(0)
  const [maxEpss, setMaxEpss] = useState(0)
  const handleSubmit = () => {
    const value = `${minEpss}-${maxEpss}`
    const epssRange = value !== 'all' && value !== '' && value?.split('-')
    const range = {
      min: parseFloat(epssRange[0]) / 100,
      max: parseFloat(epssRange[1]) / 100
    }
    const filterValue = value === 'all' || value === '' ? undefined : range
    setFilters((oldFilters) => ({
      ...oldFilters,
      epss: filterValue
    }))
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ENVIRONMENT */}
      <Box
        width={'fit-content'}
        position={'relative'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          {envs.length !== 0 && !envs.includes('all') && <CheckMark />}
          <MenuHeading title={'Environment'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={envs}
              onChange={onFilterEnv}
            >
              {envList.map((item, index) => (
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
      {/* PRODUCTS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          {products?.length !== 0 && !products.includes('all') && <CheckMark />}
          <MenuHeading title={'Product'} />
          <MenuList minH={'auto'} maxH={'300px'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='checkbox'
              value={products}
              onChange={onFilterProduct}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {data?.organization?.projectGroups?.nodes?.map((item) => (
                <MenuItemOption key={item.id} value={item.id} fontSize={'sm'}>
                  {item.name}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {severities?.length !== 0 && !severities.includes('all') && (
            <CheckMark />
          )}
          <MenuHeading title={'Severity'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severities}
              onChange={onFilterSeverity}
            >
              {['all', 'critical', 'high', 'medium', 'low', 'unknown'].map(
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
      <Box width={'fit-content'} position={'relative'} hidden>
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && !statues.includes('all') && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={statues}
              onChange={onFilterStatus}
            >
              {['all', 'Affected', 'Fixed', 'In Triage', 'Not Affected'].map(
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
      {/* KEV */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {kev !== 'all' && kev !== '' && <CheckMark />}
          <MenuHeading title={'KEV'} />
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
          <MenuHeading title={'EPSS'} onClick={onOpen} />
          <MenuList>
            <MenuOptionGroup type='radio' value={epss} onChange={onFilterEpss}>
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['0-0.1', '0.1-1', '1-10', '10-100'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {`${item} %`}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
            <MenuDivider />
            <Flex flexDirection={'column'} alignItems={'flex-start'}>
              <Stack direction={'column'} alignItems={'center'} pl={8}>
                <InputGroup size='sm'>
                  <InputLeftAddon width={14}>Min</InputLeftAddon>
                  <Input
                    type='number'
                    width={'64px'}
                    id='minValue'
                    name='minValue'
                    value={minEpss}
                    ref={minRef}
                    onKeyDown={onMinKeyDown}
                    onChange={(e) => setMinEpss(e.target.value)}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
                <InputGroup size='sm'>
                  <InputLeftAddon width={14}>Max</InputLeftAddon>
                  <Input
                    type='number'
                    width={'64px'}
                    id='maxValue'
                    name='maxValue'
                    value={maxEpss}
                    ref={maxRef}
                    onKeyDown={onMaxKeyDown}
                    onChange={(e) => setMaxEpss(e.target.value)}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
              </Stack>
              <Button
                ml={8}
                my={3}
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

export default GlobalVulnsFilters
