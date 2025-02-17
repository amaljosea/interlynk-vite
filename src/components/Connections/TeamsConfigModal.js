import { IoSettingsOutline } from 'react-icons/io5'

import {
  CreateTeamsConnection,
  DeleteTeamsConnection,
  UpdateTeamsConnection
} from '../../graphQL/Mutation'
import ConfigModal from './ConfigModal'

const TeamsConfigModal = ({
  isOpen,
  onClose,
  data,
  setGreenCheck,
  updateCon,
  org,
  hostId
}) => {
  const notificationOptions = [
    { value: 'All', label: 'All' },
    { value: 'Alert', label: 'Alert' },
    { value: 'Warning', label: 'Warning' },
    { value: 'Info', label: 'Info' }
  ]

  return (
    <ConfigModal
      isOpen={isOpen}
      onClose={onClose}
      data={data}
      setGreenCheck={setGreenCheck}
      updateCon={updateCon}
      org={org}
      hostId={hostId}
      createConnection={CreateTeamsConnection}
      updateConnection={UpdateTeamsConnection}
      deleteConnection={DeleteTeamsConnection}
      title='Teams Configuration'
      addressPlaceholder='Enter Teams webhook URL'
      icon={IoSettingsOutline}
      options={notificationOptions}
      greenCheckKey={'teams'}
    />
  )
}

export default TeamsConfigModal
