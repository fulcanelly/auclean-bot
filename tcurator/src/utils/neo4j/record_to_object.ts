export function recordToObject(record: any): any {
    let obj = {};
    record.keys.forEach((key, index) => {
        obj[key] = record._fields[index];
    });
    return obj;
}
