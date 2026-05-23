import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying TransactionRegistry contract...");

  try {
    console.log("Network:", hre.network.name);
    console.log("Getting signers...");
    
    const ethers = hre.ethers;
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    console.log("Getting contract factory...");
    const Factory = await ethers.getContractFactory("TransactionRegistry");
    console.log("Deploying contract...");
    
    const contract = await Factory.deploy();
    console.log("Waiting for deployment...");

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    
    console.log("\n✅ Contract deployed to:", contractAddress);
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
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
