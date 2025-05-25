export function verifyReadability(userId: string | undefined, allowedUserId: string) {
	if (userId !== allowedUserId)
		throw new Error("このコマンドは開発者のみが使用できます。");
}
