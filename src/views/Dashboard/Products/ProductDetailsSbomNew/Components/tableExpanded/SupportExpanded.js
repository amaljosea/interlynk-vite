import { useMemo } from 'react'
import { calculateExpiryDate, getFullDate } from 'utils'

import { Box, Grid } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'

const SupportExpand = (props) => {
  const { data } = props
  const { notes, user, updatedAt, retainManualOverrideFor } =
    data?.componentSupportLevel || {}

  return useMemo(() => {
    const internalNotes = notes || 'N/A'
    const lastAssessedBy = user?.name || 'N/A'
    const lastAssessedAt = updatedAt ? getFullDate(updatedAt) : 'N/A'
    const assessmentExpiresOn = retainManualOverrideFor
      ? calculateExpiryDate(retainManualOverrideFor)
      : 'N/A'

    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(3, 1fr)' py={2} gap={6}>
          {/* ASSESSED DATE */}
          <DetailItem label='Last Assessed' value={lastAssessedAt} />
          {/* ASSESSED BY */}
          <DetailItem label='Last Assessed By' value={lastAssessedBy} />
          {/* INTERNAL NOTES */}
          <DetailItem label='Support Explanation' value={internalNotes} />
          {/* ASSESSMENT EXPIERS ON */}
          <DetailItem
            label='Assessment Expires On'
            value={assessmentExpiresOn}
          />
        </Grid>
      </Box>
    )
  }, [notes, retainManualOverrideFor, updatedAt, user?.name])
}

export default SupportExpand
