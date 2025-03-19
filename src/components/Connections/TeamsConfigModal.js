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
  org,
  hostId
}) => {
  return (
    <ConfigModal
      isOpen={isOpen}
      onClose={onClose}
      data={data}
      setGreenCheck={setGreenCheck}
      org={org}
      hostId={hostId}
      createConnection={CreateTeamsConnection}
      updateConnection={UpdateTeamsConnection}
      deleteConnection={DeleteTeamsConnection}
      title='Teams Configuration'
      addressPlaceholder='Enter Teams webhook URL'
      greenCheckKey={'teams'}
    />
  )
}

export default TeamsConfigModal
