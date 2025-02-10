import { GridItem, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { CustomText } from './CustomText'

const DetailItem = ({ label, value, children, valueStyle, ...props }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return (
    <GridItem {...props}>
      <CustomText>{label} :</CustomText>
      {children && <GridItem mt={0}>{children}</GridItem>}
      <Text mt={1} fontSize={14} color={primaryTextColor} {...valueStyle}>
        {value}
      </Text>
    </GridItem>
  )
}

export default DetailItem
