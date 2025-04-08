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

    const assessment = automatic?.level ? 'Automatic' : 'Manual'
    const supportLevel = manual?.level || automatic?.level
    const assessmentExpiresOn = retainManualOverrideFor
      ? calculateExpiryDate(retainManualOverrideFor)
      : 'N/A'
    const explanation = manual?.notes || automatic?.notes
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
          {/* LEVEL */}
          <DetailItem
            label='Level'
            value={supportLevel?.replaceAll('_', ' ')}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* ASSESSED DATE */}
          <DetailItem label='Last Assessed' value={lastAssessed} />
          {/* ASSESSED BY */}
          <DetailItem label='Last Assessed By' value={assessedBy} />
          {/* INTERNAL NOTES */}
          <DetailItem
            label='Support Explanation'
            value={explanation || 'N/A'}
          />
          {/* ASSESSMENT EXPIERS ON */}
          {supportLevel !== 'no_longer_maintained' && (
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
