import { validateCpe } from './index'; // Replace with the correct path to your util file

describe('validateCpe', () => {
  test('valid CPE should return true', () => {
    const validCpe = 'cpe:2.3:h:cisco:adaptive_security_appliance:9.1.1.7:*:*:*:*:*:*:*';
    expect(validateCpe(validCpe)).toBe(true);
  });

  test('invalid CPE should return false', () => {
    const invalidCpe = 'invalid_cpe_string';
    expect(validateCpe(invalidCpe)).toBe(false);
  });

  test('ISSUE-1424 CPE should not be accepted', () => {
    const invalidCpe = 'cpe:2.3:microsoft:.net:7.0.0:preview.6::::::';
    expect(validateCpe(invalidCpe)).toBe(false);
  });

  test('ISSUE-1420 CPE should not be accepted', () => {
    const invalidCpe = 'cpe:2.3:HOA:microsoft:.net:7.0.0:preview.6::::::';
    expect(validateCpe(invalidCpe)).toBe(false);
  });

  test('ISSUE-1409 CPE should be accepted', () => {
    const validCpe = 'cpe:2.3::dell:emc_omimssc_for_scvmm:7.2.1:::::::*';
    expect(validateCpe(validCpe)).toBe(true);

    const validCpeBaseCase = 'cpe:2.3::dell:emc_omimssc_for_scvmm:7.2.1:*:*:*:*:*:*:*';
    expect(validateCpe(validCpeBaseCase)).toBe(true);
});

  test('ISSUE-1408 CPE in 2.2 format should not be accepted', () => {
    const cpe22 = 'cpe:/a:acme:product:1.0:update2:-:en-us';
    expect(validateCpe(cpe22)).toBe(false);
  });

  test('ISSUE-1407 CPE list should be accepted', () => {
    const inValidCpe1 = 'cpe:2.3:a:acme:product:1.0:update2:-:en-us';
    expect(validateCpe(inValidCpe1)).toBe(false);
    const validCpe11 = 'cpe:2.3:a:acme:product:1.0:update2:-:en-us:*:*:*:*';
    expect(validateCpe(validCpe11)).toBe(true);
    const validCpe12 = 'cpe:2.3:a:acme:product:1.0:update2:-:en-us::::';
    expect(validateCpe(validCpe12)).toBe(true);
    const inValidCpe2 = 'cpe:2.3:a:mozilla:firefox:2.0.0.6::osx:zh-tw';
    expect(validateCpe(inValidCpe2)).toBe(false);
    const validCpe21 = 'cpe:2.3:a:mozilla:firefox:2.0.0.6::osx:zh-tw:*:*:*:*';
    expect(validateCpe(validCpe21)).toBe(true);
    const inValidCpe3 = 'cpe:2.3:h:emc:vmware_esx:2.5';
    expect(validateCpe(inValidCpe3)).toBe(false);
    const validCpe3 = 'cpe:2.3:h:emc:vmware_esx:2.5:*:*:*:*:*:*:*';
    expect(validateCpe(validCpe3)).toBe(true);
    const inValidCpe4 = 'cpe:2.3:h:dell:inspiron:8500';
    expect(validateCpe(inValidCpe4)).toBe(false);
    const validCpe4 = 'cpe:2.3:h:dell:inspiron:8500:*:*:*:*:*:*:*';
    expect(validateCpe(validCpe4)).toBe(true);
    const validCpe5 = 'cpe:2.3:a:apache:httpd:2.0.52';
    expect(validateCpe(validCpe5)).toBe(false);
    const validCpe6 = 'cpe:2.3:a:microsoft:ie:6.0';
    expect(validateCpe(validCpe6)).toBe(false);
    const validCpe7 = 'cpe:2.3:h:cisco:router:3825';
    expect(validateCpe(validCpe7)).toBe(false);
  });

  test('ISSUE-1406 CPE should be accepted', () => {
    const invalidCpe = 'cpe:2.3:O:microsoft:.net:7.0.0:preview.6::::::';
    expect(validateCpe(invalidCpe)).toBe(false);

    const validCpe = 'cpe:2.3:o:microsoft:.net:7.0.0:preview.6::::::';
    expect(validateCpe(validCpe)).toBe(true);
});

  test('ISSUE-1289 CPE should not be accepted', () => {
    const validCpe = 'cpe:2.3:a:microsoft:windows_10_1607:1.3:*:*:*:*:*:*:*';
    expect(validateCpe(validCpe)).toBe(true);
  });

  test('ISSUE-1252 CPE should not be accepted', () => {
    const invalidCpe = 'cpe:2.3:a:vendor:****:2.0.0:rj45::::::';
    expect(validateCpe(invalidCpe)).toBe(false);
  });

});
