import { useMemo } from 'react'
import { calculateExpiryDate, getFullDate } from 'utils'

import { Divider, Grid, Stack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'

const SupportInfo = ({ data }) => {
  const {
    version,
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data || {}
  const {
    user,
    retainManualOverrideFor,
    updatedAt,
    endOfSupport: endDate
  } = manual || {}

  const assessment = manual?.user ? 'Manual' : 'Automatic'
  const supportLevel = manual?.level || automatic?.level
  const explanation = manual?.notes || automatic?.notes
  const endOfSupport = endDate ? getFullDate(endDate) : 'N/A'
  const assessmentExpiresOn = calculateExpiryDate(retainManualOverrideFor)
  const assessedBy = user?.name || 'N/A'
  const lastAssessed = updatedAt ? getFullDate(updatedAt) : 'N/A'

  return (
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
        <DetailItem label='Assessment Expires On' value={assessmentExpiresOn} />
      )}
    </Grid>
  )
}

const SupportExpanded = (props) => {
  const { data } = props

  return useMemo(() => {
    const { occurrences } = data || {}

    return (
      <Stack
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        {occurrences?.map((item, index) => (
          <>
            <SupportInfo key={index} data={item} />
            <Divider hidden={index === occurrences?.length - 1} />
          </>
        ))}
      </Stack>
    )
  }, [data])
}

export default SupportExpanded
