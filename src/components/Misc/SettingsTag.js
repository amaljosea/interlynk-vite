import { Box, IconButton, Tooltip } from '@chakra-ui/react'

export const SettingsTag = ({ icon, label, isDisabled, rounded }) => {
  return (
    <Tooltip label={label}>
      <Box>
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
