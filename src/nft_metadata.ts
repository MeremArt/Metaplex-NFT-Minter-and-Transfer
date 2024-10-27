import wallet from "./dch-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

    const metadata = {
      name: "DeCharge Product Hub",
      symbol: "DPH",
      description:
        "The Decharge NFT offers exclusive benefits in the Decharge ecosystem, including discounts on EV charging, redeemable renewable energy points, and VIP event access. As proof of ownership, it unlocks premium access to Decharge stations and rewards eco-friendly participation.",
      image:
        "https://devnet.irys.xyz/9r6KHLd3cdpwjhinAtzRvs9EdwoyyMsgikcfwbQxayX7",
      attributes: [
        { trait_type: "Discount", value: "20%" },
        { trait_type: "Proof of Ownership", value: "Yes" },
        { trait_type: "Access Level", value: "Premium" },
        { trait_type: "Renewable Energy Points", value: "500" },
        { trait_type: "Charging Station Access", value: "All Locations" },
        { trait_type: "Special Perks", value: "VIP Events" },
        { trait_type: "Expiration Date", value: "None" },
        { trait_type: "Mint Date", value: "2024-10-26" },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://devnet.irys.xyz/9r6KHLd3cdpwjhinAtzRvs9EdwoyyMsgikcfwbQxayX7",
          },
        ],
      },
      creators: [],
    };
    const myUri = await umi.uploader.uploadJson(metadata);
    console.log("Your metadata URI: ", myUri);
    //https://arweave.net/298Q8vfsA9cnMUA9HxGKcNj4b6M8of7jViChnXvQz3BX
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
