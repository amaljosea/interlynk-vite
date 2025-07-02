class ShareLynkSelectors {
  public static productLink = "a[href='/vendor/products']"
  public static productsHeader = "//a[text()='products']"
  public static addProductButton = "//button[@aria-label='Add Product']"
  public static popup = "//section[contains(@id, 'chakra') and @role='dialog']"
  public static addProductName = "input[placeholder='Add product name']"
  public static addProductDescription =
    "textarea[placeholder='Add product description']"
  public static saveBtn = "//button[text()='Save']"
  public static productName(name: string) {
    return `//p[text()='${name}']`
  }
  public static menuBtn =
    "(//div[@data-tag='allowRowEvents']//button[@aria-haspopup='menu'])[1]"
  public static productSearch = "//input[@placeholder='Search']"
  public static deleteBtn =
    "(//div[@tabindex='-1']//button[text()='Delete Product' and @role='menuitem'])"
  public static deleteProductHeader = "//p[text()='Delete Product']"
  public static yesBtn = "//button[text()='Yes']"
  public static closeBtn =
    "//button[contains(@class, 'chakra-modal__close-btn')]"
  public static noRecordMsg = "//div[text()='There are no records to display']"
  public static viewShareLink = "//button[text()='View ShareLynk']"
  public static shareLynkPopup =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']"
  public static shareLynkHeader = "//header[text()='ShareLynks']"
  public static addShareLynkButton =
    "(//div[contains(@id, 'chakra-modal') and @role='dialog']//button)[2]"
  public static createShareLynkPoupup =
    "//section[contains(@id, 'chakra') and @role='dialog']//form"
  public static createShareLynkHeader = "//p[text()='Create ShareLynk']"
  public static expirationDate = "input[placeholder='Select Date and Time']"
  public static addBtn = "//button[@aria-label='save_sharelynk']"
  public static noExpirationCheckBox =
    "//section[contains(@id, 'chakra') and @role='dialog']//form//input[@type='checkbox']"
  public static copyBtn =
    "(//div[contains(@id, 'chakra-modal') and @role='dialog']//button)[4]"
  public static noExpirationSpan = "//span[text()='No Expiration']"
  public static link = "//input[@aria-label='lynk_url']"
  public static productNameParagraph =
    "(//p[contains(@class,'chakra-text')])[1]"
}
export { ShareLynkSelectors }
