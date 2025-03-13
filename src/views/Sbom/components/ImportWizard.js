import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Box,
  Button,
  Flex,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { ComponentVulnVexImport } from 'graphQL/Mutation'

import StepOne from './Wizard/StepOne'
import StepThree from './Wizard/StepThree'
import StepTwo from './Wizard/StepTwo'

const ImportWizard = ({ currentSbomId, currentProductId, onClose }) => {
  const params = useParams()
  const groupId = params.productgroupid
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])

  const [compVexImport] = useMutation(ComponentVulnVexImport)

  const { prodVulnState, dispatch } = useGlobalState()
  const { selectedVulns } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const [sbomId, setSbomId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(groupId || '')
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const handleSubmit = () => {
    const importData = []
    if (selectedVulns?.length > 0) {
      selectedVulns?.map((item) =>
        importData?.push({
          fromComponentVulnId: item?.fromVuln?.id,
          toComponentVulnId: item?.toVuln?.id
        })
      )
      compVexImport({
        variables: { vulnsToImport: importData }
      }).then((res) => res?.data && goToNext())
    }
  }

  const steps = [{ title: 'Product' }, { title: 'Import' }]

  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length
  })

  const hasCompletedAllSteps = activeStep === steps.length

  return (
    <Flex flexDir='column' width='100%'>
      <Stepper index={activeStep} size='lg' padding={2}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      <Box marginTop={45}>
        {activeStep === 0 && (
          <StepOne
            setSbomId={setSbomId}
            currentSbomId={currentSbomId}
            currentProductId={currentProductId}
            selectedGroupId={selectedGroup}
            setSelectedGroupId={setSelectedGroup}
            selectedProd={selectedProd}
            setSelectedProd={setSelectedProd}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            uniqVersions={uniqVersions}
            setUniqVersions={setUniqVersions}
          />
        )}
        {activeStep === 1 && (
          <StepTwo currentSbomId={currentSbomId} sbomId={sbomId} />
        )}
      </Box>
      {hasCompletedAllSteps && (
        <Flex
          width={'100%'}
          flexDir={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{ p: 8, my: 8, rounded: 'md' }}
        >
          <StepThree />
        </Flex>
      )}
      <Flex
        width='100%'
        justify='flex-end'
        gap={4}
        bg={secondaryBgColor}
        pos={'absolute'}
        bottom={0}
        right={0}
        py={5}
        pr={8}
      >
        {hasCompletedAllSteps ? (
          <Button
            title='Done'
            variant='solid'
            colorScheme='green'
            onClick={onClose}
            aria-label='vulnStepThree'
          >
            Done
          </Button>
        ) : (
          <>
            {activeStep === 1 && (
              <Button
                variant='solid'
                title='Back'
                isDisabled={activeStep === 0}
                onClick={() => {
                  prodVulnDispatch({ type: 'RESET_SELECTED_VULN' })
                  prodVulnDispatch({ type: 'RESET_IMPORT_SBOMS' })
                  goToPrevious()
                  setSelectedVersion('')
                }}
              >
                Back
              </Button>
            )}

            {activeStep === 0 && (
              <Button
                variant='solid'
                title='Next'
                colorScheme='blue'
                onClick={goToNext}
                aria-label='vulnStepOne'
                disabled={
                  selectedVersion === '' ||
                  selectedGroup === '' ||
                  selectedProd === ''
                }
              >
                Next
              </Button>
            )}

            {activeStep === 1 && (
              <Button
                title='Submit'
                variant='solid'
                colorScheme='blue'
                onClick={handleSubmit}
                aria-label='vulnStepTwo'
                disabled={selectedVulns?.length === 0}
              >
                Submit
              </Button>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default ImportWizard
