import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  PublicKey,
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { transferV1 } from "@metaplex-foundation/mpl-token-metadata";
import {
  createNft,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import wallet from "./dch-wallet.json";
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);
const Gkeypair = Keypair.fromSecretKey(new Uint8Array(wallet));

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mintAddressString = "4dcKu19qYd98N4m3QCJ6v3pRRzaywunuBy6r6Sy6VbRf"; // here has to be updated with new toek address
const mintAddress = new PublicKey(mintAddressString);
const newOwner = new PublicKey("GeWJUMvrCWahZxy3JNyrHQ5CATxCscGB8J4xcFudPRFi");
const mint = generateSigner(umi);

const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

async function ensureBalanceForTransaction(
  walletPublicKey: PublicKey,
  requiredLamports: number
) {
  const balance = await connection.getBalance(walletPublicKey);
  console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < requiredLamports) {
    console.log("Balance is low, requesting airdrop...");
    const airdropSignature = await connection.requestAirdrop(
      walletPublicKey,
      requiredLamports - balance
    );
    await connection.confirmTransaction(airdropSignature, commitment);
    console.log(
      "Airdrop complete. New balance:",
      (await connection.getBalance(walletPublicKey)) / LAMPORTS_PER_SOL,
      "SOL"
    );
  } else {
    console.log("Sufficient balance, proceeding with transaction.");
  }
}

async function ensureTokenBalance(mintAddress: PublicKey, owner: PublicKey) {
  try {
    // Get or create the associated token account for the NFT holder
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Gkeypair, // Payer
      mintAddress,
      owner
    );

    // Fetch token account details to check the balance
    const tokenAccountInfo = await getAccount(connection, tokenAccount.address);

    // Check if the token account has a balance of 0 (i.e., no tokens)
    if (tokenAccountInfo.amount === 0n) {
      console.log("Token account is empty, minting NFT to it...");

      // Create a new mint if it doesn't exist
      // const newMint = await createMint(
      //   connection,
      //   Gkeypair, // Payer
      //   Gkeypair.publicKey, // Mint Authority
      //   Gkeypair.publicKey, // Freeze Authority
      //   0 // Decimals for NFT should be 0
      // );

      // // Mint one token to the account
      // await mintTo(
      //   connection,
      //   Gkeypair, // Payer
      //   newMint, // Mint Address
      //   tokenAccount.address, // Destination
      //   Gkeypair.publicKey, // Mint Authority
      //   1 // Amount
      // );

      console.log("Minting complete. Token account now holds the NFT.");
    } else {
      console.log("Token account has sufficient balance.");
    }

    return tokenAccount;
  } catch (error) {
    console.error("Error in ensureTokenBalance:", error);
    throw error;
  }
}

(async () => {
  try {
    // Ensure a minimum balance of 0.1 SOL
    const requiredBalance = 0.1 * LAMPORTS_PER_SOL;
    await ensureBalanceForTransaction(Gkeypair.publicKey, requiredBalance);

    // Create NFT
    let tx = await createNft(umi, {
      name: "Decharge",
      symbol: "DCH",
      uri: "https://devnet.irys.xyz/298Q8vfsA9cnMUA9HxGKcNj4b6M8of7jViChnXvQz3BX",
      sellerFeeBasisPoints: percentAmount(0),
      mint,
      creators: [
        {
          address: myKeypairSigner.publicKey,
          verified: true,
          share: 100,
        },
      ],
    });

    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(
      `Successfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    console.log("Mint Address: ", mint.publicKey);
    const newMintAddress = new PublicKey(mint.publicKey);
    // Get or create the token accounts
    const sourceTokenAccount = await ensureTokenBalance(
      mintAddress,
      Gkeypair.publicKey
    );

    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Gkeypair,
      mintAddress,
      newOwner
    );

    // Convert the web3.js PublicKey to Umi PublicKey
    const destinationOwnerUmi = publicKey(newOwner.toBase58());

    // Transfer NFT
    const transferTx = await transferV1(umi, {
      authority: myKeypairSigner,
      tokenOwner: myKeypairSigner.publicKey,
      destinationOwner: destinationOwnerUmi,
      mint: publicKey(mintAddress.toBase58()),
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);

    console.log("Transfer successful!");
    console.log(
      "Transfer transaction:",
      `https://explorer.solana.com/tx/${base58.encode(
        transferTx.signature
      )}?cluster=devnet`
    );
  } catch (error) {
    console.error("Error:", error);
  }
})();
