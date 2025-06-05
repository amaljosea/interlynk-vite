import { useMemo } from 'react'
import { calculateExpiryDate, getSignedUrlParams } from 'utils'
import { openSsf } from 'variables/general'

import { Box, Flex, Grid, Tag, Text, Tooltip, VStack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'
import SupplierTag from 'components/SupplierTag'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

const ExpandedComponent = (props) => {
  const { data, isArchived, action } = props
  const {
    version,
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data || {}
  const { endDate, retainManualOverrideFor, notes, user } = manual || {}
  const openSSF = openSsf?.find((item) => item?.name === data?.purl)

  const { isCustomerView } = useRouteFlags()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()

  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  const getDate = (value) =>
    value ? `${new Date(value).toLocaleDateString()}` : `N/A`

  const getSupportLevel = (value) => {
    if (!value || value === '') return 'N/A'
    return value?.replaceAll('_', ' ')
  }

  return useMemo(() => {
    const name = data?.name
    const type = data?.kind
    const suppliers = data?.suppliers
    const description = data?.description
    const dependsOn = data?.dependsOn
    const dependencyOf = data?.dependencyOf
    const purl = data?.purl
    const purlForDisplay = decodeURI(purl)
    const cpes = data?.cpes
    const scope = data?.scope
    const licensesExp = data?.licensesExp
    const openSsfScore = openSSF?.score
    const level = manual?.level || automatic?.level
    const supportLevel = getSupportLevel(level)
    const endOfSupportDate = getDate(endDate)
    const assessmentExpiresOn = calculateExpiryDate(retainManualOverrideFor)
    const explanation = notes || automatic?.notes || 'N/A'
    const assessedBy = user?.name || 'N/A'
    const { packageVersion, latestPackageVersion } = data?.enrichedContent || {}

    const isOutdated =
      latestPackageVersion?.version &&
      latestPackageVersion?.version !== packageVersion?.version

    const purlColor = purl && primaryBlueText
    const cpesColor = cpes?.length > 0 && primaryBlueText

    const showSupplierForEnterprise =
      !isCustomerView && !signedUrlParams && suppliers?.length === 0

    const showCustomerSupplier = isCustomerView && suppliers?.length === 0

    const VersionPreview = () => {
      return (
        <Flex alignItems={'center'} gap={isOutdated ? 2 : 0}>
          <Text fontSize={14} color={primaryTextColor}>
            {version || 'N/A'}
          </Text>
          {isOutdated && latestPackageVersion?.version && (
            <Tooltip label={'Latest'}>
              <Text fontSize={14} color={primaryBlueText}>
                {`(${latestPackageVersion?.version})`}
              </Text>
            </Tooltip>
          )}
        </Flex>
      )
    }

    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(4, 1fr)' py={2} gap={6}>
          {/* NAME */}
          <DetailItem label='Name' value={name || 'N/A'} />
          {/* VERSION */}
          <DetailItem label='Version' value={<VersionPreview />} />
          {/* TYPE */}
          <DetailItem label='Type' value={type || 'N/A'} />
          {/* Supplier */}
          <DetailItem
            label='Supplier'
            value={
              showSupplierForEnterprise || showCustomerSupplier
                ? 'N/A'
                : undefined
            }
          >
            <VStack spacing={4} alignItems={'left'}>
              {!showSupplierForEnterprise && (
                <>
                  {suppliers?.map((item, index) => (
                    <SupplierTag
                      key={index}
                      item={item}
                      editable={false}
                      onDelete={() => action('delete_component_supplier', item)}
                    />
                  ))}
                </>
              )}
              {!showCustomerSupplier && showSupplierForEnterprise && (
                <>
                  {suppliers?.map((item, index) => (
                    <SupplierTag key={index} item={item} editable={false} />
                  ))}
                </>
              )}
            </VStack>
          </DetailItem>
          {/* Description */}
          <DetailItem
            colSpan={3}
            label='Description'
            value={description || 'N/A'}
          />
          {/*  Depends On */}
          <DetailItem
            colSpan={4}
            label='Depends On'
            value={dependsOn?.length === 0 && 'N/A'}
          >
            <Flex alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependsOn?.length > 0 &&
                [...dependsOn]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((comp, index) => (
                    <Tag
                      key={index}
                      variant='subtle'
                      colorScheme={'blue'}
                      sx={{ p: 1, workBreak: 'break-all' }}
                      cursor={isCustomerView ? 'inherit' : 'pointer'}
                      onClick={() =>
                        !isCustomerView &&
                        action('view_component_relation', comp?.toComp)
                      }
                    >
                      <Text wordBreak={'break-all'}>
                        {comp.toComp.name}-{comp.toComp.version}
                      </Text>
                    </Tag>
                  ))}
            </Flex>
          </DetailItem>
          {/* Dependency Of */}
          <DetailItem
            colSpan={4}
            label='Dependency Of'
            value={dependencyOf?.length === 0 && 'N/A'}
          >
            <Flex alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependencyOf?.length > 0 &&
                dependencyOf?.map((comp, index) => (
                  <Tag
                    padding={1}
                    key={index}
                    variant='subtle'
                    colorScheme={'blue'}
                    cursor={isCustomerView ? 'inherit' : 'pointer'}
                    onClick={() =>
                      !isCustomerView &&
                      action('view_component_relation', comp?.fromComp)
                    }
                  >
                    <Text wordBreak={'break-all'}>
                      {comp.fromComp.name}-{comp.fromComp.version}
                    </Text>
                  </Tag>
                ))}
            </Flex>
          </DetailItem>
          {/* PURL */}
          <DetailItem
            cursor='pointer'
            onClick={() => action('view_purl', data)}
            value={purl ? purlForDisplay : 'N/A'}
            label='PURL'
            valueStyle={purl && { color: purlColor }}
          />
          {/* CPES */}
          <DetailItem
            cursor={cpes?.length > 0 ? 'pointer' : 'default'}
            label='CPES'
            value={cpes?.length > 0 ? cpes[0] : 'N/A'}
            onClick={() => action('view_cpe', data)}
            valueStyle={cpes?.length > 0 && { color: cpesColor }}
          />
          {/* Scope */}
          <DetailItem
            label='Scope'
            value={scope || 'N/A'}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* Licenses */}
          <DetailItem label='Licenses' value={licensesExp || 'N/A'} />
          {/*  OpenSSF Scorecard */}
          <DetailItem label='OpenSSF Scorecard' value={openSsfScore || 'N/A'} />
          {/* Support Level */}
          <DetailItem
            label='Support Level'
            value={supportLevel}
            hidden={isCustomerView || isFreeTier}
            valueStyle={{ textTransform: 'capitalize' }}
          />
          {/* End-of-Support Date */}
          <DetailItem
            label='End-of-Support Date'
            hidden={isCustomerView || isFreeTier}
            value={endOfSupportDate}
          />
          {/* ASSESSMENT EXPIERS ON */}
          <DetailItem
            label='Assessment Expires On'
            hidden={isCustomerView || isFreeTier}
            value={assessmentExpiresOn}
          />
          {/* SUPPORT EXPLANATION */}
          <DetailItem
            label='Support Explanation'
            hidden={isCustomerView || isFreeTier}
            value={explanation}
          />
          {/* LAST ASSESSED BY */}
          <DetailItem
            label='Last Assessed By'
            value={assessedBy}
            hidden={isCustomerView || isFreeTier}
          />
        </Grid>
      </Box>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isCustomerView, signedUrlParams, openSSF?.score, isArchived])
}

export default ExpandedComponent
