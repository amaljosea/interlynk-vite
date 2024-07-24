import { useState } from 'react'

import { Box, Menu, Stack } from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

const ProdFilterMenu = ({ enabled, onFilter }) => {
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const [labels, setLabels] = useState([])
  const onFilterLabel = (value) => {
    setLabels(value?.includes('all') ? [] : value)
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
          <CustomList
            type='checkbox'
            options={[
              'bug',
              'demo',
              'dependencies',
              'documentation',
              'enhancement',
              'FDA'
            ]}
            value={labels}
            onChange={onFilterLabel}
          />
        </Menu>
      </Box>
    </Stack>
  )
}

export default ProdFilterMenu
