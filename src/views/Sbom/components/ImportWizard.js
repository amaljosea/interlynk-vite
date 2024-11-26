import { useMutation } from '@apollo/client'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Button, Flex } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { ComponentVulnVexImport } from 'graphQL/Mutation'

import StepOne from './Wizard/StepOne'
import StepThree from './Wizard/StepThree'
import StepTwo from './Wizard/StepTwo'

const ImportWizard = ({
  variant,
  currentSbomId,
  currentProductId,
  onClose
}) => {
  const params = useParams()
  const groupId = params.productgroupid
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])

  const [compVexImport] = useMutation(ComponentVulnVexImport)

  const { prodVulnState, dispatch } = useGlobalState()
  const { selectedVulns } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const { nextStep, prevStep, activeStep } = useSteps({ initialStep: 0 })

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
      }).then((res) => res?.data && nextStep())
    }
  }

  const steps = [
    {
      label: 'Product',
      component: (
        <StepOne
          setSbomId={setSbomId}
          currentSbomId={currentSbomId}
          currentProductId={currentProductId}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          selectedProd={selectedProd}
          setSelectedProd={setSelectedProd}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          uniqVersions={uniqVersions}
          setUniqVersions={setUniqVersions}
        />
      )
    },
    {
      label: 'Import',
      component: <StepTwo currentSbomId={currentSbomId} sbomId={sbomId} />
    }
  ]

  const hasCompletedAllSteps = activeStep === steps.length

  return (
    <Flex flexDir='column' width='100%'>
      <Box position='fixed' top={20} left={6} right={6}>
        <Steps variant={variant} colorScheme='blue' activeStep={activeStep}>
          {steps.map(({ label, component }, index) => (
            <Step label={label} key={index}>
              <Flex
                width={'100%'}
                flexDir={'column'}
                alignItems={'center'}
                transform={'scale(0.9)'}
                justifyContent={'center'}
                sx={{ p: 8, rounded: 'md' }}
              >
                {component}
              </Flex>
            </Step>
          ))}
        </Steps>
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
                  prevStep()
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
                onClick={nextStep}
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
