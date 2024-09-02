import { IoSettingsOutline } from 'react-icons/io5'

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
  updateCon,
  org,
  hostId
}) => {
  const isValidWebhookURL = (url) => {
    try {
      // Check if the URL is valid and uses HTTPS
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== 'https:') {
        return false
      }

      // Patterns for Microsoft Teams and Slack webhooks
      const teamsWebhookPattern =
        /https:\/\/outlook\.office\.com\/webhook\/.*\/IncomingWebhook\/.*\/.*$/
      const slackWebhookPattern =
        /https:\/\/hooks\.slack\.com\/services\/.*\/.*\/.*$/

      // Check if the URL matches either pattern
      return teamsWebhookPattern.test(url) || slackWebhookPattern.test(url)
    } catch (e) {
      return false
    }
  }

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
      createConnection={CreateSlackConnection}
      updateConnection={UpdateSlackConnection}
      deleteConnection={DeleteSlackConnection}
      validateAddress={isValidWebhookURL}
      title='Slack Configuration'
      addressPlaceholder='Paste Slack Webhook URL'
      icon={IoSettingsOutline}
      options={notificationOptions}
      greenCheckKey={'slack'}
    />
  )
}

export default SlackConfigModal
