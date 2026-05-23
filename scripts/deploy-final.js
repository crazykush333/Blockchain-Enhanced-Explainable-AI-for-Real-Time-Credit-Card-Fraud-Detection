import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying TransactionRegistry contract...");

  try {
    console.log("Current network:", hre.network.name);
    
    // Create ethers provider for localhost
    const ethers = hre.ethers;
    console.log("Ethers available:", !!ethers);
    
    // Get signers from the localhost network
    const signers = await hre.ethers.getSigners();
    console.log("Number of signers:", signers.length);
    
    const deployer = signers[0];
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    console.log("Getting contract factory...");
    const Factory = await ethers.getContractFactory("TransactionRegistry");
    console.log("Deploying contract...");
    
    const contract = await Factory.deploy();
    console.log("Waiting for deployment to complete...");

    const receipt = await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("\n✅ Contract successfully deployed!");
    console.log("✅ Contract address:", contractAddress);
    console.log("\n📋 Next steps:");
    console.log("1. Copy this address: " + contractAddress);
    console.log("2. In browser console, run: setContractAddress('" + contractAddress + "')");
    console.log("3. Refresh the browser page\n");

    // Save deployment info
    const deploymentInfo = {
      network: "localhost",
      contractAddress: contractAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: receipt
    };

    const filePath = path.join(__dirname, '..', 'deployment-info.json');
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to deployment-info.json");
  } catch (error) {
    console.error("❌ Deployment failed!");
    console.error("Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Deployment complete!");
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
