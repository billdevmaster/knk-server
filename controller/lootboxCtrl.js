const anchor =  require ('@project-serum/anchor');
const { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE, createBurnCheckedInstruction, getAccount, createTransferCheckedInstruction, transferChecked, createAssociatedTokenAccount, burnChecked } = require('@solana/spl-token');
const { Connection, PublicKey, Transaction, Keypair }  = require('@solana/web3.js');
const web3 =  require("@solana/web3.js");
const { Program, Provider, AnchorProvider, Wallet } = require ('@project-serum/anchor');
const fs = require('fs');
const fetch = require('node-fetch');
const bs58 = require("bs58");

const idl = require('../contract/idl.json')
const { Loot_List, Lootbox } = require('../constants');

const getRandLoot = async (req, res) => {
	console.log("randloot")
	let randomLoot = Loot_List[Math.floor(Math.random() * Loot_List.length)];
    const userPubKey = new PublicKey(req.body.walletAddress);
    const network = "https://metaplex.devnet.rpcpool.com";
		const connection = new Connection(network, 'confirmed');
    const rawData = fs.readFileSync(
        'id.json'
        );
    const keyData = JSON.parse(rawData.toString());
    const adminKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
    const wallet = new Wallet(adminKeypair);
    const provider = new Provider(
        connection, wallet, 'confirmed',
    );
	
    const { SystemProgram } = web3;
	const programID = new PublicKey(idl.metadata.address);
	const program = new Program(idl, programID, provider);

    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
	const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(
		MINT_SIZE
	);

	const getMetadata = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
	const getMasterEdition = async (
	mint
	) => {
	return (
		await anchor.web3.PublicKey.findProgramAddress(
		[
			Buffer.from("metadata"),
			TOKEN_METADATA_PROGRAM_ID.toBuffer(),
			mint.toBuffer(),
			Buffer.from("edition"),
		],
		TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
	};
	const mintKey = anchor.web3.Keypair.generate();
	// console.log(mintKey.publicKey + "");
	const NftTokenAccount = await getAssociatedTokenAddress(
		mintKey.publicKey,
		wallet.publicKey
		);
	console.log("NFT Account: ", NftTokenAccount.toBase58());

	const mint_tx = new anchor.web3.Transaction().add(
		anchor.web3.SystemProgram.createAccount({
			fromPubkey: wallet.publicKey,
			newAccountPubkey: mintKey.publicKey,
			space: MINT_SIZE,
			programId: TOKEN_PROGRAM_ID,
			lamports,
		}),
		createInitializeMintInstruction(
			mintKey.publicKey,
			0,
			wallet.publicKey,
			wallet.publicKey
		),
		createAssociatedTokenAccountInstruction(
			wallet.publicKey,
			NftTokenAccount,
			wallet.publicKey,
			mintKey.publicKey
		)
	);
    const respond = await program.provider.send(mint_tx, [mintKey]);
    console.log(
        await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );
    
   
	console.log("Mint key: ", mintKey.publicKey.toString());
	console.log("User: ", program.provider.wallet.publicKey.toString());
	const metadataAddress = await getMetadata(mintKey.publicKey);
	const masterEdition = await getMasterEdition(mintKey.publicKey);
	console.log("Metadata address: ", metadataAddress.toBase58());
	console.log("MasterEdition: ", masterEdition.toBase58());
	console.log(SystemProgram.programId + "")
	// get data from url
	let content = await fetch(randomLoot)//.then(res => res.json()).then(text => console.log(text));
    let data = await content.json()
	const tx = await program.methods.mintNft(
        mintKey.publicKey,
        randomLoot,
        data.name,
        data.symbol,
      )
        .accounts({
          mintAuthority: wallet.publicKey,
          mint: mintKey.publicKey,
          tokenAccount: NftTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          metadata: metadataAddress,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          masterEdition: masterEdition,
        },
        )
        .rpc();
		console.log(tx)

	// transfer
	let ata = await createAssociatedTokenAccount(
			connection, // connection
			adminKeypair, // fee payer
			mintKey.publicKey, // mint
			userPubKey // owner,
	);
	
	let txhash = await transferChecked(
		connection, // connection
		adminKeypair, // payer
		NftTokenAccount, // from (should be a token account)
		mintKey.publicKey, // mint
		ata, // to (should be a token account)
		adminKeypair, // from's owner
		1, // amount, if your deciamls is 8, send 10^8 for 1 token
	);
	console.log(`txhash: ${txhash}`);
	
	res.json({status : 'success'});
}

const mintLootbox = async ( req, res ) => {
	const userPubKey = new PublicKey(req.body.walletAddress);
	const network = "https://metaplex.devnet.rpcpool.com";
	const connection = new Connection(network, 'confirmed');
	const rawData = fs.readFileSync(
		'id.json'
	);
	const keyData = JSON.parse(rawData.toString());
	const adminKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
	const wallet = new Wallet(adminKeypair);
	const provider = new Provider(
			connection, wallet, 'confirmed',
	);
	const { SystemProgram } = web3;
	const programID = new PublicKey(idl.metadata.address);
	const program = new Program(idl, programID, provider);

	const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
	const lamports = await program.provider.connection.getMinimumBalanceForRentExemption(
		MINT_SIZE
	);

	const getMetadata = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
		};
		const getMasterEdition = async (
		mint
		) => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
				Buffer.from("edition"),
			],
			TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
	};
	const mintKey = anchor.web3.Keypair.generate();
	// console.log(mintKey.publicKey + "");
	const NftTokenAccount = await getAssociatedTokenAddress(
		mintKey.publicKey,
		wallet.publicKey
	);
	console.log("NFT Account: ", NftTokenAccount.toBase58());

	const mint_tx = new anchor.web3.Transaction().add(
		anchor.web3.SystemProgram.createAccount({
			fromPubkey: wallet.publicKey,
			newAccountPubkey: mintKey.publicKey,
			space: MINT_SIZE,
			programId: TOKEN_PROGRAM_ID,
			lamports,
		}),
		createInitializeMintInstruction(
			mintKey.publicKey,
			0,
			wallet.publicKey,
			wallet.publicKey
		),
		createAssociatedTokenAccountInstruction(
			wallet.publicKey,
			NftTokenAccount,
			wallet.publicKey,
			mintKey.publicKey
		)
	);
	const respond = await program.provider.send(mint_tx, [mintKey]);
	console.log(
			await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
	);
	
 
	console.log("Mint key: ", mintKey.publicKey.toString());
	console.log("User: ", program.provider.wallet.publicKey.toString());
	const metadataAddress = await getMetadata(mintKey.publicKey);
	const masterEdition = await getMasterEdition(mintKey.publicKey);
	console.log("Metadata address: ", metadataAddress.toBase58());
	console.log("MasterEdition: ", masterEdition.toBase58());
	console.log(SystemProgram.programId + "")
	// get data from url
	let content = await fetch(Lootbox[0])//.then(res => res.json()).then(text => console.log(text));
	let data = await content.json()
	const tx = await program.methods.mintNft(
		mintKey.publicKey,
		Lootbox[0],
		data.name,
		data.symbol,
	)
	.accounts({
		mintAuthority: wallet.publicKey,
		mint: mintKey.publicKey,
		tokenAccount: NftTokenAccount,
		tokenProgram: TOKEN_PROGRAM_ID,
		metadata: metadataAddress,
		tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
		payer: wallet.publicKey,
		systemProgram: SystemProgram.programId,
		rent: anchor.web3.SYSVAR_RENT_PUBKEY,
		masterEdition: masterEdition,
	}, )
	.rpc();
	console.log(tx)

	// transfer
	let ata = await createAssociatedTokenAccount(
			connection, // connection
			adminKeypair, // fee payer
			mintKey.publicKey, // mint
			userPubKey // owner,
	);
			
	let txhash = await transferChecked(
		connection, // connection
		adminKeypair, // payer
		NftTokenAccount, // from (should be a token account)
		mintKey.publicKey, // mint
		ata, // to (should be a token account)
		adminKeypair, // from's owner
		1, // amount, if your deciamls is 8, send 10^8 for 1 token
	);

	

	res.json({status : 'success'});
}

module.exports = { getRandLoot, mintLootbox };