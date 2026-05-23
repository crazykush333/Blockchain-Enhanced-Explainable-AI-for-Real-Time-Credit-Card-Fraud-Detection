const hre = require("hardhat");

async function main() {
  const { ethers } = hre;

  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    const pk = process.env.GANACHE_PRIVATE_KEY;
    if (pk) {
      console.log("⚙️ No signer from config; using wallet from GANACHE_PRIVATE_KEY.");
      const wallet = new ethers.Wallet(pk, ethers.provider);
      await deployWithSigner(wallet);
      return;
    }
    throw new Error("❌ No signer available. Add GANACHE_PRIVATE_KEY to .env or ensure Ganache node exposes accounts.");
  }

  await deployWithSigner(signers[0]);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});

async function deployWithSigner(deployer) {
  const { ethers } = hre;
  const fs = require("fs");
  const path = require("path");

  console.log("🧾 Using signer address:", deployer.address);

  console.log("🚀 Deploying TransactionRegistry contract...");

  const Factory = await ethers.getContractFactory("TransactionRegistry", deployer);
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, '..', 'src', 'config', 'deployment-info.json');
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployment-info.json");
}
