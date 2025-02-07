import { useQuery } from '@apollo/client'

import {
  Flex,
  SkeletonText,
  Stack,
  Tag,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'

import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { ActiveCompliances } from 'graphQL/Queries'

import ComplianceModal from './ComplianceModal'
import QualityScoreModal from './QualityScoreModal'

const Compliance = () => {
  const tab = useQueryParam('tab')

  const COMPLIANCE = useDisclosure()
  const SCORE = useDisclosure()
  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const canEdit = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const { data: compliances, loading } = useQuery(ActiveCompliances, {
    skip: tab === 'compliance' ? false : true
  })

  const { activeCompliances } = compliances?.organization || ''
  const complianceExists = activeCompliances?.length > 0

  const qualitySore = activeCompliances?.filter((item) => item?.scoreEnabled)

  if (loading)
    return (
      <SkeletonText my={4} noOfLines={2} spacing='4' skeletonHeight='20px' />
    )

  return (
    <>
      <Stack spacing={6} py={2}>
        {/* APPLICABLE COMPLIANCE */}
        <Flex gap={2} alignItems={'center'}>
          <Text fontWeight={'medium'}>Applicable Compliance :</Text>
          <Flex gap={2} alignItems={'center'}>
            {activeCompliances
              ?.filter((item) => item?.complianceType !== 'unspecified')
              ?.map((item) => (
                <Tag
                  key={item?.id}
                  colorScheme='orange'
                  textTransform={'uppercase'}
                >
                  {item?.complianceType}
                </Tag>
              ))}
          </Flex>
          <ActiveBtn
            hidden={!canEdit}
            label={'add_compliance'}
            onClick={COMPLIANCE.onOpen}
            editable={complianceExists ? true : false}
            title={complianceExists ? 'Update' : 'Add'}
            color={complianceExists ? sameSecondaryText : primaryBlueText}
          />
        </Flex>
        {/* SBOM QUALITY SCORE */}
        <Flex gap={2} alignItems={'center'}>
          <Text fontWeight={'medium'}>SBOM Quality Score :</Text>
          <Flex gap={2} alignItems={'center'}>
            {qualitySore?.map((item) => (
              <Tag key={item?.id} colorScheme='orange'>
                {item?.complianceType === 'unspecified'
                  ? 'None'
                  : item?.complianceType?.toUpperCase()}
              </Tag>
            ))}
          </Flex>
          <ActiveBtn
            hidden={!canEdit}
            label={'update_score'}
            onClick={SCORE.onOpen}
            editable={complianceExists ? true : false}
            title={qualitySore?.length > 0 ? 'Update' : 'Add'}
            color={complianceExists ? sameSecondaryText : primaryBlueText}
          />
        </Flex>
      </Stack>

      {/* COMPLIANCE UPDATE MODAL */}
      {COMPLIANCE.isOpen && (
        <ComplianceModal
          data={activeCompliances}
          isOpen={COMPLIANCE.isOpen}
          onClose={COMPLIANCE.onClose}
        />
      )}

      {/* SBOM QUALITY SCORE MODAL */}
      {SCORE.isOpen && (
        <QualityScoreModal
          data={activeCompliances}
          isOpen={SCORE.isOpen}
          onClose={SCORE.onClose}
        />
      )}
    </>
  )
}

export default Compliance
