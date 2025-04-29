import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { vulnStatusTypes } from 'variables/general'
import { severityList } from 'variables/general'

import { Button, Flex, Stack, useDisclosure } from '@chakra-ui/react'
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

import { AsyncFilter } from 'components/AsyncFilter'
import CustomList from 'components/Misc/CustomList'
import GlobalLabelFilter from 'components/Misc/GlobalLabelFilter'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useSelect } from 'hooks/useSelect'

import { GetProjectGroupLazyDropdownQuery } from 'graphQL/Queries'

const GlobalVulnsFilters = ({ reset }) => {
  const params = useParams()
  const { globalVulnState, dispatch } = useGlobalState()
  const {
    projectGroupLabelIds,
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
  const { isProductsPage } = useRouteFlags()
  const { style } = useSelect('filter')

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
  const onFilterLabel = (value) => {
    globalVulnDispatch({ type: 'FILTER_LABEL', payload: value })
    reset()
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

  const { lazyDropDownProps } = useLazyDropDown(
    GetProjectGroupLazyDropdownQuery,
    {
      skip: isProductsPage ? true : false,
      selector: 'organization.projectGroups',
      variables: {
        field: 'PROJECT_GROUPS_NAME',
        direction: 'ASC',
        first: 5,
        enabled: true
      },
      selectorForActualCount: 'organization.allProjectGroups',
      styles: style,
      onChange: onFilterProduct,
      components: {
        IndicatorSeparator: () => null,
        DropdownIndicator: null
      },
      placeholder: 'Product'
    }
  )

  return (
    <Stack direction={'row'} alignItems={'center'} spacing={2}>
      {/* LABELS */}
      {!params?.productgroupid && (
        <GlobalLabelFilter
          value={projectGroupLabelIds}
          setValue={onFilterLabel}
        />
      )}

      {/* PRODUCTS */}
      {!params?.productgroupid && (
        <AsyncFilter
          lazyDropDownProps={lazyDropDownProps}
          isActive={getStatus('products')}
        />
      )}
      {/* SEVERITY */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Severity'} active={getStatus('severities')} />
        <CustomList
          options={severityList}
          value={severity}
          onChange={onFilterSeverity}
        />
      </Menu>
      {/* KEV */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'KEV'} active={getStatus('kev')} />
        <CustomList
          type='radio'
          options={['yes', 'no']}
          value={kev}
          onChange={onFilterKev}
        />
      </Menu>
      {/* EPSS */}
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
      {/* STATUS */}
      {!params?.productgroupid && (
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Status'} active={getStatus('statuses')} />
          <CustomList
            value={status}
            options={vulnStatusTypes}
            onChange={onFilterStatus}
          />
        </Menu>
      )}
    </Stack>
  )
}

export default GlobalVulnsFilters
