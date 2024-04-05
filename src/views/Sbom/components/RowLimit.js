import { Select, Stack, Text } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

const RowLimit = ({ onChange, name }) => {
  const { totalRows } = useGlobalState()

  return (
    <Stack alignItems={'center'} direction={'row'} spacing={4}>
      <Text>Show</Text>
      <Select
        id={name}
        name={name}
        width={20}
        value={totalRows}
        onChange={onChange}
      >
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </Select>
    </Stack>
  )
}

export default RowLimit
