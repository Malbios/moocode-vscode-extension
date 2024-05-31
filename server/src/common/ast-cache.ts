import { generateAst as generateNewAst } from 'moocode-parsing';
import { Ast } from 'moocode-parsing/lib/interfaces';

export class AstCache {
	private _cache = new Map<string, Ast>();

	public generateAst(input: string): Ast {
		const cachedAst = this._cache.get(input);
		if (cachedAst) {
			return cachedAst;
		}

		const newAst = generateNewAst(input);

		this._cache.set(input, newAst);

		return newAst;
	}
}