# Change Log

## 4.0.2

### Patch Changes

- [#191](https://github.com/wKovacs64/use-stepper/pull/191) [`ac45099`](https://github.com/wKovacs64/use-stepper/commit/ac450993f814f18f0651a886845466e5f7a9ed2a) Thanks [@renovate](https://github.com/apps/renovate)! - Publish the types for ESM as well as CJS.

  For reference, see the following Twitter thread from Andrew Branch: https://mobile.twitter.com/atcb/status/1634653474041503744?t=8RVawwsEHrxnCD8BaITckg

## 4.0.1

### Patch Changes

- [`fedd8c6`](https://github.com/wKovacs64/use-stepper/commit/fedd8c6f258eec1030cf50ed819b6b4803b02a9b) Thanks [@wKovacs64](https://github.com/wKovacs64)! - Write version bumps to `package-lock.json`.

## 4.0.0

### Major Changes

- [`b4675db`](https://github.com/wKovacs64/use-stepper/commit/b4675dba037347d2b81a1bde3de2cda5c2ecd745) Thanks [@wKovacs64](https://github.com/wKovacs64)! - `useStepper` is now a named export.

  ```diff
  -import useStepper from 'use-stepper'
  +import { useStepper } from 'use-stepper'
  ```

- [`588b235`](https://github.com/wKovacs64/use-stepper/commit/588b235581080bc476e3f537910edf932bea819e) Thanks [@wKovacs64](https://github.com/wKovacs64)! - This package is no longer published in UMD format. If you need to consume it as UMD, please remain on v3.
