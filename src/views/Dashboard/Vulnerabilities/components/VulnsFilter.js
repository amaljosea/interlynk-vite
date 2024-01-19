import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { FaFilter } from 'react-icons/fa'
import { useState } from 'react'
import FilterButton from 'components/Misc/FilterButton'

const VulnsFilters = () => {
  const [severity, setSeverity] = useState([])
  const [statuses, setStatuses] = useState([])
  const [kev, setKev] = useState('')
  const [epss, setEpss] = useState('')

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* SEVERITY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {severity.length !== 0 && !severity.includes('all') && <CheckMark />}
          <FilterButton>Severity</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={severity}
              onChange={(value) =>
                setSeverity(value.includes('all') ? [] : value)
              }
            >
              {['all', 'critical', 'high', 'medium', 'low'].map(
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
      {/* STATUSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {statuses.length !== 0 && !statuses.includes('all') && <CheckMark />}
          <FilterButton>Status</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={statuses}
              onChange={(value) =>
                setStatuses(value.includes('all') ? [] : value)
              }
            >
              {[
                'all',
                'Unspecified',
                'In Triage',
                'Not Affected',
                'False Positive',
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
      </Box>
      {/* KEV */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {kev !== 'all' && kev !== '' && <CheckMark />}
          <FilterButton>KEV</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={kev}
              onChange={(value) => setKev(value)}
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
        <Menu closeOnSelect={true}>
          {epss !== '' && epss !== 'all' && <CheckMark />}
          <FilterButton>EPSS</FilterButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={epss}
              onChange={(value) => setEpss(value)}
            >
              {['all', '0-100', '100-500', '500-1000', '1000-10000'].map(
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
    </Stack>
  )
}

export default VulnsFilters
