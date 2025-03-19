import { useMemo } from 'react'
import { calculateExpiryDate, getFullDate } from 'utils'

import { Divider, Grid, Stack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'

const SupportExpand = (props) => {
  const { data } = props

  return useMemo(() => {
    const { duplicates, sbom } = data || {}
    const { project, projectVersion } = sbom || {}
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

    const source = sbom
      ? `${project?.projectGroup?.name} ${projectVersion && `: ${projectVersion}`}`
      : `N/A`

    return (
      <Stack
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(4, 1fr)' py={2} gap={6}>
          {/* PART */}
          <DetailItem label='Source' value={source} />
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
        <Divider hidden={!duplicates} />
        {duplicates?.length > 0 &&
          duplicates.map((item, index) => {
            const { sbom, componentSupportLevel } = item || {}
            const { project, projectVersion } = sbom || {}
            const { notes, user, updatedAt, retainManualOverrideFor, level } =
              componentSupportLevel || {}

            const part = sbom
              ? `${project?.projectGroup?.name} ${projectVersion && `: ${projectVersion}`}`
              : `N/A`
            const partLevel = level ? level?.replaceAll('_', ' ') : 'N/A'
            const partAssessment = user?.name ? 'Manual' : 'Automatic'
            const partInternalNotes = notes || 'N/A'
            const partLastAssessedBy =
              componentSupportLevel?.user?.name || 'N/A'
            const partLastAssessedAt = updatedAt
              ? getFullDate(updatedAt)
              : 'N/A'
            const partAssessmentExpiresOn = retainManualOverrideFor
              ? calculateExpiryDate(retainManualOverrideFor)
              : 'N/A'

            return (
              <Grid key={index} templateColumns='repeat(4, 1fr)' py={2} gap={6}>
                {/* PART */}
                <DetailItem label='Source' value={part} />
                {/* ASSESSMENT */}
                <DetailItem label='Assessment' value={partAssessment} />
                {/* LEVEL */}
                <DetailItem
                  label='Level'
                  value={partLevel}
                  valueStyle={{ textTransform: 'capitalize' }}
                />
                {/* ASSESSED DATE */}
                <DetailItem label='Last Assessed' value={partLastAssessedAt} />
                {/* ASSESSED BY */}
                <DetailItem
                  label='Last Assessed By'
                  value={partLastAssessedBy}
                />
                {/* INTERNAL NOTES */}
                <DetailItem
                  label='Support Explanation'
                  value={partInternalNotes}
                />
                {/* ASSESSMENT EXPIERS ON */}
                {level !== 'no_longer_maintained' && (
                  <DetailItem
                    label='Assessment Expires On'
                    value={partAssessmentExpiresOn}
                  />
                )}
              </Grid>
            )
          })}
      </Stack>
    )
  }, [data])
}

export default SupportExpand
