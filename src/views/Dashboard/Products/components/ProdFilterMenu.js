import { Box, Menu, Stack } from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

const ProdFilterMenu = ({ enabled, onFilter }) => {
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
    </Stack>
  )
}

export default ProdFilterMenu
