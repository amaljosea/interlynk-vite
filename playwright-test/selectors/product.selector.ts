class ProductSelectors {
  public static productLink = "(//a[@href='/vendor/products'])[1]"
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
  public static editProduct =
    "(//div[@tabindex='-1']//button[text()='Edit Product' and @role='menuitem'])"
  public static editProductHeader = "//p[text()='Edit Product']"
  public static updateBtn = "(//button[text()='Update'])"
  public static deleteBtn =
    "(//div[@tabindex='-1']//button[text()='Delete Product' and @role='menuitem'])"
  public static deleteProductHeader = "//p[text()='Delete Product']"
  public static yesBtn = "//button[text()='Yes']"
  public static productSearch = "//input[@placeholder='Search']"
  public static closeBtn =
    "//button[contains(@class, 'chakra-modal__close-btn')]"
  public static noRecordMsg = "//div[text()='There are no records to display']"
  public static firstProduct =
    "((//div[@data-column-id='PROJECT_GROUPS_NAME' and @role='cell'])[1]//p)[1]"
  public static productLists =
    "((//div[@data-column-id='PROJECT_GROUPS_NAME' and @role='cell']))//div//div//div[1]//div//p"
  public static getProductName(index: number) {
    return `(((//div[@data-column-id='PROJECT_GROUPS_NAME' and @role='cell']))//div//div//div[1]//div//p)[${index}]`
  }
  // public static productNameHeader(name:string){
  //     return `//div[contains(@class,'product-details')]//*[contains(text(),'${name}')]`
  // }
  public static productNameHeader = `(//div[contains(@class,'product-details')]//span)[1]`

  public static productSelect =
    "(//input[@type='text' and @role='combobox'])[1]"
  public static versionElement(version: string) {
    return `//*[text()='${version}']`
  }
  public static versionList =
    "//div[@data-column-id='SBOMS_PROJECT_VERSION' and @role='cell']"
  public static getVersion(index: number) {
    return `((//div[@data-column-id='SBOMS_PROJECT_VERSION' and @role='cell'])//p)[${index}]`
  }
  public static versionSelect =
    "(//input[@type='text' and @role='combobox'])[2]"
  public static versionNameElement = "(//p[contains(@class,'chakra-text')])[6]"
  public static statusChangeBtn = "button[name='change_status']"
  public static disableProductHeader = "//p[text()='Disable Product']"
  public static enableProductHeader = "//p[text()='Enable Product']"
  public static activeFilter = "button[name='active_filter']"
  public static activeNoBtn = "button[name='no']"
}
export { ProductSelectors }
