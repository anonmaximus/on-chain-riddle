import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting OnchainRiddle deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("🔐 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Low balance! Make sure you have enough ETH for deployment");
  }

  console.log("📦 Deploying OnchainRiddle contract...");
  const OnchainRiddle = await ethers.getContractFactory("OnchainRiddle");
  const onchainRiddle = await OnchainRiddle.deploy();
  
  await onchainRiddle.waitForDeployment();
  const contractAddress = await onchainRiddle.getAddress();

  console.log("✅ OnchainRiddle deployed to:", contractAddress);
  console.log("🤖 Bot address (owner):", deployer.address);

  const deploymentInfo = {
    contractAddress,
    botAddress: deployer.address,
    network: "sepolia",
    deploymentTime: new Date().toISOString(),
    transactionHash: onchainRiddle.deploymentTransaction()?.hash,
  };

  const deploymentPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("📁 Deployment info saved to:", deploymentPath);

  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "OnchainRiddle.sol", "OnchainRiddle.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(__dirname, "..", "abi", "OnchainRiddle.json");
    fs.mkdirSync(path.dirname(abiPath), { recursive: true });
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log("📋 ABI saved to:", abiPath);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env with CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Copy the ABI to your backend project");
  console.log("3. Verify the contract on Etherscan (optional)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });