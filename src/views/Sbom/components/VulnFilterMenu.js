import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { FaFilter } from 'react-icons/fa'
import { useGlobalState } from 'hooks/useGlobalState'
import { useRef } from 'react'

const VulnFilterMenu = ({ refetch, productId, sbomId }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { totalRows, prodVulnState, dispatch } = useGlobalState()
  const {
    field,
    direction,
    severities,
    components,
    statues,
    source,
    kev,
    epss,
    filters,
    minEpss,
    maxEpss
  } = prodVulnState
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

  const handleRefetch = async (
    source,
    severity,
    component,
    status,
    kev,
    epss
  ) => {
    const epssRange = epss !== 'all' && epss !== '' && epss.split('-')

    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }

    await refetch({
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId,
      source: source === 'BOTH' || source === '' ? undefined : source,
      severity:
        !severity.includes('all') && severity.length > 0 ? severity : undefined,
      componentName:
        !component.includes('all') && component.length > 0
          ? component
          : undefined,
      status: !status.includes('all') && status.length > 0 ? status : undefined,
      kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
      epss: epss === 'all' || epss === '' ? undefined : range,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: signedUrlParams ? undefined : field,
      direction: signedUrlParams ? undefined : direction
    })
  }

  const onFilterSource = (value) => {
    handleRefetch(value, severities, components, statues, kev, epss)
    prodVulnDispatch({ type: 'FILTER_SOURCE', payload: value })
  }

  const onFilterCompName = (value) => {
    handleRefetch(source, severities, value, statues, kev, epss)
    prodVulnDispatch({ type: 'FILTER_COMPONENT', payload: value })
  }

  const onFilterSeverity = (value) => {
    handleRefetch(source, value, components, statues, kev, epss)
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
  }

  const onFilterStatus = (value) => {
    handleRefetch(source, severities, components, value, kev, epss)
    prodVulnDispatch({ type: 'FILTER_STATUS', payload: value })
  }

  const onFilterKev = (value) => {
    handleRefetch(source, severities, components, statues, value, epss)
    prodVulnDispatch({ type: 'FILTER_KEV', payload: value })
  }

  const onFilterEpss = (value) => {
    handleRefetch(source, severities, components, statues, kev, value)
    prodVulnDispatch({ type: 'FILTER_EPSS', payload: value })
  }

  const handleSubmit = () => {
    handleRefetch(
      source,
      severities,
      components,
      statues,
      kev,
      `${minEpss}-${maxEpss}`
    )
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ORIGIN */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {source !== '' && source !== 'BOTH' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Origin
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={source}
              onChange={onFilterSource}
            >
              <MenuItemOption value={'BOTH'} fontSize={'sm'}>
                Both
              </MenuItemOption>
              <MenuItemOption value={'COMPONENT'} fontSize={'sm'}>
                Component
              </MenuItemOption>
              <MenuItemOption value={'PART'} fontSize={'sm'}>
                Part
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {severities.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Severity
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severities}
              onChange={onFilterSeverity}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {vulnSeverities?.map((item, index) => (
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
      {/* COMPONENT NAME */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {components.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Component
          </MenuButton>
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
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {statues.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Status
          </MenuButton>
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
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            KEV
          </MenuButton>
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
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
            onClick={onOpen}
          >
            EPSS*
          </MenuButton>
          <MenuList>
            <MenuOptionGroup type='radio' value={epss} onChange={onFilterEpss}>
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['0-100', '100-500', '500-1000', '1000-10000'].map(
                (item, index) => (
                  <MenuItemOption key={index} value={item} fontSize={'sm'}>
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
                    prodVulnDispatch({
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
                    prodVulnDispatch({
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

export default VulnFilterMenu
