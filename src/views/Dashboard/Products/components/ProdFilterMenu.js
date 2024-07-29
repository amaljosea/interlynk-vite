import { useState } from 'react'
import { hexToRGBA } from 'utils'
import { labels as tags } from 'variables/general'

import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Tag
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

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
          {enabled !== undefined && <CheckMark />}
          <MenuHeading title={'Active'} />
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
          {labels?.length !== 0 && <CheckMark />}
          <MenuHeading title={'Labels'} />
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
