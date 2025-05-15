import { useRef } from 'react'
import { vulnStatusTypes } from 'variables/general'
import { severityList } from 'variables/general'

import { Button, Flex, Stack, Text, useDisclosure } from '@chakra-ui/react'
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon
} from '@chakra-ui/react'
import {
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const VulnFilters = ({ reset }) => {
  const { prodVulnState, dispatch } = useGlobalState()
  const {
    severities,
    components,
    statues,
    exclude,
    kev,
    epss,
    filters,
    minEpss,
    maxEpss,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const minRef = useRef()
  const maxRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { vulnCompNames } = filters || ''

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

  const onFilterCompName = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPONENT', payload: value })
    reset()
  }

  const onFilterSeverity = (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    reset()
  }

  const onFilterStatus = (value) => {
    prodVulnDispatch({ type: 'FILTER_STATUS', payload: value })
    reset()
  }

  const onFilterComplete = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPLETE', payload: value })
    reset()
  }

  const onFilterKev = (value) => {
    prodVulnDispatch({ type: 'FILTER_KEV', payload: value })
    reset()
  }

  const onFilterEpss = (value) => {
    prodVulnDispatch({ type: 'FILTER_EPSS', payload: value })
    reset()
  }

  const onFilterDirect = (e) => {
    prodVulnDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    reset()
  }

  const onFilterExclude = (value) => {
    prodVulnDispatch({ type: 'FILTER_EXCLUDE', payload: value })
    reset()
  }

  const handleSubmit = () => {
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    reset()
    onClose()
  }

  return (
    <Flex gap={2} alignItems={'center'}>
      {/* COMPONENT */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Component'} active={components?.length > 0} />
        <MenuList
          minH={'auto'}
          maxH={'300px'}
          fontSize={'sm'}
          overflow={'hidden'}
          overflowY={'scroll'}
        >
          <MenuOptionGroup
            type='checkbox'
            textAlign={'left'}
            value={components}
            onChange={onFilterCompName}
            fontSize='sm'
          >
            <MenuItemOption value={'all'} fontSize={'sm'}>
              All
            </MenuItemOption>
            {vulnCompNames?.map((item, index) => (
              <MenuItemOption key={index} value={item} fontSize={'sm'}>
                {item}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      {/* STATUS */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Status'}
          active={vexComplete !== 'all' || statues?.length > 0}
        />
        <MenuList
          minH={'auto'}
          maxH={'300px'}
          fontSize={'sm'}
          overflow={'hidden'}
          overflowY={'scroll'}
        >
          <MenuOptionGroup
            title='Completeness'
            value={vexComplete}
            onChange={onFilterComplete}
            type='radio'
            textAlign={'left'}
          >
            {['all', 'incomplete only'].map((item, index) => (
              <MenuItemOption
                key={index}
                value={item}
                textTransform={'capitalize'}
                fontSize={'sm'}
              >
                {item}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            title='Values'
            type='checkbox'
            textAlign={'left'}
            value={statues}
            onChange={onFilterStatus}
            fontSize={'sm'}
          >
            {vulnStatusTypes.map((item, index) => (
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
      {/* SEVERITY */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Severity'} active={severities.length !== 0} />
        <CustomList
          options={severityList}
          value={severities}
          onChange={onFilterSeverity}
        />
      </Menu>
      {/* KEV */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'KEV'} active={kev !== 'all' && kev !== ''} />
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
          active={epss !== '' && epss !== 'all'}
        />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup type='radio' value={epss} onChange={onFilterEpss}>
            <MenuItemOption value={'all'} fontSize={'sm'}>
              All
            </MenuItemOption>
            {['0-0.1', '0.1-1', '1-10', '10-100'].map((item, index) => (
              <MenuItemOption
                key={index}
                value={item}
                fontSize={'sm'}
              >{`${item} %`}</MenuItemOption>
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
                  onChange={(e) =>
                    prodVulnDispatch({
                      type: 'SET_MIN_EPSS',
                      payload: e.target.value
                    })
                  }
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
                  onChange={(e) =>
                    prodVulnDispatch({
                      type: 'SET_MAX_EPSS',
                      payload: e.target.value
                    })
                  }
                />
                <InputRightAddon>%</InputRightAddon>
              </InputGroup>
            </Stack>
            <Button
              ml={8}
              my={3}
              size='sm'
              title='Vuln EPSS filter submit'
              onClick={handleSubmit}
              isDisabled={Number(maxEpss) <= Number(minEpss) || maxEpss === 0}
            >
              Submit
            </Button>
          </Flex>
        </MenuList>
      </Menu>
      {/* INCLUDE */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Exclude'} active={exclude.length !== 0} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={exclude}
            onChange={onFilterExclude}
          >
            {['parts', 'retracted'].map((item, index) => (
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
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='isDirect'
          isChecked={direct}
          onChange={onFilterDirect}
        />
        <Text fontSize='sm'>Direct Only</Text>
      </Flex>
    </Flex>
  )
}

export default VulnFilters
