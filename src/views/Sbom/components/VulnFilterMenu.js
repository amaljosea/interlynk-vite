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
import GlobalContext from 'context/GlobalContext'
import CheckMark from 'components/Misc/CheckMark'
import { useContext, useRef } from 'react'
import { FaFilter } from 'react-icons/fa'
import Cookies from 'js-cookie'

const VulnFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows,
  setVulnAfter,
  setVulnBefore
}) => {
  const {
    vulnFilters,
    signedVulnFilters,
    vulnField,
    vulnDirection,
    signedVulnField,
    signedVulnDirection,
    vulnSeverity,
    setVulnSeverity,
    vulnComponent,
    setVulnComponent,
    vulnStatus,
    setVulnStatus,
    vulnKev,
    setVulnKev,
    vulnEpss,
    setVulnEpss,
    minVal,
    setMinVal,
    maxVal,
    setMaxVal,
    signedVulnSeverity,
    setSignedVulnSeverity,
    signedVulnComponent,
    setSignedVulnComponent,
    signedVulnStatus,
    setSignedVulnStatus,
    signedVulnKev,
    setSignedVulnKev,
    signedVulnEpss,
    setSignedVulnEpss,
    signedMinVal,
    setSignedMinVal,
    signedMaxVal,
    setSignedMaxVal
  } = useContext(GlobalContext)

  const minRef = useRef()
  const maxRef = useRef()

  const customerView = location.pathname.startsWith('/customer')
  const signedParams = Cookies.get(`signedParamId`)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { vulnCompNames, vulnStatuses } = customerView
    ? signedVulnFilters
    : vulnFilters

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

  const handleRefetch = async (severity, component, status, kev, epss) => {
    const epssRange = (epss !== '' || epss !== '0-0') && epss.split('-')
    // console.log('epss', epss)

    const range = {
      min: parseFloat(epssRange[0]) / 10000,
      max: parseFloat(epssRange[1]) / 10000
    }

    // console.log('range', range)

    await refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        signedParams: customerView ? signedParams : undefined,
        severity:
          !severity.includes('all') && severity.length > 0
            ? severity
            : undefined,
        componentName:
          !component.includes('all') && component.length > 0
            ? component
            : undefined,
        status:
          !status.includes('all') && status.length > 0 ? status : undefined,
        kev: kev === 'yes' ? true : kev === 'false' ? false : undefined,
        epss:
          epss === 'all' || epss === '0-0' || epss === '' ? undefined : range,
        first: totalRows,
        last: undefined,
        field: customerView ? signedVulnField : vulnField,
        direction: customerView ? signedVulnDirection : vulnDirection
      }
    })
  }

  const onFilterCompName = (value) => {
    setVulnAfter('')
    setVulnBefore('')
    if (customerView) {
      setSignedVulnComponent(value.includes('all') ? [] : value)
      handleRefetch(
        signedVulnSeverity,
        value,
        signedVulnStatus,
        signedVulnKev,
        signedVulnEpss
      )
    } else {
      setVulnComponent(value.includes('all') ? [] : value)
      handleRefetch(vulnSeverity, value, vulnStatus, vulnKev, vulnEpss)
    }
    setPageIndex(1)
  }

  const onFilterSeverity = (value) => {
    setVulnAfter('')
    setVulnBefore('')
    if (customerView) {
      setSignedVulnSeverity(value.includes('all') ? [] : value)
      handleRefetch(
        value,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        signedVulnEpss
      )
    } else {
      setVulnSeverity(value.includes('all') ? [] : value)
      handleRefetch(value, vulnComponent, vulnStatus, vulnKev, vulnEpss)
    }
    setPageIndex(1)
  }

  const onFilterStatus = (value) => {
    setVulnAfter('')
    setVulnBefore('')
    if (customerView) {
      setSignedVulnStatus(value.includes('all') ? [] : value)
      handleRefetch(
        signedVulnSeverity,
        signedVulnComponent,
        value,
        signedVulnKev,
        signedVulnEpss
      )
    } else {
      setVulnStatus(value.includes('all') ? [] : value)
      handleRefetch(vulnSeverity, vulnComponent, value, vulnKev, vulnEpss)
    }
    setPageIndex(1)
  }

  const onFilterKev = (value) => {
    setVulnAfter('')
    setVulnBefore('')
    if (customerView) {
      setSignedVulnKev(value)
      handleRefetch(
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        value,
        signedVulnEpss
      )
    } else {
      setVulnKev(value)
      handleRefetch(vulnSeverity, vulnComponent, vulnStatus, value, vulnEpss)
    }
    setPageIndex(1)
  }

  const onFilterEpss = (value) => {
    // console.log('vulnEpss', value)

    setVulnAfter('')
    setVulnBefore('')
    setMinVal(0)
    setMaxVal(10000)
    if (customerView) {
      setSignedVulnEpss(value)
      handleRefetch(
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        value
      )
    } else {
      setVulnEpss(value)
      handleRefetch(vulnSeverity, vulnComponent, vulnStatus, vulnKev, value)
    }
    setPageIndex(1)
  }

  const handleSubmit = () => {
    setVulnAfter('')
    setVulnBefore('')
    if (customerView) {
      setSignedVulnEpss(`${signedMinVal}-${signedMaxVal}`)
      handleRefetch(
        signedVulnSeverity,
        signedVulnComponent,
        signedVulnStatus,
        signedVulnKev,
        `${signedMinVal}-${signedMaxVal}`
      )
    } else {
      setVulnEpss(`${minVal}-${maxVal}`)
      handleRefetch(
        vulnSeverity,
        vulnComponent,
        vulnStatus,
        vulnKev,
        `${minVal}-${maxVal}`
      )
    }
    setPageIndex(1)
    onClose()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {(vulnSeverity.length !== 0 || signedVulnSeverity.length !== 0) && (
            <CheckMark />
          )}
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
              value={customerView ? signedVulnSeverity : vulnSeverity}
              onChange={onFilterSeverity}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {['critical', 'high', 'medium', 'low'].map((item, index) => (
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
        <Menu closeOnSelect={true}>
          {(vulnComponent.length !== 0 || signedVulnComponent.length !== 0) && (
            <CheckMark />
          )}
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
              value={customerView ? signedVulnComponent : vulnComponent}
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
        <Menu closeOnSelect={true}>
          {(vulnStatus.length !== 0 || signedVulnStatus.length !== 0) && (
            <CheckMark />
          )}
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
              value={customerView ? signedVulnStatus : vulnStatus}
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
        <Menu closeOnSelect={true}>
          {((vulnKev !== 'all' && vulnKev !== '') ||
            (signedVulnKev !== 'all' && signedVulnKev !== '')) && <CheckMark />}
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
            <MenuOptionGroup
              type='radio'
              value={customerView ? signedVulnKev : vulnKev}
              onChange={onFilterKev}
            >
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
        <Menu closeOnSelect={true} isOpen={isOpen} onClose={onClose}>
          {((vulnEpss !== '' && vulnEpss !== 'all') ||
            signedVulnEpss !== '') && <CheckMark />}
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
            <MenuOptionGroup
              type='radio'
              value={customerView ? signedVulnEpss : vulnEpss}
              onChange={onFilterEpss}
            >
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
                  value={customerView ? signedMinVal : minVal}
                  ref={minRef}
                  onKeyDown={onMinKeyDown}
                  onChange={(e) =>
                    customerView
                      ? setSignedMinVal(e.target.value)
                      : setMinVal(e.target.value)
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
                  value={customerView ? signedMaxVal : maxVal}
                  ref={maxRef}
                  onKeyDown={onMaxKeyDown}
                  onChange={(e) =>
                    customerView
                      ? setSignedMaxVal(e.target.value)
                      : setMaxVal(e.target.value)
                  }
                />
              </Stack>
              <Button
                ml={8}
                my={2}
                size='sm'
                onClick={handleSubmit}
                isDisabled={
                  Number(maxVal) <= Number(minVal) ||
                  maxVal === 0 ||
                  minVal === ''
                }
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
