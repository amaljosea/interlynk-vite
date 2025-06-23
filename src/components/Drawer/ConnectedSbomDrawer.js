import { statusColor } from 'utils/styleUtils'

import { Tag, TagLabel, Text } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'

import { useThemeColor } from 'hooks/useThemeColors'

const ConnectedSbomDrawer = ({ data, isOpen, onClose }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const connectedSboms = data?.connectedSboms || []

  const columns = [
    {
      id: 'PRODUCT',
      name: 'PRODUCT',
      wrap: true,
      selector: (row) => {
        const { project } = row || {}
        return (
          <Text fontSize={14} color={primaryTextColor}>
            {project?.projectGroup?.name || 'N/A'}
          </Text>
        )
      }
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      wrap: true,
      selector: (row) => {
        const { projectVersion } = row || {}
        return (
          <Text fontSize={14} color={primaryTextColor}>
            {projectVersion || 'N/A'}
          </Text>
        )
      }
    },
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      wrap: true,
      selector: (row) => {
        const { project } = row || {}
        return (
          <Text fontSize={14} color={primaryTextColor}>
            {project?.name || 'N/A'}
          </Text>
        )
      }
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      right: 'true',
      wrap: true,
      selector: (row) => {
        const { parentDispositionFrom } = row || {}
        const { vexStatus } = parentDispositionFrom || {}
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
              {vexStatus?.name || 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      }
    }
  ]

  return (
    <LynkDrawer
      size='xl'
      noFooter
      isOpen={isOpen}
      onClose={onClose}
      title={'Also Affected'}
    >
      <LynkTable
        columns={columns}
        data={connectedSboms}
        className='data-table-container'
      />
    </LynkDrawer>
  )
}

export default ConnectedSbomDrawer
