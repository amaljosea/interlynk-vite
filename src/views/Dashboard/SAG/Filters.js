import { Box, Menu, MenuItemOption, MenuList, MenuOptionGroup, Stack } from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'
import { sagLabelTypes, sagCategories } from 'variables/general'

const SagFilters = ({ category, setCategory, label, setLabel, supplier, setSupplier }) => {

  const onFilterSupplier = (value) => {
    if (value === 'all') {
      setSupplier('')
    } else {
      setSupplier(value)
    }
  }

  const onFilterCategory = (value) => {
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
       {/* SUPPLIER */}
       <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          {(supplier !== 'all' && supplier !== '') && <CheckMark />}
          <MenuHeading title={'Supplier'} />
          <MenuList>
            <MenuOptionGroup type='radio' value={supplier} onChange={onFilterSupplier}>
              {['all','Reliable Energy Analytics LLC', 'Interlynk'].map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'} textTransform={'capitalize'} >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* CATEGORY */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu placement='top' closeOnSelect={false}>
          {(category !== 'all' && category !== '') && <CheckMark />}
          <MenuHeading title={'Product Category'} />
          <MenuList>
            <MenuOptionGroup type='radio' value={category} onChange={onFilterCategory}>
              {sagCategories.map((item, index) => (
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
          <MenuHeading title={'Label Type'} />
          <MenuList minW='auto' maxW={'320px'} minH={'auto'} maxH={'300px'} overflowY={'scroll'} >
            <MenuOptionGroup type='radio' value={label} onChange={onFilterLabel}>
              {sagLabelTypes.map((item, index) => (
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
