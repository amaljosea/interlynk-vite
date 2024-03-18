import { Box, Menu, MenuItemOption, MenuList, MenuOptionGroup, Stack } from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

const SagFilters = ({ category, setCategory, label, setLabel }) => {

  const onFilterCategory = (value) => {
    console.log('value', value)
    if (value === 'all') {
      setCategory('')
    } else {
      setCategory(value)
    }
  }

  const onFilterLabel = (value) => {
    if (value === 'all') {
      setLabel('')
    } else {
      setLabel(value)
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* CATEGORY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          {(category !== 'all' && category !== '') && <CheckMark />}
          <MenuHeading title={'Category'} />
          <MenuList>
            <MenuOptionGroup type='radio' value={category} onChange={onFilterCategory}>
              {['all','Internet Web Service API','Desktop Software Application','Vendor Response File'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'} >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* LABEL */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          {(label !== 'all' && label !== '') && <CheckMark />}
          <MenuHeading title={'Label'} />
          <MenuList minW='auto' maxW={'320px'} minH={'auto'} maxH={'300px'} overflowY={'scroll'} >
            <MenuOptionGroup type='radio' value={label} onChange={onFilterLabel}>
              {['all','SAG Trusted Software','SAG Trusted Artifact','SAG Purl SWID Trusted Product'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'} wordBreak={'break-all'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default SagFilters
