import { timeSince } from 'utils'

import { Stack, Text } from '@chakra-ui/react'

const VexInfoDrawer = ({ data }) => {
  const {
    changedBy,
    status,
    updatedAt,
    justification,
    note,
    impact,
    detail,
    fixedIn,
    actionStmt
  } = data || ''

  return (
    <Stack spacing={1}>
      <Text>Status: {status || 'N/A'}</Text>
      <Text>Justification: {justification || 'N/A'}</Text>
      <Text>Impact Statement: {impact || 'N/A'}</Text>
      <Text>Internal Notes: {note || 'N/A'}</Text>
      <Text>Action Statement: {actionStmt || 'N/A'}</Text>
      <Text>Fixed Version: {fixedIn || 'N/A'}</Text>
      <Text>Detail: {detail || 'N/A'}</Text>
      <Text>Created By: {changedBy || 'N/A'}</Text>
      <Text>Created On: {timeSince(updatedAt) || 'N/A'}</Text>
    </Stack>
  )
}

export default VexInfoDrawer
