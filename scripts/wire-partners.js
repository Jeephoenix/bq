const { ethers } = require("hardhat");

async function main() {
  const NEW_CORE  = "0xC4A0Ab083212D4bE28ffdFAc9456aE873fcb777d";
  const BOSSRAID  = "0x4D2420534569822a7230fc02079E5820CEfcC1E4";
  const BASEDSWAP = "0x942Fa39Bc20E165CbA26DcAF2e130C520BEd767B";

  const [signer] = await ethers.getSigners();
  const core = await ethers.getContractAt("BaseQuestCore", NEW_CORE, signer);
  console.log("Owner:", signer.address);

  for (const [name, addr] of [["BossRaid", BOSSRAID], ["BasedSwap", BASEDSWAP]]) {
    const tx = await core.setPartnerContract(addr, true);
    console.log(`${name} (${addr}): tx ${tx.hash}`);
    await tx.wait();
    const ok = await core.isPartnerContract(addr);
    console.log(`  → isPartnerContract = ${ok}`);
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
