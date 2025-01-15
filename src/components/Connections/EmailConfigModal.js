import { validateEmail } from 'utils/formValidationUtils'

import { IoSettingsOutline } from 'react-icons/io5'

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
      createConnection={CreateEmailConnection}
      updateConnection={UpdateEmailConnection}
      deleteConnection={DeleteEmailConnection}
      validateAddress={validateEmail}
      title='Email Configuration'
      addressPlaceholder='Enter email address'
      icon={IoSettingsOutline}
      options={notificationOptions}
      greenCheckKey={'email'}
    />
  )
}

export default EmailConfigModal
