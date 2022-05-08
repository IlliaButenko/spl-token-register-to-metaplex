const web3 = require("@solana/web3.js");
const mplToken = require("@metaplex-foundation/mpl-token-metadata");

// NFT is a mint. just like SRM, USDC ..., the only different is that NFT's supply is 1
//
// if we want to get NFT's metadata, first we need to know what is the mint address.
// here I take a random DAPE as an example
// https://explorer.solana.com/address/5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp
//
// tokenmeta is a PDA a which derived by mint address
// the formula is ['metadata', metadata_program_id, mint_id]
// is it totally fine to forget it because sdk already wrapped it for us

const connection = new web3.Connection("https://api.devnet.solana.com");
// const connection = new web3.Connection("https://api.mainnet-beta.solana.com");

(async () => {
  // let mintPubkey = new web3.PublicKey("5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp");
  let mintPubkey = new web3.PublicKey("6FzDRNrhR33hmBHf5kwtUr9MxvPFc9dqwEqyzX2CEad1");
  let tokenmetaPubkey = await mplToken.Metadata.getPDA(mintPubkey);

  const tokenmeta = await mplToken.Metadata.load(connection, tokenmetaPubkey);
  console.log(tokenmeta);
})();