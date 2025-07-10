import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

import { Box, Skeleton, Text } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

// Hardcoded lists
const QUANTUM_SAFE_WHITELIST = [
  'EdDSA',
  'Ed25519',
  'AES128-GCM',
  'SHA512',
  'SHA256'
]

export const QUANTUM_UNSAFE_BLACKLIST = [
  'RSA-2048',
  'DSA',
  'ECDH',
  'EC',
  'EC-secp521r1',
  'EC-secp384r1',
  'EC-secp256r1',
  'SHA1',
  'MD5'
]

const QUANTUM_NOT_APPLICABLE_LIST = [
  'key@c30ad2b6-d914-4beb-a80f-e87e5af8a2d6',
  'key@a5140c39-380c-4073-9029-209a300d0c61',
  'key@b627000e-ed4e-449c-acb9-4e9547d6ee93',
  'key@7fb15088-1d8d-4419-bdab-1d67d87700c9',
  'key@3cbf6b27-f414-46b4-8009-bc52c59f8a14',
  'secret-key@ad2ff456-2f18-4c34-938b-54964e020aeb',
  'secret-key@223d3480-85d4-4f83-9fc0-a3d58760f42e',
  'key@b91197ee-12b7-45da-9875-afd3372ddf84',
  'key@23692f0c-b6f5-40b2-83f3-a46c731219fb',
  'key@d3bdc011-9e81-4222-85d1-8ce3d16458ed',
  'key@76f23af4-f34b-402b-a303-a4f0c8298dd6',
  'key@1546ba9e-ac7a-495f-b76b-ef926096207b',
  'secret-key@95b6eb4b-8792-4537-9ba7-7be78aa6d9e6',
  'key@72ade930-73bb-4b0f-9608-22bede085fe5',
  'key@29da4096-a086-4215-a055-fb2e8ac4d8f2',
  'secret-key@29cb45de-1081-45a1-95e7-1ec6de985a5a',
  'key@ff612ccf-d9d9-473e-b8ef-29594d0321ec',
  'key@9e4ad16b-7630-476f-ac1f-25d0a2168766',
  'secret-key@51ca9dca-3bf3-4248-b9e0-173605462d9f',
  'TLS',
  'key@1bcbddd0-d005-45a0-982e-eae0fc0cb617',
  'HMACSHA2',
  'secret-key@95ab0cd9-edd1-4318-a15f-257787afd111',
  'MGF1',
  'AES128-CBC-PKCS5',
  'key@8ddfc05a-2098-4752-b7ee-2deaee6c07fc',
  'key@a5b89ce7-5d23-4a14-a8c2-873dde5248f6',
  'key@e6908749-c161-413d-9bed-3e8b0abddc62',
  'secret-key@44cccfe6-4524-46ee-8f7b-77d95c834bf8',
  'key@ba45862f-0f4b-439a-a382-27eb8e4d9733',
  'key@3df7897e-b49e-42a5-b10f-465faa08ae73',
  'secret-key@1d8dce69-94cd-416f-95ec-8cfffd8c3e30',
  'key@58af0705-bf7c-4abc-9f49-5b3ed8dd31ca',
  'ConcatenationKDF',
  'key@2af0a5f3-71e0-459b-a9a1-397b8ac4a97c',
  'AES128',
  'key@52e17c71-cf5c-445b-b8a7-76e0af6f9df6',
  'RSASSA-PSS',
  'secret-key@e0ff048b-9a6d-4e40-a2d2-398296c83bd9',
  'key@2b196096-a50e-49fb-bea1-78d77e0ea387',
  'RAW'
]

const AllAssetsQuantumSafetyChart = ({ data }) => {
  const {
    lynkGreenColor, // SAFE
    primaryErrorColor, // UNSAFE
    lynkOrange, // UNKNOWN
    grayHeaderColor, // NOT_APPLICABLE
    primaryBgColor
  } = useThemeColor([
    'lynkGreenColor',
    'primaryErrorColor',
    'lynkOrange',
    'grayHeaderColor',
    'primaryBgColor'
  ])

  const COLORS = {
    SAFE: lynkGreenColor,
    UNSAFE: primaryErrorColor,
    UNKNOWN: lynkOrange,
    NOT_APPLICABLE: grayHeaderColor
  }

  if (!data) {
    return <Skeleton height='400px' borderRadius='lg' shadow='sm' />
  }

  const quantumSafetyCounts = data?.sbom?.components?.nodes.reduce(
    (acc, component) => {
      const componentName = component.name

      if (componentName) {
        if (QUANTUM_SAFE_WHITELIST.includes(componentName)) {
          acc.SAFE = (acc.SAFE || 0) + 1
        } else if (QUANTUM_UNSAFE_BLACKLIST.includes(componentName)) {
          acc.UNSAFE = (acc.UNSAFE || 0) + 1
        } else if (QUANTUM_NOT_APPLICABLE_LIST.includes(componentName)) {
          acc.NOT_APPLICABLE = (acc.NOT_APPLICABLE || 0) + 1
        } else {
          acc.UNKNOWN = (acc.UNKNOWN || 0) + 1
        }
      }
      return acc
    },
    {}
  )

  const chartData = Object.keys(quantumSafetyCounts).map((status) => ({
    name:
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase().replace(/_/g, ' '),
    value: quantumSafetyCounts[status]
  }))

  const desiredOrder = ['Safe', 'Unsafe', 'Unknown', 'Not applicable']
  const sortedChartData = desiredOrder
    .map((category) => chartData.find((item) => item.name === category))
    .filter(Boolean)

  if (!sortedChartData.length) {
    return (
      <Box
        p={4}
        borderRadius='md'
        bg={primaryBgColor}
        minH='300px'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Text>No cryptographic assets found for quantum safety analysis.</Text>
      </Box>
    )
  }

  return (
    <Box p={4} borderWidth='1px' borderRadius='lg' shadow='sm' height='400px'>
      <Text fontSize='xl' fontWeight='semibold' mb={4} textAlign='center'>
        All Assets Quantum Safety
      </Text>
      <ResponsiveContainer width='100%' height='80%'>
        <PieChart>
          <Pie
            data={sortedChartData}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey='value'
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {sortedChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toUpperCase().replace(/ /g, '_')]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} assets`, name]} />
          <Legend
            layout='vertical'
            align='right'
            verticalAlign='middle'
            wrapperStyle={{ paddingLeft: '0px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default AllAssetsQuantumSafetyChart
