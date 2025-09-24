import isString from "lodash-es/isString";
import keys from "lodash-es/keys";

export default function flattenObject(obj: any, parentPath = ""): any {
    const flattened: any = {};
    keys(obj)
        .sort()
        .reverse()
        .forEach((key) => {
            const value = obj[key];
            const path = parentPath ? `${parentPath}.${key}` : key;
            if (isString(value)) {
                flattened[path] = value;
            } else {
                Object.assign(flattened, flattenObject(value, path));
            }
        });
    return flattened;
}
