export function setMultipleClassNames(
    ...classNames: (string | false | null | undefined)[]
): string {
    return classNames.filter(Boolean).join(" ");
}
