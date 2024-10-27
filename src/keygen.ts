import { Keypair } from "@solana/web3.js";

// Generate a new keypair
let kp = Keypair.generate();

console.log(`You've generated a new Solana wallet:
    ${kp.publicKey.toBase58()}`);
console.log(`[${kp.secretKey}]`);

// 5NPWinD3mzkauZyHwxjHjeL8d6jp3a736W9niMNryxdM
