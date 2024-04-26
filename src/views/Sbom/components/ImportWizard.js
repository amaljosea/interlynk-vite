import { useMutation } from '@apollo/client'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useState } from 'react'

import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { ComponentVulnVexImport } from 'graphQL/Mutation'

import StepOne from './Wizard/StepOne'
import StepThree from './Wizard/StepThree'
import StepTwo from './Wizard/StepTwo'

const ImportWizard = ({
  variant,
  refetch,
  currentSbomId,
  currentProductId,
  onClose
}) => {
  const [compVexImport] = useMutation(ComponentVulnVexImport)

  const { prodVulnState, dispatch } = useGlobalState()
  const { totalVulns, field, direction, selectedVulns } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const group = JSON.parse(localStorage.getItem('product'))

  const { nextStep, prevStep, activeStep } = useSteps({ initialStep: 0 })

  const [productId, setProductId] = useState('')
  const [sbomId, setSbomId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(group?.groupId || '')
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const refetchCurrentVuln = async () => {
    await refetch({
      projectId: currentProductId,
      sbomId: currentSbomId,
      first: totalVulns,
      last: undefined,
      field: field,
      direction: direction
    }).then((res) => {
      if (res.data) {
        onClose()
      }
    })
  }

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
          setProductId={setProductId}
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

  const isLastStep = activeStep === steps.length - 1
  const hasCompletedAllSteps = activeStep === steps.length
  const bg = useColorModeValue('gray.50')

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
        pos={'absolute'}
        bottom={0}
        right={0}
        py={5}
        pr={8}
        bg={'white'}
      >
        {hasCompletedAllSteps ? (
          <Button
            variant='solid'
            colorScheme='green'
            onClick={refetchCurrentVuln}
          >
            Done
          </Button>
        ) : (
          <>
            {activeStep === 1 && (
              <Button
                variant='solid'
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
                colorScheme='blue'
                onClick={nextStep}
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
                variant='solid'
                colorScheme='blue'
                onClick={handleSubmit}
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
