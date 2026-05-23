import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying TransactionRegistry contract...");

  try {
    // Get ethers from hardhat
    const ethers = hre.ethers;
    
    if (!ethers) {
      throw new Error("Ethers not available - make sure Hardhat node is running!");
    }

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    const Factory = await ethers.getContractFactory("TransactionRegistry");
    const contract = await Factory.deploy();

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    
    console.log("✅ Contract deployed to:", contractAddress);
    console.log("\n📋 Next steps:");
    console.log("1. Copy the contract address above");
    console.log("2. In your browser console run: setContractAddress('" + contractAddress + "')");
    console.log("3. Refresh the page\n");

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    const filePath = path.join(__dirname, '..', 'deployment-info.json');
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to deployment-info.json");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
