# Néolias II — Le premier passage

First playable prototype for Nicolas and Adrien. Static browser game; serve `dist/` over HTTP. No build or external runtime dependency. Three.js 0.170.0 is bundled locally under its MIT license.

## Established constraints

Same turquoise-jacket explorer, brown satchel and golden star; sequel after returning the masks to their guardians. Solo, automatic camera, three 3D puzzle rooms, inventory and reusable/combined items. No combat, death, score, energy, penalties or hint system. Unlimited attempts. Progress saved after each inventory/puzzle/room change in the current browser.

## Prototype proposals

The floating sanctuary, subtitle, new inscriptions, specific puzzles and light sceptre are implementation proposals, not final narrative canon.

## Controls

ZQSD / WASD / arrows, space to jump, E to interact, I for inventory, F to project light. Click ground to walk. Touch directional buttons and actions on coarse pointers. Sound opt-in.

## Validation

`node checks.mjs` checks puzzle configurations, inventory crafting, persistence and recovery. Browser visual and interaction QA uses the Sites preview. WebGL renders the full lit scene; a Canvas software projection uses the same 3D geometry if WebGL is unavailable.

## Scope

Three short rooms. Local browser save, no account synchronization. Placeholder low-poly environment and proposed story. Fixed camera and basic collisions; jumping is cosmetic in this first version. No mobile performance benchmark yet.
