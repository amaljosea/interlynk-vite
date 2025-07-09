class ProductDetailsSelectors {
  public static productLink = "a[href='/vendor/products']"
  public static productsHeader = "//a[text()='products']"
  public static productName(name: string) {
    return `//p[text()='${name}']`
  }
  public static productSearch = "//input[@placeholder='Search...']"
  public static noRecordMsg =
    "(//div[text()='There are no records to display'])[1]"
  public static getProduct(name: string) {
    return `(//div[@data-column-id='PROJECT_GROUPS_NAME' and @role='cell']//p[text()='${name}'])`
  }
  // public static uploadBtn = "(//div[contains(@class,'product-details')]//button[contains(@class,'chakra-button')])[9]"
  public static uploadBtn =
    "//*[@id='root']/div/div[2]/div[2]/div/div[1]/div/div/div[2]/div/div[2]/button[2]"
  public static uplaodPopup =
    "//section[contains(@class,'chakra-modal__content')]"
  public static uploadPopupHeader =
    "//section[contains(@class,'chakra-modal__content')]//p[text()='Upload SBOM']"
  public static uploadFileInput = "//input[@id='fileInput']"
  public static upload = "//button[@type='submit']"
  public static uploadSuccessMsg =
    "(//p[text()='SBOM uploaded successfully and is now processing'])[1]"
  public static versionBtn = "//button[text()='versions']"
  public static versionElement(version: string) {
    return `//*[text()='${version}']`
  }
  public static versionList =
    "//div[@data-column-id='SBOMS_PROJECT_VERSION' and @role='cell']"
  public static getVersion(index: number) {
    return `(//div[@data-column-id='SBOMS_PROJECT_VERSION' and @role='cell'])[${index}]`
  }

  public static getMenu(index: number) {
    return `(//div[@data-tag='allowRowEvents']//button[@aria-haspopup='menu'])[${index}]`
  }
  public static deleteBtn = '[data-testid="sbom-delete-button"]'
  public static deletePopup =
    "//section[contains(@class,'chakra-modal__content')]"
  public static yesBtn = "//button[text()='Yes']"
  public static versionSearch = "input[name='versions']"
  public static pNameHeader(name: string) {
    return `//span[text()='${name}']`
  }
  public static getProductName(index: number) {
    return `(((//div[@data-column-id='PROJECT_GROUPS_NAME' and @role='cell']))//div//div//div[1]//div//p)[${index}]`
  }
}
export { ProductDetailsSelectors }
