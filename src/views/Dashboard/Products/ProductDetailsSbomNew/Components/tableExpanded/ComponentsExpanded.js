import React, { useMemo } from 'react'
import { getFullDateAndTime, getSignedUrlParams, isCustomerView } from 'utils'
import { parseLicenseString } from 'utils'
import { openSsf } from 'variables/general'

import { Box, Flex, Tag, Text, VStack } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'

import { CustomText } from 'components/Misc/CustomText'
import SupplierTag from 'components/SupplierTag'

import { useThemeColor } from 'hooks/useThemeColors'

const ExpandedComponent = ({
  data,
  isArchived,
  onDeleteSup,
  onCheckPurl,
  onCheckCpe,
  handleGraphView
}) => {
  const {
    scope,
    suppliers,
    purl,
    description,
    cpes,
    name,
    kind,
    internal,
    licenses,
    licensesExp,
    licensesCustom,
    supportLevel,
    endOfSupport,
    dependencyOf,
    dependsOn
  } = data
  const openSSF = openSsf?.find((item) => item?.name === purl)
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const customerView = isCustomerView()
  const signedUrlParams = getSignedUrlParams()

  return useMemo(() => {
    const textStyle = {
      color: primaryTextColor,
      mt: 1,
      fontSize: 14,
      workBreak: 'break-all'
    }
    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(3, 1fr)' py={2} gap={6}>
          <GridItem colSpan={3}>
            <CustomText>Name :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {name || 'N/A'}
            </Text>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {description !== null ? description : 'N/A'}
            </Text>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>Depends On :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependsOn?.length > 0 ? (
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
                  ))
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Dependency Of :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {dependencyOf?.length > 0 ? (
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
                ))
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>Type :</CustomText>
            <Text sx={textStyle}>{kind || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Internal :</CustomText>
            <Text sx={textStyle}>{internal ? 'True' : 'False'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Supplier :</CustomText>
            <VStack spacing={4} mt={1} alignItems={'left'}>
              {!customerView ? (
                !signedUrlParams && suppliers?.length > 0 ? (
                  <>
                    {suppliers.map((item, index) => (
                      <SupplierTag
                        key={index}
                        item={item}
                        editable={false}
                        premission={isArchived}
                        onDelete={() => onDeleteSup(item)}
                      />
                    ))}
                  </>
                ) : (
                  <Text sx={textStyle}>N/A</Text>
                )
              ) : suppliers?.length > 0 ? (
                <>
                  {suppliers.map((item, index) => (
                    <SupplierTag key={index} item={item} editable={false} />
                  ))}
                </>
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </VStack>
          </GridItem>
          <GridItem>
            <CustomText>PURL :</CustomText>
            <Text
              sx={textStyle}
              cursor={'pointer'}
              onClick={() => onCheckPurl(data)}
            >
              {purl !== null && purl !== '' ? decodeURI(purl) : 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>CPES :</CustomText>
            {cpes?.length > 0 ? (
              <Text
                sx={textStyle}
                cursor={'pointer'}
                onClick={() => onCheckCpe(data)}
              >
                {cpes[0]}
              </Text>
            ) : (
              <Text sx={textStyle}>N/A</Text>
            )}
          </GridItem>
          <GridItem>
            <CustomText>Scope :</CustomText>
            <Text sx={textStyle} textTransform={'capitalize'}>
              {scope || 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Licenses :</CustomText>
            <Flex alignItems={'center'} gap={2} flexWrap={'wrap'} my={2}>
              {/* SPDX */}
              {licenses?.length > 0 &&
                licenses.map((item, index) => (
                  <Text key={index} sx={textStyle}>
                    {item}
                  </Text>
                ))}
              {/* EXPRESSION */}
              {licensesExp && licensesExp !== '' && (
                <Text sx={textStyle}>{parseLicenseString(licensesExp)}</Text>
              )}
              {/* CUSTOM */}
              {licensesCustom?.length > 0 &&
                licensesCustom?.map((item, index) => (
                  <Text key={index} sx={textStyle}>
                    {item}
                  </Text>
                ))}
            </Flex>
          </GridItem>
          <GridItem>
            <CustomText>OpenSSF Scorecard :</CustomText>
            <Text sx={textStyle}>{openSSF?.score || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Support Level :</CustomText>
            <Text sx={textStyle}>{supportLevel || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>End-of-Support Date :</CustomText>
            <Text sx={textStyle}>
              {endOfSupport ? getFullDateAndTime(endOfSupport) : 'N/A'}
            </Text>
          </GridItem>
        </Grid>
      </Box>
    )
  }, [
    primaryTextColor,
    name,
    description,
    dependsOn,
    dependencyOf,
    kind,
    internal,
    customerView,
    signedUrlParams,
    suppliers,
    purl,
    cpes,
    scope,
    licenses,
    licensesExp,
    licensesCustom,
    openSSF?.score,
    supportLevel,
    endOfSupport,
    handleGraphView,
    data,
    isArchived,
    onDeleteSup,
    onCheckPurl,
    onCheckCpe
  ])
}

export default ExpandedComponent
