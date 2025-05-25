export function verifyReadability(
    userId: string | undefined,
) {
    if (userId !== "890908900520505354") throw new Error("このコマンドは開発者のみが使用できます。");
}
