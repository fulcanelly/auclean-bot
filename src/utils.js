
function extractUrls(text, entities) {
  return entities
    .filter(ent => ent.type == 'url')
    .map(obj => text.substring(obj.offset, obj.offset + obj.length))
}


exports.extractUrls = extractUrls
