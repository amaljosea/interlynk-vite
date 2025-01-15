import { getIcon, getLabel } from 'utils/styleUtils'

import { Box, Icon, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

const SubjectIcon = ({ subject, isSystem = { isSystem } }) => {
  const { headingTextSecondary, primaryBlueText } = useThemeColor([
    'headingTextSecondary',
    'primaryBlueText'
  ])
  return (
    <Box hidden={subject === ''} mt={2}>
      <Tooltip label={getLabel(subject)} placement='top'>
        <Box>
          <Icon
            color={isSystem ? headingTextSecondary : primaryBlueText}
            as={getIcon(subject)}
          />
        </Box>
      </Tooltip>
    </Box>
  )
}
export default SubjectIcon
