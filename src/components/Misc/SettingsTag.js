import { Box, IconButton, Tooltip } from '@chakra-ui/react'

export const SettingsTag = ({ icon, label, isDisabled, rounded, hidden }) => {
  return (
    <Tooltip label={label}>
      <Box hidden={hidden}>
        <IconButton
          borderRadius={rounded ? 'full' : 'md'}
          size='xs'
          icon={icon}
          colorScheme={'blue'}
          disabled={isDisabled}
        />
      </Box>
    </Tooltip>
  )
}
