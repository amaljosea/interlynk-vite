export const loadHubSpotScript = (env) => {
  console.log('ENV', env)
  if (env === 'production') {
    const scriptSrc = '//js-na1.hs-scripts.com/39814957.js'
    const script = document.createElement('script')
    script.src = scriptSrc
    script.id = 'hs-script-loader'
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  } else {
    return null
  }
}
