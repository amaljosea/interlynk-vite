import { useMemo } from 'react'
import { calculateExpiryDate, getFullDate } from 'utils'

import { Grid, Stack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'

const SupportExpanded = (props) => {
  const { data } = props

  return useMemo(() => {
    const { version } = data || {}
    const {
      componentSupportLevel: manual,
      componentSupportLevelAutomatic: automatic
    } = data || {}
    const { user, retainManualOverrideFor, updatedAt } = manual || {}

    const assessment = manual?.level ? 'Manual' : 'Automatic'

    // AUTOMATIC SUPPORT LEVEL
    const systemSupportLevel = automatic?.level
      ? automatic?.level?.replaceAll('_', ' ')
      : 'N/A'
    const systemNotes = automatic?.notes || 'N/A'

    // MANNUAL SUPPORT LEVEL
    const manualSupportLevel = manual?.level
      ? manual?.level?.replaceAll('_', ' ')
      : 'N/A'
    const manualNotes = manual?.notes || 'N/A'
    const assessmentExpiresOn = calculateExpiryDate(retainManualOverrideFor)
    const assessedBy = user?.name || 'N/A'
    const lastAssessed = updatedAt ? getFullDate(updatedAt) : 'N/A'

    return (
      <Stack
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(4, 1fr)' py={2} gap={6}>
          {/* PART */}
          <DetailItem label='Version' value={version} />
          {/* ASSESSMENT */}
          <DetailItem label='Assessment' value={assessment} />
          {/* SYSTEM LEVEL */}
          <DetailItem
            label='Level (Auto Suggested)'
            value={systemSupportLevel}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* SYSTEM LEVEL */}
          <DetailItem
            label='Level (Manual Override)'
            value={manualSupportLevel}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* ASSESSED DATE */}
          <DetailItem label='Last Assessed' value={lastAssessed} />
          {/* ASSESSED BY */}
          <DetailItem label='Last Assessed By' value={assessedBy} />
          {/* INTERNAL NOTES */}
          <DetailItem label='Notes (Auto Suggested)' value={systemNotes} />
          {/* SYSTEM NOTES */}
          <DetailItem label='Notes (Manual Override)' value={manualNotes} />
          {/* ASSESSMENT EXPIERS ON */}
          {manualSupportLevel !== 'no_longer_maintained' && (
            <DetailItem
              label='Assessment Expires On'
              value={assessmentExpiresOn}
            />
          )}
        </Grid>
      </Stack>
    )
  }, [data])
}

export default SupportExpanded
