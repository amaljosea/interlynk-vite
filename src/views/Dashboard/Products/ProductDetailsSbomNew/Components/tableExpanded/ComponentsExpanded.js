import { useMemo } from 'react'
import {
  capitalizeFirstLetter,
  getSignedUrlParams,
  isCustomerView
} from 'utils'
import { openSsf } from 'variables/general'

import { Box, Flex, Grid, Tag, Text, VStack } from '@chakra-ui/react'

import DetailItem from 'components/Misc/DetailItem'
import SupplierTag from 'components/SupplierTag'

import { useThemeColor } from 'hooks/useThemeColors'

const ExpandedComponent = (props) => {
  const {
    data,
    isArchived,
    onDeleteSup,
    onCheckPurl,
    onCheckCpe,
    handleGraphView
  } = props
  const openSSF = openSsf?.find((item) => item?.name === data?.purl)

  const customerView = isCustomerView()
  const signedUrlParams = getSignedUrlParams()

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

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
    const supportLevel = data?.componentSupportLevel?.level
      ? capitalizeFirstLetter(
          data?.componentSupportLevel?.level?.replaceAll('_', ' ')
        )
      : ''
    const endOfSupportDate = data?.componentSupportLevel?.endDate

    const purlColor = purl && primaryBlueText
    const cpesColor = cpes?.length > 0 && primaryBlueText

    const getDate = (value) =>
      value ? `${new Date(value).toLocaleDateString()}` : `N/A`

    const showSupplierForEnterprise =
      !customerView && !signedUrlParams && suppliers?.length === 0

    const showCustomerSupplier = customerView && suppliers?.length === 0

    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(3, 1fr)' py={2} gap={6}>
          {/* NAME */}
          <DetailItem label='Name' value={name || 'N/A'} />
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
                      premission={isArchived}
                      onDelete={() => onDeleteSup(item)}
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
            value={dependsOn?.length === 0 && 'N/A'}
            colSpan={3}
            label='Depends On'
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
                      cursor={customerView ? 'inherit' : 'pointer'}
                      onClick={() =>
                        !customerView && handleGraphView(comp?.toComp)
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
            colSpan={3}
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
                    cursor={customerView ? 'inherit' : 'pointer'}
                    onClick={() =>
                      !customerView && handleGraphView(comp?.fromComp)
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
            onClick={() => (customerView ? null : onCheckPurl(data))}
            value={purl ? purlForDisplay : 'N/A'}
            label='PURL'
            valueStyle={purl && { color: purlColor }}
          />
          {/* CPES */}
          <DetailItem
            cursor={cpes?.length > 0 ? 'pointer' : 'default'}
            label='CPES'
            value={cpes?.length > 0 ? cpes[0] : 'N/A'}
            onClick={() => (customerView ? null : onCheckCpe(data))}
            valueStyle={cpes?.length > 0 && { color: cpesColor }}
          />
          {/* Scope */}
          <DetailItem label='Scope' value={scope || 'N/A'} />
          {/* Licenses */}
          <DetailItem label='Licenses' value={licensesExp || 'N/A'} />
          {/*  OpenSSF Scorecard */}
          <DetailItem label='OpenSSF Scorecard' value={openSsfScore || 'N/A'} />
          {/* Support Level */}
          <DetailItem
            hidden={customerView}
            label='Support Level'
            value={supportLevel || 'N/A'}
          />
          {/*  End-of-Support Date */}
          <DetailItem
            hidden={customerView}
            label='End-of-Support Date'
            value={getDate(endOfSupportDate) || 'N/A'}
          />
        </Grid>
      </Box>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    customerView,
    signedUrlParams,
    openSSF?.score,
    handleGraphView,
    isArchived,
    onDeleteSup,
    onCheckPurl,
    onCheckCpe
  ])
}

export default ExpandedComponent
