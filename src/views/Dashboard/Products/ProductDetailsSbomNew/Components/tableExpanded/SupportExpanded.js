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
    const {
      user,
      retainManualOverrideFor,
      updatedAt,
      endOfSupport: endDate
    } = manual || {}

    const assessment = manual?.level ? 'Manual' : 'Automatic'
    const supportLevel = manual?.level || automatic?.level
    const explanation = manual?.notes || automatic?.notes
    const endOfSupport = endDate ? getFullDate(endDate) : 'N/A'
    const assessmentExpiresOn = calculateExpiryDate(retainManualOverrideFor)
    const assessedBy = user?.name || 'N/A'
    const lastAssessed = updatedAt ? getFullDate(updatedAt) : 'N/A'

    return (
      <Stack
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(4, 1fr)' py={2} gap={6}>
          {/* COMPONENT VERSION */}
          <DetailItem label='Component Version' value={version} />
          {/* SYSTEM LEVEL */}
          <DetailItem
            label='Level'
            value={supportLevel?.replaceAll('_', ' ') || 'N/A'}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* END OF SUPPORT */}
          <DetailItem label='End of Support' value={endOfSupport} />
          {/* EXPLANATION */}
          <DetailItem label='Explanation' value={explanation} />
          {/* ASSESSMENT */}
          <DetailItem label='Assessment' value={assessment} />
          {/* ASSESSED DATE */}
          <DetailItem label='Last Assessed' value={lastAssessed} />
          {/* ASSESSED BY */}
          <DetailItem label='Last Assessed By' value={assessedBy} />
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
