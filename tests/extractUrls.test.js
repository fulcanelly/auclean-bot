const { extractUrls } = require("../src/utils");

// Test cases
describe('extractUrls', () => {
  it('should extract URLs from text with entities', () => {
    const text = 'Check out my website at https://example.com. For more information, visit http://example.org.';
    const entities = [
      { offset: 24, length: 19, type: 'url' },
      { offset: 73, length: 18, type: 'url' }
    ];
    const expected = ['https://example.com', 'http://example.org'];
    const result = extractUrls(text, entities);
    expect(result).toEqual(expected);
  });

  it('should return an empty array when no URLs are present', () => {
    const text = 'This is a plain text without any URLs.';
    const entities = [];
    const expected = [];
    const result = extractUrls(text, entities);
    expect(result).toEqual(expected);
  });

  it('should handle overlapping URLs', () => {
    const text = 'Visit https://example.com and https://subdomain.example.com for more.';
    const entities = [
      { offset: 6, length: 19, type: 'url' },
      { offset: 30, length: 29, type: 'url' }
    ];
    const expected = ['https://example.com', 'https://subdomain.example.com'];
    const result = extractUrls(text, entities);
    expect(result).toEqual(expected);
  });
});
