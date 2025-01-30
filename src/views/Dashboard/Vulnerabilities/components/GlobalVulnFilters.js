import { useQuery } from '@apollo/client'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Button, Flex, Stack, useDisclosure } from '@chakra-ui/react'
import {
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProductNames } from 'graphQL/Queries'

const GlobalVulnsFilters = ({ reset }) => {
  const params = useParams()
  const { globalVulnState, dispatch } = useGlobalState()
  const {
    projectGroupIds,
    projectNames,
    severity,
    status,
    kev,
    epss,
    minEpss,
    maxEpss
  } = globalVulnState

  const { globalVulnDispatch } = dispatch
  const productView = window.location.pathname.startsWith(`/vendor/products`)

  const { data } = useQuery(GetProductNames, {
    skip: productView ? true : false,
    variables: {
      first: 500,
      enabled: true,
      direction: 'ASC',
      field: 'PROJECT_GROUPS_NAME'
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

  // FILTER BY PRODUCT
  const onFilterProduct = (value) => {
    globalVulnDispatch({ type: 'FILTER_PRODUCT', payload: value })
    reset()
  }

  // FILTER BY SEVERITY
  const onFilterSeverity = (value) => {
    globalVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    reset()
  }

  // FILTER BY STATUS
  const onFilterStatus = (value) => {
    globalVulnDispatch({ type: 'FILTER_STATUS', payload: value })
    reset()
  }

  // FILTER BY KEV
  const onFilterKev = (value) => {
    globalVulnDispatch({ type: 'FILTER_KEV', payload: value })
    reset()
  }
  // FILTER BY EPSS
  const onFilterEpss = (value) => {
    globalVulnDispatch({ type: 'FILTER_EPSS', payload: value })
    reset()
  }

  // FILTER BY CUSTOM EPSS RANGE
  const handleSubmit = () => {
    globalVulnDispatch({
      type: 'SET_EPSS',
      payload: `${globalVulnState?.minEpss}-${globalVulnState?.maxEpss}`
    })
    reset()
    onClose()
  }

  const onChangeMinEpss = (e) => {
    globalVulnDispatch({
      type: 'SET_MIN_EPSS',
      payload: e.target.value
    })
  }

  const onChangeMaxEpss = (e) => {
    globalVulnDispatch({
      type: 'SET_MAX_EPSS',
      payload: e.target.value
    })
  }

  const getStatus = (category) => {
    switch (category) {
      case 'products':
        return projectGroupIds?.length !== 0 && !projectGroupIds.includes('all')
      case 'envs':
        return projectNames.length !== 0 && !projectNames.includes('all')
      case 'severities':
        return severity?.length !== 0 && !severity.includes('all')
      case 'statuses':
        return status?.length !== 0 && !status.includes('all')
      case 'kev':
        return kev !== 'all' && kev !== ''
      case 'epss':
        return (epss !== '' && epss !== 'all') || minEpss !== 0 || maxEpss !== 0
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2}>
      {/* PRODUCTS */}
      <Box
        width={'fit-content'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Product'} active={getStatus('products')} />
          <MenuList
            minH={'auto'}
            maxH={'300px'}
            overflowY={'scroll'}
            fontSize={'sm'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={projectGroupIds}
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
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Severity'} active={getStatus('severities')} />
          <CustomList
            options={['critical', 'high', 'medium', 'low', 'unknown']}
            value={severity}
            onChange={onFilterSeverity}
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
          <MenuList fontSize={'sm'}>
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
                    onChange={onChangeMinEpss}
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
                    onChange={onChangeMaxEpss}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
              </Stack>
              <Button
                ml={8}
                my={3}
                size='sm'
                onClick={handleSubmit}
                title='Vuln EPSS filter submit'
                isDisabled={Number(maxEpss) <= Number(minEpss) || maxEpss === 0}
              >
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUS */}
      <Box
        width={'fit-content'}
        display={params?.productgroupid ? 'none' : 'block'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Status'} active={getStatus('statuses')} />
          <CustomList
            options={[
              'In Triage',
              'Not Affected',
              'Affected',
              'Fixed',
              'Unspecified'
            ]}
            value={status}
            onChange={onFilterStatus}
          />
        </Menu>
      </Box>
    </Stack>
  )
}

export default GlobalVulnsFilters
