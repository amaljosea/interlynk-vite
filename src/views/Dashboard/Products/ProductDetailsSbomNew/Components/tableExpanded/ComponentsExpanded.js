import { useMemo } from 'react'
import { getSignedUrlParams, isCustomerView } from 'utils'
import { openSsf } from 'variables/general'

import { Box, Flex, Tag, Text, VStack } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'

import { CustomText } from 'components/Misc/CustomText'
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
    const getDate = (value) =>
      value ? `${new Date(value).toLocaleDateString()}` : `N/A`
    return (
      <Box
        sx={{ w: '100%', p: 5 }}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Grid templateColumns='repeat(3, 1fr)' py={2} gap={6}>
          <GridItem>
            <CustomText>Name :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {data?.name || 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Type :</CustomText>
            <Text sx={textStyle}>{data?.kind || 'N/A'}</Text>
          </GridItem>
          <GridItem>
            <CustomText>Supplier :</CustomText>
            <VStack spacing={4} mt={1} alignItems={'left'}>
              {!customerView ? (
                !signedUrlParams && data?.suppliers?.length > 0 ? (
                  <>
                    {data?.suppliers.map((item, index) => (
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
              ) : data?.suppliers?.length > 0 ? (
                <>
                  {data?.suppliers.map((item, index) => (
                    <SupplierTag key={index} item={item} editable={false} />
                  ))}
                </>
              ) : (
                <Text sx={textStyle}>N/A</Text>
              )}
            </VStack>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>Description :</CustomText>
            <Text sx={textStyle} width={'90%'}>
              {data?.description !== '' ? data?.description : 'N/A'}
            </Text>
          </GridItem>
          <GridItem colSpan={3}>
            <CustomText>Depends On :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {data?.dependsOn?.length > 0 ? (
                [...data.dependsOn]
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
          <GridItem colSpan={3}>
            <CustomText>Dependency Of :</CustomText>
            <Flex mt={2} alignItems={'flex-start'} gap={2} flexWrap={'wrap'}>
              {data?.dependencyOf?.length > 0 ? (
                data.dependencyOf?.map((comp, index) => (
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
            <CustomText>PURL :</CustomText>
            <Text
              sx={textStyle}
              cursor={'pointer'}
              onClick={() => onCheckPurl(data)}
            >
              {data?.purl ? decodeURI(data?.purl) : 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>CPES :</CustomText>
            {data?.cpes?.length > 0 ? (
              <Text
                sx={textStyle}
                cursor={'pointer'}
                onClick={() => onCheckCpe(data)}
              >
                {data?.cpes[0]}
              </Text>
            ) : (
              <Text sx={textStyle}>N/A</Text>
            )}
          </GridItem>
          <GridItem>
            <CustomText>Scope :</CustomText>
            <Text sx={textStyle} textTransform={'capitalize'}>
              {data?.scope || 'N/A'}
            </Text>
          </GridItem>
          <GridItem>
            <CustomText>Licenses :</CustomText>
            {data?.licenses?.length > 0 ? (
              <Flex alignItems={'center'} gap={2} flexWrap={'wrap'} my={2}>
                {data?.licenses.map((item, index) => (
                  <Text key={index} sx={textStyle}>
                    {item}
                  </Text>
                ))}
              </Flex>
            ) : (
              <Text sx={textStyle}>N/A</Text>
            )}
          </GridItem>
          <GridItem>
            <CustomText>OpenSSF Scorecard :</CustomText>
            <Text sx={textStyle}>{openSSF?.score || 'N/A'}</Text>
          </GridItem>
          <GridItem hidden={customerView}>
            <CustomText>Support Level :</CustomText>
            <Text sx={textStyle}>{data?.supportLevel || 'N/A'}</Text>
          </GridItem>
          <GridItem hidden={customerView}>
            <CustomText>End-of-Support Date :</CustomText>
            <Text sx={textStyle}>{getDate(data?.endOfSupport)}</Text>
          </GridItem>
        </Grid>
      </Box>
    )
  }, [
    primaryTextColor,
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
