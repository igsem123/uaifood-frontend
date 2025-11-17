export type FrontendError =
    | {
    type: "validation";
    messages: string[];
}
    | {
    type: "api";
    message: string;
};
