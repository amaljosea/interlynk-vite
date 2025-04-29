const { Stack, Text } = require('@chakra-ui/react')

const PartInfo = ({ data }) => {
  if (data?.length === 0) return 'N/A'
  return (
    <Stack spacing={1}>
      {data?.map(({ id, sbom }) => (
        <Text key={id}>
          {`${sbom?.project?.projectGroup?.name} : ${sbom?.projectVersion || 'N/A'}`}
        </Text>
      ))}
    </Stack>
  )
}

export default PartInfo
