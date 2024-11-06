import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  fetchToken,
  transferTokens,
  findAssociatedTokenPda,
  mintTokensTo,
  createAssociatedToken,
  createMint,
  createMintWithAssociatedToken,
} from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";

import wallet from "./dch-wallet.json";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT).use(mplTokenMetadata());

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));

(async () => {
  // generate a mint

  const mint = generateSigner(umi);
  console.log(`Destination wallet: ${mint}`);

  const destination = generateSigner(umi).publicKey;
  console.log(`Destination wallet: ${destination}`);

  //create a mint

  const createMintTx = await transactionBuilder()
    .add(
      createMint(umi, {
        mint,
        decimals: 6,
        mintAuthority: umi.identity.publicKey,
        freezeAuthority: null,
      })
    )
    .add(
      createAssociatedToken(umi, {
        owner: umi.identity.publicKey,
        mint: mint.publicKey,
      })
    )
    .add(
      createAssociatedToken(umi, {
        owner: destination,
        mint: mint.publicKey,
      })
    )
    .add(
      mintTokensTo(umi, {
        mint: mint.publicKey,
        token: findAssociatedTokenPda(umi, {
          mint: mint.publicKey,
          owner: umi.identity.publicKey,
        }),
        amount: 100e6,
      })
    )
    .add(
      transferTokens(umi, {
        source: findAssociatedTokenPda(umi, {
          mint: mint.publicKey,
          owner: umi.identity.publicKey,
        }),
        destination: findAssociatedTokenPda(umi, {
          mint: mint.publicKey,
          owner: destination,
        }),
        amount: 50e6,
      })
    )
    .sendAndConfirm(umi);

  const createMinttx = await transactionBuilder()
    .add(
      createMintWithAssociatedToken(umi, {
        mint: mint,
        owner: umi.identity.publicKey,
        decimals: 6,
        mintAuthority: umi.identity.publicKey,
        freezeAuthority: null,
        amount: 100e6,
      })
    )
    .add(
      createAssociatedToken(umi, {
        owner: destination,
        mint: mint.publicKey,
      })
    )
    .add(
      transferTokens(umi, {
        source: findAssociatedTokenPda(umi, {
          mint: mint.publicKey,
          owner: umi.identity.publicKey,
        }),
        destination: findAssociatedTokenPda(umi, {
          mint: mint.publicKey,
          owner: destination,
        }),
        amount: 50e6,
      })
    )
    .sendAndConfirm(umi);

  const createMintTxSignature = base58.deserialize(createMintTx.signature)[0];
  console.log(
    `drained: https://solana.fm.tx/${createMintTxSignature}?cluster=devnet-alpha`
  );
})();
