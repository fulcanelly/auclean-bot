const { extractOutputFilePath } = require("../src/video");

test('Extract output file path when video is already downloaded', () => {
  const output = '[youtube] Extracting URL: https://youtube.com/shorts/nDzI5mdFGE4?feature=share\n[youtube] nDzI5mdFGE4: Downloading webpage\n[youtube] nDzI5mdFGE4: Downloading android player API JSON\n[info] nDzI5mdFGE4: Downloading 1 format(s): 248+251\n[download] Domestic Violence... Or Not #shorts [nDzI5mdFGE4].webm has already been downloaded\n';

  const result = extractOutputFilePath(output);

  expect(result).toBe('Domestic Violence... Or Not #shorts [nDzI5mdFGE4].webm');
});

test('Return output file when output does not include the "has already been downloaded" message', () => {
  const output = '[youtube] Extracting URL: https://youtube.com/shorts/nDzI5mdFGE4?feature=share\n[youtube] nDzI5mdFGE4: Downloading webpage\n[youtube] nDzI5mdFGE4: Downloading android player API JSON\n[info] nDzI5mdFGE4: Downloading 1 format(s): 248+251\n[download] Destination: /path/to/output/file.webm\n';

  const result = extractOutputFilePath(output);

  console.log(result)
  expect(result).toBe('/path/to/output/file.webm');
});

test('Return undefined when output is empty', () => {
  const output = '';

  const result = extractOutputFilePath(output);

  expect(result).toBeUndefined();
});
