import {
  createAssociatedTokenAccountInstruction,
  createMetadataInstruction,
  createMasterEditionInstruction,
  createUpdateMetadataInstruction,
} from './helpers/instructions';
import { sendTransactionWithRetryWithKeypair } from './helpers/transactions';
import {
  getTokenWallet,
  getMetadata,
  getMasterEdition,
} from './helpers/accounts';
import * as anchor from '@project-serum/anchor';
import {
  Data,
  Creator,
  CreateMetadataArgs,
  UpdateMetadataArgs,
  CreateMasterEditionArgs,
  METADATA_SCHEMA,
} from './helpers/schema';
import { serialize } from 'borsh';
import { TOKEN_PROGRAM_ID } from './helpers/constants';
import fetch from 'node-fetch';
import { MintLayout } from '@solana/spl-token';
import {
  Keypair,
  Connection,
  SystemProgram,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';

import fs from 'fs';
import os from "os";
const walletJson = require('/home/wstar/.config/solana/id.json');//// pls update xtag token creator wallet path

const createMetadata = async () => {
  // Metadata
  let metadata = {
    symbol: "XTAG",
    name: "xHashtag Token",
    uri: "",

  };

  let metaCreators = [{
    address: 'aZUQ6mAFCarZnAkgFem22XjwewdaqLWTvES4jHXe5QG', //// pls update xtag token creator wallet address
    share: 100
  }]

  const creators = metaCreators.map(
    creator =>
      new Creator({
        address: creator.address,
        share: creator.share,
        verified: 1,
      }),
  );

  return new Data({
    symbol: metadata.symbol,
    name: metadata.name,
    uri: metadata.uri,
    sellerFeeBasisPoints: 0,
    creators: creators,
  });
};


const createTokenMetadata = async (
  connection,
  walletKeypair,
  mintPubkey,
) => {
  const mutableMetadata = true;
  // Retrieve metadata
  const data = await createMetadata();
  if (!data) return;
  console.log(data)
  // Create wallet from keypair
  const wallet = new anchor.Wallet(walletKeypair);
  if (!wallet?.publicKey) return;

  // Allocate memory for the account
  const mintRent = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span,
  );

  let instructions = [];
  let signers = [walletKeypair];

  // Create metadata
  const metadataAccount = await getMetadata(mintPubkey);
  let txnData = Buffer.from(
    serialize(
      METADATA_SCHEMA,
      new CreateMetadataArgs({ data, isMutable: mutableMetadata }),
    ),
  );

  instructions.push(
    createMetadataInstruction(
      metadataAccount,
      mintPubkey,
      wallet.publicKey,
      wallet.publicKey,
      wallet.publicKey,
      txnData,
    ),
  );

  const res = await sendTransactionWithRetryWithKeypair(
    connection,
    walletKeypair,
    instructions,
    signers,
  );

  try {
    await connection.confirmTransaction(res.txid, 'max');
  } catch {
    // ignore
  }

  // Force wait for max confirmations
  await connection.getParsedConfirmedTransaction(res.txid, 'confirmed');
  console.log('metadata created', res.txid);
  console.log('account', metadataAccount.toBase58());
  return metadataAccount;
};

const updateMetadata = async (
  mintKey,
  connection,
  walletKeypair
) => {
  // Retrieve metadata
  const data = null;
  if (!data) return;

  const metadataAccount = await getMetadata(mintKey);
  let signers = [];
  const value = new UpdateMetadataArgs({
    data,
    updateAuthority: walletKeypair.publicKey.toBase58(),
    primarySaleHappened: null,
  });
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));

  const instructions = [
    createUpdateMetadataInstruction(
      metadataAccount,
      walletKeypair.publicKey,
      txnData,
    ),
  ];

  // Execute transaction
  const txid = await sendTransactionWithRetryWithKeypair(
    connection,
    walletKeypair,
    instructions,
    signers,
  );
  console.log('Metadata updated', txid);
  return metadataAccount;
};

const run = async () => {
  // const connection = new Connection("https://api.mainnet-beta.solana.com");
  const connection = new Connection("https://api.devnet.solana.com");
  const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletJson));

  //// pls update with your token mint address
  // const mintKey = new PublicKey('5gs8nf4wojB5EXgDUWNLwXpknzgV2YWDhveAeBZpVLbp');
  const mintKey = new PublicKey('6FzDRNrhR33hmBHf5kwtUr9MxvPFc9dqwEqyzX2CEad1');

  await createTokenMetadata(connection, walletKeypair, mintKey);
}

run().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);;