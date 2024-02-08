import {
  Stack,
  Text,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Divider,
  Grid,
  Tag,
  TagLabel
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const CvssText = ({ children }) => (
  <Text fontSize='sm' textAlign={'right'} fontWeight={'semibold'}>
    {children}
  </Text>
)

const CvssTag = ({ value, children }) => (
  <Tag
    width={'fit-content'}
    ml={'auto'}
    size='sm'
    variant='subtle'
    fontWeight={'semibold'}
    colorScheme={value === 'H' ? 'red' : value === 'L' ? 'green' : 'gray'}
  >
    <TagLabel>{children}</TagLabel>
  </Tag>
)

const CvssCard = ({ value }) => {
  const [cvssObject, setcvssObject] = useState(null)

  useEffect(() => {
    if (value) {
      const cvssParts = value.split('/')
      const cvssObject = {}
      cvssParts.forEach((part) => {
        const [property, value] = part.split(':')
        cvssObject[property] = value
      })
      setcvssObject(cvssObject)
    }
  }, [value])

  // console.log('cvssObject', cvssObject)

  const attackComplexity = (value) => {
    switch (value) {
      case 'H':
        return 'High'
      case 'L':
        return 'Low'
    }
  }

  const confidentiality = (value) => {
    switch (value) {
      case 'H':
        return 'High'
      case 'L':
        return 'Low'
      case 'N':
        return 'None'
    }
  }

  const attackVector = (value) => {
    switch (value) {
      case 'A':
        return 'Adjacent'
      case 'L':
        return 'Local'
      case 'N':
        return 'Network'
      case 'P':
        return 'Physical'
    }
  }

  const userInteraction = (value) => {
    switch (value) {
      case 'N':
        return 'None'
      case 'R':
        return 'Required'
    }
  }

  const scope = (value) => {
    switch (value) {
      case 'C':
        return 'Changed'
      case 'U':
        return 'Unchanged'
    }
  }

  return (
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader>CVSS {cvssObject?.CVSS}</PopoverHeader>
      <PopoverBody>
        <Stack spacing={1}>
          <Text fontWeight={'semibold'} fontSize={'sm'} py={2}>
            {value}
          </Text>
          <Divider />
          <Stack spacing={2} py={3}>
            {/* Attack Complexity */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Attack Complexity</Text>
              <CvssTag value={cvssObject?.AC}>
                {attackComplexity(cvssObject?.AC)}
              </CvssTag>
            </Grid>
            <Divider />
            {/* Confidentiality */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Confidentiality</Text>
              <CvssTag value={cvssObject?.C}>
                {confidentiality(cvssObject?.C)}
              </CvssTag>
            </Grid>
            <Divider />
            {/* Attack Vector */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Attack Vector</Text>
              <CvssText>{attackVector(cvssObject?.AV)}</CvssText>
            </Grid>
            <Divider />
            {/* Privileges Required */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Privileges Required</Text>
              <CvssText>{confidentiality(cvssObject?.PR)}</CvssText>
            </Grid>
            <Divider />
            {/* User Interaction */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>User Interaction</Text>
              <CvssText>{userInteraction(cvssObject?.UI)}</CvssText>
            </Grid>
            <Divider />
            {/* Scope */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Scope</Text>
              <CvssText>{scope(cvssObject?.S)}</CvssText>
            </Grid>
            <Divider />
            {/* Integrity */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Integrity</Text>
              <CvssText>{confidentiality(cvssObject?.I)}</CvssText>
            </Grid>
            <Divider />
            {/* Availability */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Availability</Text>
              <CvssText>{confidentiality(cvssObject?.A)}</CvssText>
            </Grid>
          </Stack>
        </Stack>
      </PopoverBody>
    </PopoverContent>
  )
}

export default CvssCard
