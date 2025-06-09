# Pixel War: Interactive Collaborative Canvas

A Next.js application that implements a collaborative pixel canvas where users can place individual pixels in real-time, similar to Reddit's r/place experiment.

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/) for real-time updates
- [HeroUI v2](https://heroui.com/) for UI components
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter) for wallet integration

## Features

## Architecture Decisions

- **Dual Canvas Rendering**: Using separate canvases for the main content and overlays improves performance by avoiding redrawing permanent pixels.
- **Custom Hook Pattern**: Separating canvas logic into a custom hook keeps components clean and enables reuse.
- **Debounced Preview**: The 500ms delay before showing previews prevents accidental placements and improves user experience.
- **Zoom-dependent Grid**: The grid only appears at higher zoom levels to keep the interface clean at lower zoom levels.

## How to Use

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000/canva](http://localhost:3000/canva) to view the canvas.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
