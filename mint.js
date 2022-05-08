const web3 = require("@solana/web3.js");
const SPLToken = require("@solana/spl-token");

// fetch mint info

// you can get mint informations by a mint address

async function main() {
  // we can use the function which lives in @solana/spl-token to fetch mint info
  // the parameters are, (connection, mint address, token program id, fee payer)
  // here we just want to fetch info, so we don't need to pass fee payer
  const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
  let mintPubkey = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx");
  let token = new SPLToken.Token(connection, mintPubkey, SPLToken.TOKEN_PROGRAM_ID, null);
  let tokenInfo = await token.getMintInfo();
  console.log(tokenInfo);

  // you will find that the data not include name, symbol, image...
  // because in the begin, solana don't make these data write on chain
  // if you want to fetch these info, refer to
  // https://github.com/solana-labs/token-list
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);