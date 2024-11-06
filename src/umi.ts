import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  sol,
} from "@metaplex-foundation/umi";
import { transferAllSol, transferSol } from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";

import wallet from "./dch-wallet.json";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));

(async () => {
  console.log(
    `Balance of ${umi.identity.publicKey} before airdrop ${
      (await umi.rpc.getBalance(umi.identity.publicKey)).basisPoints
    }`
  );

  //airdrop sol

  await umi.rpc.airdrop(umi.identity.publicKey, sol(2));
  console.log(
    `Balance of ${umi.identity.publicKey} after airdrop ${
      (await umi.rpc.getBalance(umi.identity.publicKey)).basisPoints
    }`
  );

  // Generate destination wallet
  const destination = generateSigner(umi).publicKey;
  console.log(`Destination wallet: ${destination}`);

  //perform a sol transfer
  const transferTx = await transferSol(umi, {
    source: umi.payer,
    destination,
    amount: sol(0.1),
  }).sendAndConfirm(umi);

  const transferSignature = base58.deserialize(transferTx.signature)[0];
  console.log(
    `Sent 0.1 sol: https://solana.fm.tx/${transferSignature}?cluster=devnet-alpha`
  );

  console.log(
    `Balance of ${umi.identity.publicKey} after transfer ${
      (await umi.rpc.getBalance(umi.identity.publicKey)).basisPoints
    }`
  );
  console.log(
    `Balance of ${destination} destination 
    after transfer ${(await umi.rpc.getBalance(destination)).basisPoints}`
  );

  //drain wallet

  const draintTx = await transferAllSol(umi, {
    destination,
  }).sendAndConfirm(umi);

  const draintTxSignature = base58.deserialize(draintTx.signature)[0];
  console.log(
    `drained: https://solana.fm.tx/${draintTxSignature}?cluster=devnet-alpha`
  );
  console.log(
    `Balance of ${umi.identity.publicKey} after drain ${
      (await umi.rpc.getBalance(umi.identity.publicKey)).basisPoints
    }`
  );
})();
