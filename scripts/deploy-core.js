const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Balance :", ethers.formatEther(bal), "ETH");

  const Core = await ethers.getContractFactory("BaseQuestCore");
  const core = await Core.deploy();
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log("\n✓ BaseQuestCore deployed at:", coreAddress);

  const out = path.join(__dirname, "..", "deployments-core.json");
  fs.writeFileSync(out, JSON.stringify({
    network: "base-mainnet", chainId: 8453,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    BaseQuestCore: coreAddress,
  }, null, 2));
  console.log("\nWrote", out);
  console.log("\nNext steps:");
  console.log("  1. Set on Vercel:  VITE_CORE_CONTRACT=" + coreAddress);
  console.log("  2. Run migration:");
  console.log("     OLD_CORE=0xF30C3ab72B1759208A1d87266023B983b7053236 \\");
  console.log("     NEW_CORE=" + coreAddress + " \\");
  console.log("     npx hardhat run scripts/migrate.js --network base");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
