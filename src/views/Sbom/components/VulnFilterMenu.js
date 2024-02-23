import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { useGlobalState } from 'hooks/useGlobalState'
import MenuHeading from 'components/Misc/MenuHeading'
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
    maxEpss,
    direct
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

  const handleRefetch = () => {
    const epssRange = epss !== 'all' && epss !== '' && epss.split('-')

    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }

    refetch({
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId,
      source: source === 'BOTH' || source === '' ? undefined : source,
      severity:
        !severities.includes('all') && severities.length > 0
          ? severities
          : undefined,
      componentName:
        !components.includes('all') && components.length > 0
          ? components
          : undefined,
      status:
        !statues.includes('all') && statues.length > 0 ? statues : undefined,
      kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
      epss: epss === 'all' || epss === '' ? undefined : range,
      direct: direct === 'Yes' ? true : false,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      field: field,
      direction: direction
    })
  }

  const onFilterSource = (value) => {
    prodVulnDispatch({ type: 'FILTER_SOURCE', payload: value })
    handleRefetch()
  }

  const onFilterCompName = (value) => {
    prodVulnDispatch({ type: 'FILTER_COMPONENT', payload: value })
    handleRefetch()
  }

  const onFilterSeverity = (value) => {
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    handleRefetch()
  }

  const onFilterStatus = (value) => {
    prodVulnDispatch({ type: 'FILTER_STATUS', payload: value })
    handleRefetch()
  }

  const onFilterKev = (value) => {
    prodVulnDispatch({ type: 'FILTER_KEV', payload: value })
    handleRefetch()
  }

  const onFilterEpss = (value) => {
    prodVulnDispatch({ type: 'FILTER_EPSS', payload: value })
    handleRefetch()
  }

  const onFilterDirect = (value) => {
    prodVulnDispatch({ type: 'FILTER_DIRECT', payload: value })
    handleRefetch()
  }

  const handleSubmit = () => {
    prodVulnDispatch({ type: 'SET_EPSS', payload: `${minEpss}-${maxEpss}` })
    handleRefetch()
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ORIGIN */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {source !== '' && source !== 'BOTH' && <CheckMark />}
          <MenuHeading title={'Origin'} />
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
      <Box width={'fit-content'} position={'relative'}>
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
          <MenuHeading title={'EPSS*'} onClick={onOpen} />
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
      {/* DIRECT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {direct !== '' && <CheckMark />}
          <MenuHeading title={'Direct'} />
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={direct}
              onChange={onFilterDirect}
            >
              <MenuItemOption value={'Yes'} fontSize={'sm'}>
                Yes
              </MenuItemOption>
              <MenuItemOption value={'No'} fontSize={'sm'}>
                No
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default VulnFilterMenu
