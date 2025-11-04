export interface INotifier {
	enqueue(payload: Record<string, any>): Promise<void>;
}
