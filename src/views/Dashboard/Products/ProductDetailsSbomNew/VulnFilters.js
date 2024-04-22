import { useRef } from 'react'

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
  Switch,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const VulnFilters = () => {
  const { prodVulnState, dispatch } = useGlobalState()
  const {
    severities,
    components,
    statues,
    source,
    include,
    kev,
    epss,
    filters,
    minEpss,
    maxEpss,
    direct,
    retracted,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const minRef = useRef()
  const maxRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { vulnCompNames, vulnStatuses } = filters

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

  const onFilterOrigin = (e) => {
    prodVulnDispatch({ type: 'FILTER_SOURCE', payload: e.target.checked })
  }

  const onFilterRetracted = (e) => {
    prodVulnDispatch({ type: 'FILTER_RETRACTED', payload: e.target.checked })
  }

  const onFilterCompName = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPONENT', payload: value })
  }

  const onFilterSeverity = (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
  }

  const onFilterStatus = (value) => {
    prodVulnDispatch({ type: 'FILTER_STATUS', payload: value })
  }

  const onFilterComplete = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPLETE', payload: value })
  }

  const onFilterKev = (value) => {
    prodVulnDispatch({ type: 'FILTER_KEV', payload: value })
  }

  const onFilterEpss = (value) => {
    prodVulnDispatch({ type: 'FILTER_EPSS', payload: value })
  }

  const onFilterDirect = (value) => {
    prodVulnDispatch({ type: 'FILTER_DIRECT', payload: value })
  }

  const onFilterInclude = (value) => {
    console.log('value', value)
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: value })
  }

  const handleSubmit = () => {
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* COMPONENT */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Component'} />
        <MenuList
          minH={'auto'}
          maxH={'400px'}
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
        <MenuHeading title={'Status'} />
        <MenuList
          minH={'auto'}
          maxH={'400px'}
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
            {[
              'Unspecified',
              'In Triage',
              'Not Affected',
              'Affected',
              'Fixed'
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
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {severities.length !== 0 && <CheckMark />}
          <MenuHeading title={'Severity'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severities}
              onChange={onFilterSeverity}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['critical', 'high', 'medium', 'low', 'unknown']?.map(
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
      {/* COMPONENT NAME */}
      <Box width={'fit-content'} position={'relative'} hidden>
        <Menu closeOnSelect={false}>
          {components.length !== 0 && <CheckMark />}
          <MenuHeading title={'Component'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={components}
              onChange={onFilterCompName}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
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
      </Box>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'} hidden>
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={statues}
              onChange={onFilterStatus}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {vulnStatuses?.map((item, index) => (
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
                onClick={handleSubmit}
                isDisabled={Number(maxEpss) <= Number(minEpss) || maxEpss === 0}
              >
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
      {/* INCLUDE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {include.length !== 0 && <CheckMark />}
          <MenuHeading title={'Include'} />
          <MenuList>
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
      </Box>
      {/* ORIGIN */}
      <Flex align='center' gap={2} hidden>
        <Switch id='isDirect' isChecked={source} onChange={onFilterOrigin} />
        <Text>Parts</Text>
      </Flex>
      {/* RETRACTED */}
      <Flex align='center' gap={2} hidden>
        <Switch
          id='retracted'
          isChecked={retracted}
          onChange={onFilterRetracted}
        />
        <Text>Retracted</Text>
      </Flex>
    </Stack>
  )
}

export default VulnFilters
