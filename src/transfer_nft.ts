import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  generateSigner,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  transferV1,
  fetchAssetV1,
  updateCollectionPlugin,
} from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

import wallet from "./dch-wallet.json";

const umi = createUmi("https://api.devnet.solana.com", "finalized");

let keyair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keyair);
umi.use(signerIdentity(myKeypairSigner));

(async () => {
  // Use the Asset PublicKey
  const asset = publicKey("4v9LGShGWZ2AQ7gSsNmLJ9ZSn9TY3dJtL2rcy8aiNLj2");
  const fetchedAsset = await fetchAssetV1(umi, asset);
  // Use the new Owner PublicKey
  const newOwner = publicKey("HgbrurVvvFNjyGZr21b6v7jRD3r1LR8ZTsTB3b5kv7MW");
  const collection = publicKey("CVz3K6MYdhon6h9QbZ2QHr51qyw2UcahiJEsRcZqJYh6");
  //   const updateTx = await updateCollectionPlugin(umi, {
  //     collection,
  //     plugin: {
  //       type: "",
  //     },
  //   }).sendAndConfirm(umi);
  //   const updateTxsign = base58.deserialize(updateTx.signature)[0];
  //   console.log(updateTxsign);
  // [?] Use the Collection PublicKey. This is a requirement if the Asset belongs to a Collection

  // Transfer the Asset
  const tx = await transferV1(umi, {
    asset: asset,
    newOwner: newOwner,
    collection: collection,
  }).sendAndConfirm(umi);

  // Deserialize the Signature from the Transaction
  const signauture = base58.deserialize(tx.signature)[0];
  console.log(signauture);

  // Fetch the Asset to verify the Owner has changed

  console.log("Verify that the Owner has Changed: \n", fetchedAsset);
})();

/*

    TransferV1 Instruction:
    -----------------------------------
    Accounts:
    - asset: PublicKey | Pda;                           // The address of the asset
    - newOwner: PublicKey | Pda;                        // The new owner to which to transfer the asset
    - collection?: PublicKey | Pda;                     // [?] The collection to which the asset belongs
    - authority?: Signer;                               // [?] The owner or delegate of the asset
    - payer?: Signer;                                   // [?] The account paying for the fees

    Data:
    - compressionProof?: OptionOrNullable<CompressionProofArgs>;

*/
