# Clear Protocol Webapp

Stablecoin peg defense protocol interface for swapping depegged stablecoins and managing IOUs.

## Features

- **Swap Tab**: Exchange depegged stablecoins with route status indicator
- **IOU Toggle**: Keep IOUs for later redemption or dump on Curve for immediate exit
- **Wrap Tab**: Convert stablecoins 1:1 into IOU tokens

## Deployed Contracts (Mainnet)

| Contract | Address |
|----------|---------|
| Swap | `0xeb5AD3D93E59eFcbC6934caD2B48EB33BAf29745` |
| Oracle | `0x049ad7Ff0c6BdbaB86baf4b1A5a5cA975e234FCA` |
| Factory | `0x8bF266ED803e474AE7Bf09ADB5ba2566c489223d` |

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TreveeXYZ/clear-webapp)

Or connect your GitHub repo directly in the Vercel dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `TreveeXYZ/clear-webapp`
3. Deploy (no environment variables required)

## Tech Stack

- Next.js 16
- wagmi v2 + viem
- TailwindCSS
- TypeScript

## License

BUSL-1.1
