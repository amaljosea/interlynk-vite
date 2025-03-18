import { isValidWebhookURL } from 'utils'

import {
  CreateSlackConnection,
  DeleteSlackConnection,
  UpdateSlackConnection
} from '../../graphQL/Mutation'
import ConfigModal from './ConfigModal'

const SlackConfigModal = ({
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
      createConnection={CreateSlackConnection}
      updateConnection={UpdateSlackConnection}
      deleteConnection={DeleteSlackConnection}
      validateAddress={isValidWebhookURL}
      title='Slack Configuration'
      addressPlaceholder='Paste Slack Webhook URL'
      greenCheckKey={'slack'}
    />
  )
}

export default SlackConfigModal
