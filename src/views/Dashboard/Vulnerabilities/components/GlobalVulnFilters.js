import { useQuery } from '@apollo/client'
import { useRef, useState } from 'react'
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
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import { GetProductNames } from 'graphQL/Queries'

const GlobalVulnsFilters = ({ setFilters }) => {
  const params = useParams()

  const { totalRows, prodState } = useGlobalState()

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data } = useQuery(GetProductNames, {
    skip:
      window.location.pathname.startsWith(`/vendor/products`) ||
      productPermissions === false
        ? true
        : false,
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
    setEpss('')
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

  const getStatus = (category) => {
    switch (category) {
      case 'products':
        return products?.length !== 0 && !products.includes('all')
      case 'envs':
        return envs.length !== 0 && !envs.includes('all')
      case 'severities':
        return severities?.length !== 0 && !severities.includes('all')
      case 'statues':
        return statues.length !== 0 && !statues.includes('all')
      case 'kev':
        return kev !== 'all' && kev !== ''
      case 'epss':
        return (epss !== '' && epss !== 'all') || minEpss !== 0 || maxEpss !== 0
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      <Box
        width={'fit-content'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Product'} active={getStatus('products')} />
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
      {/* ENVIRONMENT */}
      <Box
        width={'fit-content'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Environment'} active={getStatus('envs')} />
          <CustomList
            options={['default', 'development', 'production']}
            value={envs}
            onChange={onFilterEnv}
          />
        </Menu>
      </Box>
      {/* SEVERITY */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Severity'} active={getStatus('severities')} />
          <CustomList
            options={['critical', 'high', 'medium', 'low', 'unknown']}
            value={severities}
            onChange={onFilterSeverity}
          />
        </Menu>
      </Box>
      {/* STATUSES */}
      <Box width={'fit-content'} hidden>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Status'} active={getStatus('statues')} />
          <CustomList
            options={['Affected', 'Fixed', 'In Triage', 'Not Affected']}
            value={statues}
            onChange={onFilterStatus}
          />
        </Menu>
      </Box>
      {/* KEV */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'KEV'} active={getStatus('kev')} />
          <CustomList
            type='radio'
            options={['yes', 'no']}
            value={kev}
            onChange={onFilterKev}
          />
        </Menu>
      </Box>
      {/* EPSS */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
          <MenuHeading
            title={'EPSS'}
            onClick={onOpen}
            active={getStatus('epss')}
          />
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
