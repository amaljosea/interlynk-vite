import { useState, useContext } from 'react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { Flex, Heading, Box, Button, useColorModeValue } from '@chakra-ui/react'
import StepOne from './Wizard/StepOne'
import StepTwo from './Wizard/StepTwo'
import { useLazyQuery, useMutation } from '@apollo/client'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { GetVulnData } from 'graphQL/Queries'
import { findSimilarItems } from 'utils'
import StepThree from './Wizard/StepThree'
import GlobalContext from 'context/GlobalContext'

const ImportWizard = ({
  variant,
  currentSbomId,
  currentProductId,
  onClose
}) => {
  const [compVexCreate] = useMutation(updateCompVulnVex)
  const [getVulns] = useLazyQuery(GetVulnData)

  const {
    totalVulns,
    vulnField,
    vulnDirection,
    setMergeData,
    importSbom,
    selectedVulns,
    setSelectedVulns
  } = useContext(GlobalContext)

  const { nextStep, prevStep, activeStep } = useSteps({
    initialStep: 0
  })

  const [productId, setProductId] = useState('')
  const [sbomId, setSbomId] = useState('')
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const refetchCurrentVuln = async () => {
    try {
      await getVulns({
        variables: {
          projectId: currentProductId,
          sbomId: currentSbomId,
          first: totalVulns,
          field: vulnField,
          direction: vulnDirection
        }
      }).then((res) => {
        if (res.data) {
          const data = findSimilarItems(res.data.sbom.vulns.nodes, importSbom)
          const filterData = data.filter((item) => item.importStatus !== null)
          setMergeData(filterData)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = () => {
    console.log(selectedVulns)
    if (selectedVulns.length > 0) {
      selectedVulns.map((item) => {
        compVexCreate({
          variables: {
            compVulnId: item.id,
            notes: item.importNotes,
            sbomId: currentSbomId,
            vexStatusId: item.importStatus.id,
            vexJustificationId: item.importJustification
              ? item.importJustification.id
              : undefined,
            impact: item.importStatement ? item.importStatement : undefined
          }
        })
        refetchCurrentVuln(item)
      })
      nextStep()
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
      component: (
        <StepTwo
          currentSbomId={currentSbomId}
          currentProductId={currentProductId}
          getVulns={getVulns}
          productId={productId}
          sbomId={sbomId}
        />
      )
    }
  ]

  const isLastStep = activeStep === steps.length - 1
  const hasCompletedAllSteps = activeStep === steps.length
  const bg = useColorModeValue('gray.50')

  return (
    <Flex flexDir='column' width='100%'>
      <Steps variant={variant} colorScheme='blue' activeStep={activeStep}>
        {steps.map(({ label, component }, index) => (
          <Step label={label} key={label}>
            <Flex
              width={'100%'}
              flexDir={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ p: 8, bg, my: 8, rounded: 'md' }}
            >
              {component}
            </Flex>
          </Step>
        ))}
      </Steps>
      {hasCompletedAllSteps && (
        <Flex
          width={'100%'}
          flexDir={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{ p: 8, bg, my: 8, rounded: 'md' }}
        >
          <StepThree />
        </Flex>
      )}
      <Flex
        width='100%'
        justify='flex-end'
        gap={4}
        pos={'absolute'}
        bottom={2}
        right={8}
        bg={'white'}
        py={5}
      >
        {hasCompletedAllSteps ? (
          <Button variant='solid' colorScheme='green' onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            {activeStep === 1 && (
              <Button
                variant='solid'
                isDisabled={activeStep === 0}
                onClick={prevStep}
              >
                Back
              </Button>
            )}

            {activeStep === 0 && (
              <Button
                variant='solid'
                colorScheme='blue'
                onClick={nextStep}
                disabled={selectedVersion === ''}
              >
                Next
              </Button>
            )}

            {activeStep === 1 && (
              <Button
                variant='solid'
                colorScheme='blue'
                onClick={handleSubmit}
                disabled={selectedVulns.length === 0}
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
