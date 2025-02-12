import { useRef } from 'react'
import { vulnStatusTypes } from 'variables/general'

import { Button, Flex, Stack, useDisclosure } from '@chakra-ui/react'
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

import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'
import { severityList } from 'variables/general'

const VulnFilters = ({ reset }) => {
  const { prodVulnState, dispatch } = useGlobalState()
  const {
    severities,
    components,
    statues,
    include,
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
  const { vulnCompNames } = filters

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

  const onFilterDirect = (value) => {
    prodVulnDispatch({ type: 'FILTER_DIRECT', payload: value })
    reset()
  }

  const onFilterInclude = (value) => {
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: value })
    reset()
  }

  const handleSubmit = () => {
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    reset()
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* COMPONENT */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Component'}
          active={direct !== 'all' || components?.length > 0}
        />
        <MenuList
          minH={'auto'}
          maxH={'350px'}
          fontSize={'sm'}
          overflow={'hidden'}
          overflowY={'scroll'}
        >
          <MenuOptionGroup
            title='Dependency'
            type='radio'
            value={direct}
            onChange={onFilterDirect}
            textAlign={'left'}
          >
            {['all', 'direct only'].map((item, index) => (
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
            title='Name'
            type='checkbox'
            textAlign={'left'}
            value={components}
            onChange={onFilterCompName}
            fontSize='sm'
          >
            {vulnCompNames?.map((item, index) => (
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
      {/* STATUS */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Status'}
          active={vexComplete !== 'all' || statues?.length > 0}
        />
        <MenuList
          minH={'auto'}
          maxH={'400px'}
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
        <MenuList>
          <MenuOptionGroup
            type='checkbox'
            value={severities}
            onChange={onFilterSeverity}
          >
            <MenuItemOption value={'all'} fontSize={'sm'}>
              All
            </MenuItemOption>
            {severityList?.map(
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
      {/* KEV */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'KEV'} active={kev !== 'all' && kev !== ''} />
        <MenuList fontSize={'sm'}>
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
        <MenuHeading title={'Include'} active={include.length !== 0} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={include}
            onChange={onFilterInclude}
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
    </Stack>
  )
}

export default VulnFilters
