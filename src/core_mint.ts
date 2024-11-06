import {
  generateSigner,
  percentAmount,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createCollection,
  create,
  transferV1,
  fetchAssetV1,
} from "@metaplex-foundation/mpl-core";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import wallet from "./dch-wallet.json";
const ATAkeypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);
let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
  //generate collection keypair

  const collection = generateSigner(umi);
  console.log("\nCollection Address:", collection.publicKey.toString());

  //generate collection

  const createCollectionTx = await createCollection(umi, {
    collection: collection,
    name: "Decharge",
    uri: "https://devnet.irys.xyz/298Q8vfsA9cnMUA9HxGKcNj4b6M8of7jViChnXvQz3BX",
  }).sendAndConfirm(umi);

  const createCollectionSignature = base58.deserialize(
    createCollectionTx.signature
  )[0];

  console.log(createCollectionSignature);
  console.log(
    `https://solana.fm/tx/${createCollectionSignature}?cluster=devnet`
  );

  console.log("/n Creating asset...");

  const asset = generateSigner(umi);

  const assestpb = new PublicKey(asset.publicKey);

  console.log(asset.publicKey.toString());

  const createAssetTx = await create(umi, {
    asset,
    collection,
    name: "Decharge",
    uri: "https://devnet.irys.xyz/298Q8vfsA9cnMUA9HxGKcNj4b6M8of7jViChnXvQz3BX",
    plugins: [
      {
        type: "Attributes",
        attributeList: [
          { key: "Proof of Ownership", value: "Yes" },
          { key: "Charging Station Access", value: "Yes" },
          { key: "Mint Date", value: new Date().toISOString() },
        ],
      },
    ],
  }).sendAndConfirm(umi);

  const createAssetSignature = base58.deserialize(createAssetTx.signature)[0];
  console.log(createAssetSignature);
  console.log("mint address", asset.publicKey);
  console.log(`https://solana.fm/tx/${createAssetSignature}?cluster=devnet`);

  //   const collectionpb = collection.publicKey;
  //   const assestpb = asset.publicKey;
  //   const newOwner = publicKey("HgbrurVvvFNjyGZr21b6v7jRD3r1LR8ZTsTB3b5kv7MW");

  //   const tx = await transferV1(umi, {
  //     asset: assestpb,
  //     newOwner: newOwner,
  //     collection: collectionpb,
  //   }).sendAndConfirm(umi);

  //   const Transfersignauture = base58.deserialize(tx.signature)[0];
  //   console.log(Transfersignauture);
  //   console.log(`https://solana.fm/tx/${Transfersignauture}?cluster=devnet`);

  //   const fetchedAsset = await fetchAssetV1(umi, assestpb);
  //   console.log("Verify that the Owner has Changed: \n", fetchedAsset);
})();
