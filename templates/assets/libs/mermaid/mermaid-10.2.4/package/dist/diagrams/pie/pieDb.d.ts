export function parseDirective(statement: any, context: any, type: any): void;
declare namespace _default {
    export { parseDirective };
    export function getConfig(): import("../../config.type.js").PieDiagramConfig | undefined;
    export { addSection };
    export { getSections };
    export { cleanupValue };
    export { clear };
    export { setAccTitle };
    export { getAccTitle };
    export { setDiagramTitle };
    export { getDiagramTitle };
    export { setShowData };
    export { getShowData };
    export { getAccDescription };
    export { setAccDescription };
}
export default _default;
declare function addSection(id: any, value: any): void;
declare function getSections(): {};
declare function cleanupValue(value: any): number;
declare function clear(): void;
import { setAccTitle } from '../../commonDb.js';
import { getAccTitle } from '../../commonDb.js';
import { setDiagramTitle } from '../../commonDb.js';
import { getDiagramTitle } from '../../commonDb.js';
declare function setShowData(toggle: any): void;
declare function getShowData(): boolean;
import { getAccDescription } from '../../commonDb.js';
import { setAccDescription } from '../../commonDb.js';