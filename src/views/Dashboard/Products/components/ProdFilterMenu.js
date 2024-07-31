import { useState } from 'react'
import { hexToRGBA } from 'utils'
import { labels as tags } from 'variables/general'

import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Tag,
  useColorModeValue
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { FaFilter } from 'react-icons/fa'
import { FaTags } from 'react-icons/fa6'

const ProdFilterMenu = ({ enabled, onFilter }) => {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const prodLabels = [{ name: 'All', color: '#CBD5E0' }, ...tags]
  const [labels, setLabels] = useState([])
  const onFilterLabel = (value) => {
    setLabels(value?.includes('All') ? [] : value)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ACTIVE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Active'}
            icon={FaFilter}
            active={enabled !== undefined}
          />
          <CustomList
            type='radio'
            options={['yes', 'no']}
            value={enabled === true ? 'yes' : enabled === false ? 'no' : 'all'}
            onChange={onFilter}
          />
        </Menu>
      </Box>
      {/* LABELS */}
      <Box
        width={'fit-content'}
        position={'relative'}
        display={shouldShowDemoFeatures ? 'flex' : 'none'}
      >
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Labels'}
            icon={FaTags}
            active={labels?.length !== 0}
          />
          <MenuList minH='auto' maxH={'350px'} overflowY={'scroll'}>
            <MenuOptionGroup
              type={'checkbox'}
              value={labels}
              onChange={onFilterLabel}
            >
              {prodLabels?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  maxW={'300px'}
                  fontSize={'sm'}
                  value={item?.name}
                  wordBreak={'break-all'}
                >
                  <Tag
                    width={'fit-content'}
                    borderColor={item?.color}
                    bg={hexToRGBA(item?.color, 0.5)}
                  >
                    {item?.name}
                  </Tag>
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu

const MenuHeading = ({ title, icon: Icon, onClick, active }) => {
  const grayBorder = useColorModeValue('#1A202C29', '#ffffff29')
  const grayText = useColorModeValue('#03030399', '#60686f')
  const bgActive = useColorModeValue('#EDF2F7', '')
  const iconColor = '#3182CE'

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      leftIcon={<Icon size={14} color={active ? iconColor : grayText} />}
      onClick={onClick}
      variant='outline'
      borderColor={active ? iconColor : grayBorder}
      color={active ? iconColor : grayText}
      backgroundColor={active ? bgActive : 'transparent'}
    >
      {title}
    </MenuButton>
  )
}
