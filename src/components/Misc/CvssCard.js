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
  <Text fontSize='xs' textAlign={'right'} fontWeight={'semibold'}>
    {children}
  </Text>
)

const CvssTag = ({ value, red, orange, children }) => (
  <Tag
    width={'100px'}
    justifyContent={'center'}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={red.includes(value) ? 'red' : orange.includes(value) ? 'orange' : 'gray'}
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
    <PopoverContent minWidth='400'>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader align={'center'} pt={4} fontWeight='bold' border='0'>CVSS Vector</PopoverHeader>
      <PopoverBody>
        <Stack spacing={1}>
          <Tag justifyContent={'center'} fontSize={'sm'} py={2}>
            {value}
          </Tag>
          <Divider />
          <Stack spacing={2} py={3}>
            {/* Attack Vector */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Attack Vector</Text>
              <CvssTag value={cvssObject?.AV} red={['N']} orange={['A', 'L']}>{attackVector(cvssObject?.AV)}</CvssTag>
            </Grid>
            <Divider />
            {/* Attack Complexity */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'} >Attack Complexity</Text>
              <CvssTag value={cvssObject?.AC} red={['L']} orange={[]}>
                {attackComplexity(cvssObject?.AC)}
              </CvssTag>
            </Grid>
            <Divider />
            {/* Privileges Required */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Privileges Required</Text>
              <CvssTag value={cvssObject?.PR} red={['N']} orange={['L']}>{confidentiality(cvssObject?.PR)}</CvssTag>
            </Grid>
            <Divider />
            {/* User Interaction */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>User Interaction</Text>
              <CvssTag value={cvssObject?.UI} red={['N']} orange={[]}>{userInteraction(cvssObject?.UI)}</CvssTag>
            </Grid>
            <Divider />
            {/* Scope */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Scope</Text>
              <CvssTag value={cvssObject?.S} red={'C'} orange={[]}>{scope(cvssObject?.S)}</CvssTag>
            </Grid>
            <Divider />
            {/* Confidentiality */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Confidentiality Impact</Text>
              <CvssTag value={cvssObject?.C} red={['H']} orange={['L']}>
                {confidentiality(cvssObject?.C)}
              </CvssTag>
            </Grid>
            <Divider />
            {/* Integrity */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Integrity Impact</Text>
              <CvssTag value={cvssObject?.I} red={['H']} orange={['L']}>{confidentiality(cvssObject?.I)}</CvssTag>
            </Grid>
            <Divider />
            {/* Availability */}
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Availability Impact</Text>
              <CvssTag value={cvssObject?.A} red={['H']} orange={['L']}>{confidentiality(cvssObject?.A)}</CvssTag>
            </Grid>
          </Stack>
        </Stack>
      </PopoverBody>
    </PopoverContent>
  )
}

export default CvssCard
