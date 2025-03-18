import { validateEmail } from 'utils/formValidationUtils'

import {
  CreateEmailConnection,
  DeleteEmailConnection,
  UpdateEmailConnection
} from '../../graphQL/Mutation'
import ConfigModal from './ConfigModal'

const EmailConfigModal = ({
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
      createConnection={CreateEmailConnection}
      updateConnection={UpdateEmailConnection}
      deleteConnection={DeleteEmailConnection}
      validateAddress={validateEmail}
      title='Email Configuration'
      addressPlaceholder='Enter email address'
      greenCheckKey={'email'}
    />
  )
}

export default EmailConfigModal
