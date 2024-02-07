import {
  Stack,
  Text,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton
} from '@chakra-ui/react'
import { purlString } from 'utils'

const PurlCard = ({ value }) => {
  return (
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader>PURL</PopoverHeader>
      <PopoverBody>
        <Stack spacing={1}>
          {purlString(value)?.type && (
            <Text fontSize='sm'>
              Type: <strong>{purlString(value)?.type}</strong>
            </Text>
          )}
          {purlString(value)?.namespace && (
            <Text fontSize='sm'>
              Namespace: <strong>{purlString(value)?.namespace}</strong>
            </Text>
          )}
          {purlString(value)?.name && (
            <Text fontSize='sm'>
              Package Name: <strong>{purlString(value)?.name}</strong>
            </Text>
          )}
          {purlString(value)?.version && (
            <Text fontSize='sm'>
              Package Version: <strong>{purlString(value)?.version}</strong>
            </Text>
          )}
          {purlString(value)?.qualifiers && (
            <Text fontSize='sm'>
              Qualifiers:{' '}
              <strong>
                {JSON.stringify(purlString(value)?.qualifiers || '')}
              </strong>
            </Text>
          )}
        </Stack>
      </PopoverBody>
    </PopoverContent>
  )
}

export default PurlCard
