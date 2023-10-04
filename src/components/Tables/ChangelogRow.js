import { Td, Tr, Tag, Tooltip, Text } from '@chakra-ui/react'

function ChangelogRow(props) {
  const { type, object, prevValue, newValue, changedBy, time } = props

  const setColor = (type) => {
    switch (type) {
      case 'added':
        return 'green'
      case 'modified':
        return 'pink'
      case 'deleted':
        return 'red'
    }
  }

  return (
    <Tr>
      <Td pl={0} textTransform={'capitalize'}>
        <Tag
          variant='subtle'
          colorScheme={setColor(type)}
          style={{ width: '80px', margin: 'center' }}
        >
          {type}
        </Tag>
      </Td>
      <Td textTransform={'capitalize'}>
        <Tooltip label={object} placement='top'>
          <Text>
            {object !== null
              ? `${object?.substring(0, 15)}${object.length > 15 ? '...': ''}`
              : ''}
          </Text>
        </Tooltip>
      </Td>
      <Td>{prevValue}</Td>
      <Td>
        <Tooltip label={newValue} placement='top'>
          <Text>
            {newValue !== ''
              ? `${newValue?.substring(0, 15)}${newValue.length > 15 ? '...' : ''}`
              : ''}
          </Text>
        </Tooltip>
      </Td>
      <Td width={'200px'}>{changedBy}</Td>
      <Td>
        {new Date(time).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'America/Los_Angeles'
        })}{' '}
        {new Date(time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Los_Angeles'
        })}
      </Td>
    </Tr>
  )
}

export default ChangelogRow
