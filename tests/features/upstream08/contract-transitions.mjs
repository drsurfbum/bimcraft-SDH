/* SPDX-License-Identifier: Apache-2.0 */
// Explicit upstream contract changes, not generic label normalization or ignored failures.
export const pins={before:'c778c7ca3f83eeecc3e815078417f152b2ca7a94',after:'51c1b44012b98685f43f3ca99a463c240cf0d7ef'};
export const sourceProof=[
 {file:'tests/tools/bimcraft-test/mep07-test.mjs',before:'84a3d21defc3da2c177a45c2e77d521c1c474402',after:'337e402bcb1aabf0b27400fec74e9b13445d0f0a'},
 {file:'tests/tools/bimcraft-test/res-test.mjs',before:'a3ff059ee96b27347e18e8f5361ecba24582c87e',after:'9153c84669930f647a5893b910e7bd61dffd9937'},
];
export const transitions=[
 {modes:['mep07'],before:'the API says 1.1',after:['the API says 1.1 or later (1.4)'],reason:'Pinned 0.8 adds API1.2–1.4 capabilities; it must not claim the old exact1.1 version. Existing1.0–1.4 manifests and future-version refusal are tested separately.'},
 {modes:['mep07'],before:'an add-on written for 1.0 still loads; one asking for 1.2 does not',after:['an add-on written for 1.0 still loads; one asking for a later API than the app has does not'],reason:'API1.2 is now supported; the pinned upstream predicate retains1.0 acceptance and refuses1.99. Do not silently enforce the obsolete1.2 rejection.'},
 {modes:['res','res-rc9'],before:'TJI 40/10 L/480 table: smallest passing series/depth, refuse beyond subset',after:["no built-in TJI span data is exported (a maker's tables are not ours)",'TJI with no table loaded is refused (tji.err.none), nothing framed'],reason:'Pinned0.8 deliberately removes bundled manufacturer span data. Both no-built-in-data and no-table refusal are required. Supplemental tests retain smallest-fitting-depth and beyond-table refusal using the explicitly fictional imported table.'},
 {modes:['res','res-rc9'],before:'TJI floor assembly uses the chosen direction and sized joists',after:['TJI floor assembly (example table) uses the chosen direction and sized joists'],reason:'The retained direction/sized-joist predicate now receives an explicit fictional table instead of unlicensed bundled manufacturer values.'},
];
export function applyContractTransitions(cases,mode){
 const applied=[];
 const expected=cases.flatMap(name=>{const change=transitions.find(x=>x.modes.includes(mode)&&x.before===name);if(!change)return[name];applied.push({...change,pins});return change.after;});
 return {expected,applied};
}
