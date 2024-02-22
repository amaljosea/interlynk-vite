import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import { useGlobalState } from 'hooks/useGlobalState'
import MenuHeading from 'components/Misc/MenuHeading'

const LogFilterMenu = ({ refetch, productId, sbomId }) => {
  const { totalRows, sbomLogState, dispatch } = useGlobalState()
  const { filters, field, direction, users, objects, types } = sbomLogState
  const { logChangeBys, logChangeObjects, logChangeTypes } = filters || ''
  const { sbomLogDispatch } = dispatch

  const onFilterChangeBy = (value) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changedBy: value.includes('all') ? undefined : value,
      first: totalRows,
      field: field,
      direction: direction
    })
    sbomLogDispatch({
      type: 'FILTER_USER',
      payload: value.includes('all') ? [] : value
    })
  }

  const onFilterChangeObj = (value) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeObject: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: field,
      direction: direction
    })
    sbomLogDispatch({
      type: 'FILTER_OBJECT',
      payload: value
    })
  }

  const onFilterChangeType = (value) => {
    refetch({
      projectId: productId,
      sbomId: sbomId,
      changeType: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: field,
      direction: direction
    })
    sbomLogDispatch({
      type: 'FILTER_TYPE',
      payload: value
    })
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* USER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {users?.length !== 0 && <CheckMark />}
          <MenuHeading title={'User'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={users}
              onChange={onFilterChangeBy}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeBys?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* OBJECT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {objects?.length !== 0 && <CheckMark />}
          <MenuHeading title={'Object'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={objects}
              onChange={onFilterChangeObj}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeObjects?.map((item, index) => (
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
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {types?.length !== 0 && <CheckMark />}
          <MenuHeading title={'Type'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={types}
              onChange={onFilterChangeType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {logChangeTypes?.map((item, index) => (
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
    </Stack>
  )
}

export default LogFilterMenu
