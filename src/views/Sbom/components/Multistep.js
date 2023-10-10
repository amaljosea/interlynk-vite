import { useState } from 'react'
import {
  Progress,
  Box,
  GridItem,
  Text,
  Grid,
  Stack,
  FormLabel,
  FormControl,
  Select,
  Checkbox
} from '@chakra-ui/react'
import { useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import CopyTable from 'components/Tables/CopyTable'

// FORM ONE
const Form1 = () => {
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

  const productList =
    allProducts &&
    allProducts.projects.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Existing Projects
      </Text>
      <Box width={'400px'} margin={'0 auto'}>
        <Stack spacing={4} direction={'column'} gap={2}>
          {/* Project */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
              Project
            </FormLabel>
            <Select
              name='projects'
              value={selectedProd}
              onChange={(e) => setSelectedProd(e.target.value)}
            >
              <option value={''}>-- Select --</option>
              {productList.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormControl>
          {/* Version */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
              Version
            </FormLabel>
            <Select
              name='projects'
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
            >
              <option value={''}>-- Select --</option>
              {['2.3.4', '3.4.5'].map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  )
}

// FORM TWO
const Form2 = () => {
  return (
    <>
      <Box width={'400px'} margin={'0 auto'}>
        <FormControl mt={24}>
          <Checkbox colorScheme='blue'>
            Import status of vulnerabilities
          </Checkbox>
        </FormControl>
      </Box>
    </>
  )
}

// FORM THREE
const Form3 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Component view resolved by
      </Text>
      <Box width={'300px'} margin={'0 auto'}>
        <Stack spacing={4} direction={'column'} gap={2}>
          {/* import from */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='importFrom' fontSize='md' color='gray.600'>
              Prefer vulnerability status from
            </FormLabel>
            <Select name='importFrom'>
              <option value={''}>-- Select --</option>
              <option value={'Keep existing'}>Keep existing</option>
              <option value={'Replace from import'}>Replace from import</option>
            </Select>
          </FormControl>
          {/* status history */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='statusHistory' fontSize='md' color='gray.600'>
              Import vulnerability status history
            </FormLabel>
            <Select name='statusHistory'>
              <option value={''}>-- Select --</option>
              <option value={'Yes'}>Yes</option>
              <option value={'No'}>No</option>
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  )
}

// FORM FOUR
const Form4 = () => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Vunlerability view resolved by
      </Text>
      <Box width={'90%'} margin={'0 auto'}>
        <CopyTable
          data={[
            {
              id: 1,
              cve: 'CVE-2023-24532',
              component: 'dropwizard-core',
              version: '1.2.4',
              status: 'In Triage',
              newStatus: 'False Positive',
              notes: 'In Triage'
            },
            {
              id: 2,
              cve: 'CVE-2017-16921',
              component: 'samza-pre',
              version: '0.7.3',
              status: 'In Triage',
              newStatus: 'Fixed',
              notes: 'In Triage'
            },
            {
              id: 3,
              cve: 'CVE-2021-14922',
              component: 'samza-core',
              version: '0.7.3',
              status: 'Fixed',
              newStatus: 'Affected',
              notes: 'In Triage'
            }
          ]}
        />
      </Box>
    </>
  )
}

const Multistep = ({ step, progress }) => {
  return (
    <>
      <Box as='form'>
        <Progress
          hasStripe
          size='sm'
          value={progress}
          isAnimated
          mb={8}
        ></Progress>
        {step === 1 ? (
          <Form1 />
        ) : step === 2 ? (
          <Form2 />
        ) : step === 3 ? (
          <Form3 />
        ) : (
          step === 4 && <Form4 />
        )}
      </Box>
    </>
  )
}

export default Multistep
