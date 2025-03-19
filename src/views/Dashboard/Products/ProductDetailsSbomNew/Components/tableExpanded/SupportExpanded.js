import { useMemo } from 'react'
import { calculateExpiryDate, getFullDate } from 'utils'

import { Grid, Stack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'

const SupportExpand = (props) => {
  const { data } = props

  return useMemo(() => {
    const { sbom } = data || {}
    const { projectVersion } = sbom || {}
    const { notes, user, updatedAt, retainManualOverrideFor, level } =
      data?.componentSupportLevel || {}

    const internalNotes = notes || 'N/A'
    const assessment = user?.name ? 'Manual' : 'Automatic'
    const supportLevel = level ? level?.replaceAll('_', ' ') : 'N/A'
    const lastAssessedBy = user?.name || 'N/A'
    const lastAssessedAt = updatedAt ? getFullDate(updatedAt) : 'N/A'
    const assessmentExpiresOn = retainManualOverrideFor
      ? calculateExpiryDate(retainManualOverrideFor)
      : 'N/A'

    return (
      <Stack
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(4, 1fr)' py={2} gap={6}>
          {/* PART */}
          <DetailItem label='Version' value={projectVersion} />
          {/* ASSESSMENT */}
          <DetailItem label='Assessment' value={assessment} />
          {/* LEVEL */}
          <DetailItem
            label='Level'
            value={supportLevel}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* ASSESSED DATE */}
          <DetailItem label='Last Assessed' value={lastAssessedAt} />
          {/* ASSESSED BY */}
          <DetailItem label='Last Assessed By' value={lastAssessedBy} />
          {/* INTERNAL NOTES */}
          <DetailItem label='Support Explanation' value={internalNotes} />
          {/* ASSESSMENT EXPIERS ON */}
          {level !== 'no_longer_maintained' && (
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

export default SupportExpand
