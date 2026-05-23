import { ethers } from 'ethers';
import fs from 'fs';

// Load contract ABI
const contractABI = JSON.parse(fs.readFileSync('./artifacts/contracts/TransactionRegistry.sol/TransactionRegistry.json', 'utf8')).abi;
const contractBytecode = JSON.parse(fs.readFileSync('./artifacts/contracts/TransactionRegistry.sol/TransactionRegistry.json', 'utf8')).bytecode;

async function deploy() {
  console.log("🚀 Deploying TransactionRegistry contract...");

  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get first signer (deployer)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Account #0
  const deployer = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await provider.getBalance(deployer.address)).toString());

  // Create contract factory and deploy
  const factory = new ethers.ContractFactory(contractABI, contractBytecode, deployer);
  const contract = await factory.deploy();
  
  // Wait for deployment
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ TransactionRegistry deployed to:", contractAddress);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. In your app, run in browser console:");
  console.log("   setContractAddress('" + contractAddress + "')");
  console.log("3. Refresh the page");
  
  // Save contract address to a file
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: "localhost:8545"
  };
  
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployment-info.json");
  console.log("\n✅ SUCCESS! Your blockchain is ready!");
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });
