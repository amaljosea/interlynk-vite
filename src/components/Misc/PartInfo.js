import { Stack, Text } from '@chakra-ui/react'

const PartInfo = ({ data }) => {
  if (data?.length === 0) return 'N/A'
  return (
    <Stack spacing={1}>
      {data?.map((item, index) => (
        <Text key={index}>
          {`${item?.sbom?.project?.projectGroup?.name} : ${item?.sbom?.projectVersion || 'N/A'}`}
        </Text>
      ))}
    </Stack>
  )
}

export default PartInfo
