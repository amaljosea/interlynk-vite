import { useEffect, useState } from 'react'

import {
  Divider,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  TagLabel,
  Text
} from '@chakra-ui/react'

const CvssText = ({ children }) => (
  <Text fontSize='xs' textAlign={'left'} fontWeight={'medium'} color={'#222'}>
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
    colorScheme={
      red.includes(value) ? 'red' : orange.includes(value) ? 'orange' : 'gray'
    }
  >
    <TagLabel>{children}</TagLabel>
  </Tag>
)

const CvssCard = ({ isOpen, onClose, value }) => {
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>CVSS Vector</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={1}>
            <Tag
              justifyContent={'center'}
              fontSize={'sm'}
              py={2}
              wordBreak={'break-all'}
            >
              {value}
            </Tag>
            <Divider />
            <Stack spacing={2} py={3}>
              {/* Attack Vector */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Attack Vector</CvssText>
                <CvssTag value={cvssObject?.AV} red={['N']} orange={['A', 'L']}>
                  {attackVector(cvssObject?.AV)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Attack Complexity */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Attack Complexity</CvssText>
                <CvssTag value={cvssObject?.AC} red={['L']} orange={[]}>
                  {attackComplexity(cvssObject?.AC)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Privileges Required */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Privileges Required</CvssText>
                <CvssTag value={cvssObject?.PR} red={['N']} orange={['L']}>
                  {confidentiality(cvssObject?.PR)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* User Interaction */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>User Interaction</CvssText>
                <CvssTag value={cvssObject?.UI} red={['N']} orange={[]}>
                  {userInteraction(cvssObject?.UI)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Scope */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Scope</CvssText>
                <CvssTag value={cvssObject?.S} red={'C'} orange={[]}>
                  {scope(cvssObject?.S)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Confidentiality */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Confidentiality Impact</CvssText>
                <CvssTag value={cvssObject?.C} red={['H']} orange={['L']}>
                  {confidentiality(cvssObject?.C)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Integrity */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Integrity Impact</CvssText>
                <CvssTag value={cvssObject?.I} red={['H']} orange={['L']}>
                  {confidentiality(cvssObject?.I)}
                </CvssTag>
              </Grid>
              <Divider />
              {/* Availability */}
              <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
                <CvssText>Availability Impact</CvssText>
                <CvssTag value={cvssObject?.A} red={['H']} orange={['L']}>
                  {confidentiality(cvssObject?.A)}
                </CvssTag>
              </Grid>
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CvssCard
