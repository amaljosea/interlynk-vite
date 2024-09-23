class LabelSelectors {
  public static productLink = "a[href='/vendor/products']"
  public static productsHeader = "//a[text()='products']"
  public static addLabelButton =
    "((//div[@class='chakra-stack css-rmxdag'])[2]//button)[1]"
  public static labelPopup =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']"
  public static labelHeader = "//header[text()='Manage Labels']"
  public static labelInput =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']//input[@name='name']"
  public static labelColorInput =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']//input[@name='color']"
  public static getColor(index: number) {
    return `(//div[contains(@id, 'chakra-modal') and @role='dialog']//section//div//div)[${index}]`
  }
  public static getLables(index: number) {
    return `(//div[contains(@id, 'chakra-modal') and @role='dialog']//table//tr//td//span)[${index}]`
  }
  public static closeBtn =
    "(//div[contains(@id, 'chakra-modal') and @role='dialog']//button)[1]"
  public static labelAddSuccessMsg =
    "(//*[text()='Label added successfully'])[1]"
  public static labelAddFailedMsg =
    "(//*[text()='Name has already been taken'])[1]"
  public static labels =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']//table//tr//td//span"
  public static addLabel =
    "//div[contains(@id, 'chakra-modal') and @role='dialog']//button[@type='submit']"
  public static labelDeleteBtn(index: number) {
    return `(//div[contains(@id, 'chakra-modal') and @role='dialog']//table//tr//td[2]//button[2])[${index}]`
  }
  public static menuBtn =
    "(//div[@data-tag='allowRowEvents']//button[@aria-haspopup='menu'])[1]"
  public static updateLabel = "(//div[@role='menu'])[4]//button[2]"
  public static labelCheckBoxes = "((//div[@role='menu'])[4]//div//label//span)"

  public static getLabelCheckBox(index: number) {
    return `((//div[@role='menu'])[4]//div//label//span)[${index}]`
  }

  public static getLabelName(index) {
    return `(//*[contains(@id,'menu-list')]/div/div/div[1]/div/span)[${index}]`
  }

  public static labelFilterBtn = "(//button[@aria-haspopup='menu'])[3]"
  public static labelLists =
    "((//button[@role='menuitemcheckbox'])//span//span)"
  public static getLabelList(index: number) {
    return `((//button[@role='menuitemcheckbox'])//span//span)[${index}]`
  }
  public static noRecordMsg = "//div[text()='There are no records to display']"

  public static productWithLabelName(name: string) {
    return `(//span[text()='${name}'])[1]`
  }
}
export { LabelSelectors }
