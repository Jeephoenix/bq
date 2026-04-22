const { ethers } = require("hardhat");

async function main() {
  const NEW_CORE  = "0xC4A0Ab083212D4bE28ffdFAc9456aE873fcb777d";
  const BOSSRAID  = "0x4D2420534569822a7230fc02079E5820CEfcC1E4";
  const BASEDSWAP = "0x942Fa39Bc20E165CbA26DcAF2e130C520BEd767B";

  const [signer] = await ethers.getSigners();
  console.log("Owner:", signer.address);

  const boss = new ethers.Contract(BOSSRAID, [
    "function setCoreContract(address) external",
    "function coreContract() view returns (address)",
  ], signer);
  const swap = new ethers.Contract(BASEDSWAP, [
    "function updateCoreContract(address) external",
    "function coreContract() view returns (address)",
  ], signer);

  console.log("BossRaid old core :", await boss.coreContract());
  let tx = await boss.setCoreContract(NEW_CORE);
  console.log("  setCoreContract tx:", tx.hash); await tx.wait();
  console.log("BossRaid new core :", await boss.coreContract());

  console.log("BasedSwap old core:", await swap.coreContract());
  tx = await swap.updateCoreContract(NEW_CORE);
  console.log("  updateCoreContract tx:", tx.hash); await tx.wait();
  console.log("BasedSwap new core:", await swap.coreContract());
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
