export function WasRefresh(): boolean {
	return performance.navigation.type === ENavigationType.Refresh;
}

export enum ENavigationType {
	Reload,
	Refresh,
	BackForward,
	Reserved,
}
