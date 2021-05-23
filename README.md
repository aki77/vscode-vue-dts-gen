# vue-dts-gen

Creates .d.ts files from `.vue` files in VS Code.

![demo](https://i.gyazo.com/6001c245210117d8d097b9a87f2f265d.gif)

## Requirements

- [vue\-dts\-gen](https://github.com/egoist/vue-dts-gen)

```
npm install -D vue-dts-gen
```

## Usage

put

```vue
<script lang="ts">
// @type
```

or

```vue
<script lang="ts">
/* @type */
```

ahead of your `.vue` file, and save, you will get a d.ts file in same directory.

## Commands

- `vueDtsGen.generate`
