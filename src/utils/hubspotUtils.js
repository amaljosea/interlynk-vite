export const loadHubSpotScript = (hostname) => {
  if (hostname === 'app.interlynk.io') {
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
