export function recordToObject<T>(record: any): T {
    let obj = {};
    record.keys.forEach((key, index) => {
        obj[key] = record._fields[index];
    });
    return obj as T;
}
