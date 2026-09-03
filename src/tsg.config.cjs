/**
 * ts-gear 通过 require() 加载配置；项目为 "type": "module"，
 * 因此必须用 .cjs，不能用 .ts 的 ESM export。
 */
const dest = 'service';

/** @type {import('ts-gear').Project[]} */
const projects = [
  {
    name: 'api',
    dest,
    source: 'http://localhost:3000/docs-json',
    importRequesterStatement: "import { request } from '../../utils/request'",
    keepGeneric: false,
    shouldExportRequestOptionType: true,
    shouldGenerateMock: false,
  },
];

module.exports = projects;
