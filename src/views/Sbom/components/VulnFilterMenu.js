import { Box, Button, Flex, Input, InputGroup, InputLeftAddon, InputRightAddon, Menu, MenuDivider, MenuItemOption, MenuList, MenuOptionGroup, Stack, Switch, Text, useDisclosure } from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { useGlobalState } from 'hooks/useGlobalState'
import MenuHeading from 'components/Misc/MenuHeading'
import { useRef } from 'react'

const VulnFilterMenu = ({ refetch, productId, sbomId }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { totalRows, prodVulnState, dispatch } = useGlobalState()
  const { field, direction, severities, components, statues, source, kev, epss, filters, minEpss, maxEpss, direct, vexComplete } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const minRef = useRef()
  const maxRef = useRef()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { vulnCompNames, vulnStatuses, vulnSeverities } = filters

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

  const handleRefetch = ( source, severity, component, status, kev, epss, direct, complete ) => {
    const epssRange = epss !== 'all' && epss !== '' && epss.split('-')
    const range = { min: parseFloat(epssRange[0]) / 100, max: parseFloat(epssRange[1]) / 100 }
    refetch({
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId,
      source: source === true ? undefined : 'COMPONENT',
      vexComplete: complete,
      severity: !severity.includes('all') && severity.length > 0 ? severity : undefined,
      componentName: !component.includes('all') && component.length > 0 ? component : undefined,
      status: !status.includes('all') && status.length > 0 ? status : undefined,
      kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
      epss: epss === 'all' || epss === '' ? undefined : range,
      direct: direct === true ? true : undefined,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    })
  }

  const onFilterOrigin = (e) => {
    prodVulnDispatch({ type: 'FILTER_SOURCE', payload: e.target.checked })
    handleRefetch(e.target.checked, severities, components, statues, kev, epss, direct, vexComplete)
  }

  const onFilterCompName = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPONENT', payload: value })
    handleRefetch(source, severities, value, statues, kev, epss, direct, vexComplete)
  }

  const onFilterSeverity = (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    handleRefetch(source, value, components, statues, kev, epss, direct, vexComplete)
  }

  const onFilterStatus = (value) => {
    prodVulnDispatch({ type: 'FILTER_STATUS', payload: value })
    handleRefetch(source, severities, components, value, kev, epss, direct, vexComplete)
  }

  const onFilterComplete = (e) => {
    prodVulnDispatch({ type: 'FILTER_COMPLETE', payload: e.target.checked })
    handleRefetch(source, severities, components, statues, kev, epss, direct, e.target.checked)
  }

  const onFilterKev = (value) => {
    prodVulnDispatch({ type: 'FILTER_KEV', payload: value })
    handleRefetch(source, severities, components, statues, value, epss, direct, vexComplete)
  }

  const onFilterEpss = (value) => {
    prodVulnDispatch({ type: 'FILTER_EPSS', payload: value })
    handleRefetch(source, severities, components, statues, kev, value, direct, vexComplete)
  }

  const onFilterDirect = (e) => {
    prodVulnDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    handleRefetch( source, severities, components, statues, kev, epss, e.target.checked, vexComplete )
  }

  const handleSubmit = () => {
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    handleRefetch( source, severities, components, statues, kev, `${minEpss}-${maxEpss}`, direct, vexComplete)
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {severities.length !== 0 && <CheckMark />}
          <MenuHeading title={'Severity'} />
          <MenuList>
            <MenuOptionGroup type='checkbox' value={severities} onChange={onFilterSeverity}>
              <MenuItemOption value={'all'} fontSize={'sm'}>All</MenuItemOption>
              {vulnSeverities?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* COMPONENT NAME */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {components.length !== 0 && <CheckMark />}
          <MenuHeading title={'Component'} />
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup type='checkbox' value={components} onChange={onFilterCompName}>
              <MenuItemOption value={'all'} fontSize={'sm'}>All</MenuItemOption>
              {vulnCompNames?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && <CheckMark />}
          <MenuHeading title={'Status'} />
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup type='checkbox' value={statues} onChange={onFilterStatus}>
              <MenuItemOption value={'all'} fontSize={'sm'}>All</MenuItemOption>
              {vulnStatuses?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
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
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'}>
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
              <MenuItemOption value={'all'} fontSize={'sm'}>All</MenuItemOption>
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
              <Button ml={8} my={3} size='sm' onClick={handleSubmit} isDisabled={Number(maxEpss) <= Number(minEpss) || maxEpss === 0} >
                Submit
              </Button>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <Switch id='isDirect' isChecked={direct} onChange={onFilterDirect} />
        <Text>Direct</Text>
      </Flex>
      {/* ORIGIN */}
      <Flex align='center' gap={2}>
        <Switch id='isDirect' isChecked={source} onChange={onFilterOrigin} />
        <Text>Parts</Text>
      </Flex>
      {/* INCOMPLETE STATUS */}
      <Flex align='center' gap={2}>
        <Switch id='incompleteStatus' isChecked={vexComplete} onChange={onFilterComplete} />
        <Text>Incomplete Status</Text>
      </Flex>
    </Stack>
  )
}

export default VulnFilterMenu
