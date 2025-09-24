import { FormattedMessage } from "react-intl";

interface IdValue {
    id: string | number;
    values: any;
}

const addScope = (scope: string, id: string | number): string =>
    `${scope}.${id}`;

const getFormattedMessageWithScope =
    (scope: string) => (idOrProps: string | number | IdValue) => {
        const tags = {
            b: (msg: string) => <b>{msg}</b>,
            i: (msg: string) => <i>{msg}</i>,
            p: (msg: string) => <p>{msg}</p>,
            div: (msg: string) => <div>{msg}</div>,
            span: (msg: string) => <span>{msg}</span>,
        };

        return (
            <FormattedMessage
                {...(typeof idOrProps === "string" ||
                typeof idOrProps === "number"
                    ? {
                          id: addScope(scope, idOrProps),
                          values: {
                              ...tags,
                          },
                      }
                    : {
                          ...idOrProps,
                          id: addScope(scope, idOrProps.id),
                          values: {
                              ...idOrProps.values,
                              ...tags,
                          },
                      })}
            />
        );
    };

export default getFormattedMessageWithScope;
