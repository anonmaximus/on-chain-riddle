import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
	const deploymentPath = path.join(__dirname, "..", "deployments", "sepolia.json");

	if (!fs.existsSync(deploymentPath)) {
		console.error("❌ Deployment file not found. Please deploy first.");
		return;
	}

	const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
	const contractAddress = deployment.contractAddress;

	console.log("🔍 Verifying contract on Etherscan...");
	console.log("📍 Contract address:", contractAddress);

	try {
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments: [],
		});

		console.log("✅ Contract verified successfully!");
		console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
	} catch (error: any) {
		if (error.message.includes("Already Verified")) {
			console.log("✅ Contract is already verified!");
		} else {
			console.error("❌ Verification failed:", error);
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
