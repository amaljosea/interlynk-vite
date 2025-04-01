import { GridItem, Box } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { CustomText } from './CustomText'

const DetailItem = ({ label, value, children, valueStyle, ...props }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return (
    <GridItem {...props}>
      <CustomText>{label} :</CustomText>
      {children && <GridItem mt={0}>{children}</GridItem>}
      <Box mt={1} fontSize={14} color={primaryTextColor} {...valueStyle}>
        {value}
      </Box>
    </GridItem>
  )
}

export default DetailItem
