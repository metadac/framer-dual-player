# Framer Dual Player

This repository contains the source code for the **Framer Dual Player** component. It is a TypeScript-based package designed to provide a dual view video player within a Framer environment. 

The project is structured with reusable components, hooks and utilities to help manage media playback, synchronization, and picture-in-picture (PiP) controls. Although this repository does not include implementation details, it lays out the basic structure you can build upon.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/metadac/framer-dual-player.git
cd framer-dual-player
npm install
```

Use the provided scripts to run, build, lint and format the project:

```bash
npm run dev     # start Framer
npm run build   # run TypeScript compiler
npm run lint    # lint TypeScript/TSX files
npm run format  # format source files using Prettier
```

## Project Structure

The project follows this structure:

```
framer-dual-player/
├── src/
│   ├── components/
│   │   └── DualViewPlayer.tsx
│   ├── hooks/
│   │   ├── useHLS.ts
│   │   ├── useMediaSync.ts
│   │   └── usePiPControls.ts
│   ├── utils/
│   │   ├── timeHelpers.ts
│   │   └── videoHelpers.ts
│   └── icons/
│       └── PlayerIcons.tsx
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

You can start implementing the corresponding files according to your needs. Each file currently contains a simple placeholder implementation.
