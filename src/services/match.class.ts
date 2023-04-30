export abstract class Matches {
    public matches: unknown = [];
    public template: HTML | Markdown | undefined;

    abstract fetchMatches(): void;
    protected abstract normilizeResponse(matches: unknown): void;
    protected abstract prepareTemplate(): void;
}