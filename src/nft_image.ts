import wallet from "./dch-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    //1. Load image
    //2. Convert image to generic file.
    //3. Upload image

    const image = await readFile(
      "/Users/mac/Desktop/Decharge_NFt/src/Decharge.png"
    );
    const genericImg = createGenericFile(image, "Decharge.png", {
      displayName: "Decharge",
      contentType: "image/png",
      extension: "png",
    });
    //https://arweave.net/9r6KHLd3cdpwjhinAtzRvs9EdwoyyMsgikcfwbQxayX7
    //https://devnet.irys.xyz/9r6KHLd3cdpwjhinAtzRvs9EdwoyyMsgikcfwbQxayX7

    const [myUri] = await umi.uploader.upload([genericImg]);

    console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
