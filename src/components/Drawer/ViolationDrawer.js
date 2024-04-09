import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem
} from '@chakra-ui/react'

const ViolationDrawer = ({ data, isOpen, onClose }) => {
  // console.log(data)
  const { category, policyRuleViolations } = data || null

  return (
    <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Violations List</DrawerHeader>
        <DrawerBody mb={10}>
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
                <GridItem fontSize={'sm'} colSpan={8} wordBreak={'break-all'}>
                  {item?.violation?.name}
                </GridItem>
                <GridItem fontSize={'sm'} colSpan={4} wordBreak={'break-all'}>
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
