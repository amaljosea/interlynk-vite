import { useLazyQuery, useMutation } from '@apollo/client'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findSimilarItems } from 'utils'

import { Button, Flex, useColorModeValue } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { updateCompVulnVex } from 'graphQL/Mutation'
import { GetVulnData } from 'graphQL/Queries'

import StepOne from './Wizard/StepOne'
import StepThree from './Wizard/StepThree'
import StepTwo from './Wizard/StepTwo'

const ImportWizard = ({
  variant,
  currentSbomId,
  currentProductId,
  onClose
}) => {
  const [compVexCreate] = useMutation(updateCompVulnVex)
  const [getVulns] = useLazyQuery(GetVulnData)

  const { prodVulnState, dispatch } = useGlobalState()
  const { totalVulns, field, direction, importSbom, selectedVulns } =
    prodVulnState
  const { prodVulnDispatch } = dispatch

  const group = JSON.parse(localStorage.getItem('product'))

  const params = useParams()
  const navigate = useNavigate()

  const { nextStep, prevStep, activeStep } = useSteps({ initialStep: 0 })

  const [productId, setProductId] = useState('')
  const [sbomId, setSbomId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(group?.groupId || '')
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const refetchCurrentVuln = async () => {
    await getVulns({
      variables: {
        projectId: currentProductId,
        sbomId: currentSbomId,
        first: totalVulns,
        field: field,
        direction: direction
      }
    })
      .then((res) => {
        if (res.data) {
          const data = findSimilarItems(res.data.sbom.vulns.nodes, importSbom)
          const filterData = data.filter((item) => item.importStatus !== null)
          prodVulnDispatch({ type: 'UPDATE_MERGE_DATA', payload: filterData })
        }
      })
      .finally(() => {
        navigate(
          `/vendor/products/${params.name}?id=${currentProductId}&sbom=${currentSbomId}`
        )
        onClose()
      })
  }

  const handleSubmit = () => {
    // console.log(selectedVulns)
    if (selectedVulns.length > 0) {
      selectedVulns.map((item) => {
        compVexCreate({
          variables: {
            sbomId: currentSbomId,
            compVulnId: item.id,
            note: item.importNotes ? item.importNotes : undefined,
            vexStatusId: item.importStatus.id,
            vexJustificationId: item.importJustification
              ? item.importJustification.id
              : undefined,
            impact: item.importStatement ? item.importStatement : undefined,
            details: item.importDetail ? item.importDetail : undefined,
            cdxResponseId: item.importResponse
              ? item.importResponse
              : undefined,
            fixedIn: item.importFixedIn ? item.importFixedIn : undefined,
            action: item.importActionStmt ? item.importActionStmt : undefined
          }
        })
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
              sx={{ p: 8, my: 8, rounded: 'md' }}
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
