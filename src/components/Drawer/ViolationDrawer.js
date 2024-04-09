import styled from '@emotion/styled'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Text
} from '@chakra-ui/react'

const ViolationDrawer = ({ data, isOpen, onClose }) => {
  // console.log(data)
  const { category, policyRuleViolations } = data || null
  const CustomText = styled(Text)`
    font-size: 12px;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  return (
    <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Violations List</DrawerHeader>
        <DrawerBody mb={10}>
          <Grid
            templateColumns={
              category !== 'vulnerability'
                ? 'repeat(12, 1fr)'
                : 'repeat(1, 1fr)'
            }
            gap={6}
            pb={2}
            borderBottom={'1px solid #E2E8F0'}
          >
            <GridItem colSpan={6}>
              <CustomText>
                {category !== 'vulnerability' ? 'Component' : 'Vuln ID'}
              </CustomText>
            </GridItem>
            {category !== 'vulnerability' && (
              <GridItem colSpan={6}>
                <CustomText>
                  {category === 'license' ? 'License' : 'Version'}
                </CustomText>
              </GridItem>
            )}
          </Grid>
          {category === 'license' &&
            policyRuleViolations?.nodes?.map((item, index) => (
              <Grid
                key={index}
                templateColumns='repeat(12, 1fr)'
                py={2}
                gap={6}
                borderBottom={'1px solid #E2E8F0'}
              >
                <GridItem fontSize={'sm'} colSpan={6} wordBreak={'break-all'}>
                  {item?.violation?.name}
                </GridItem>
                <GridItem fontSize={'sm'} colSpan={6} wordBreak={'break-all'}>
                  {item?.component?.licensesExp}
                </GridItem>
              </Grid>
            ))}
          {category === 'component' &&
            policyRuleViolations?.nodes?.map((item, index) => (
              <Grid
                key={index}
                templateColumns='repeat(12, 1fr)'
                py={2}
                gap={6}
                borderBottom={'1px solid #E2E8F0'}
              >
                <GridItem fontSize={'sm'} colSpan={6} wordBreak={'break-all'}>
                  {item?.violation?.name}
                </GridItem>
                <GridItem fontSize={'sm'} colSpan={6} wordBreak={'break-all'}>
                  {item?.violation?.version}
                </GridItem>
              </Grid>
            ))}
          {category === 'vulnerability' &&
            policyRuleViolations?.nodes?.map((item, index) => (
              <Grid
                key={index}
                templateColumns='repeat(1, 1fr)'
                py={2}
                gap={6}
                borderBottom={'1px solid #E2E8F0'}
              >
                <GridItem fontSize={'sm'} wordBreak={'break-all'}>
                  {item?.violation?.vuln?.vulnId}
                </GridItem>
              </Grid>
            ))}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer
