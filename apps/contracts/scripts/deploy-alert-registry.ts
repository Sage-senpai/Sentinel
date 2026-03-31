import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying SentinelAlertRegistry with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const factory = await ethers.getContractFactory('SentinelAlertRegistry');
  const registry = await factory.deploy(deployer.address);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log('SentinelAlertRegistry deployed to:', address);

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentDir = path.join(__dirname, '..', 'deployments', network.name);
  fs.mkdirSync(deploymentDir, { recursive: true });

  const deploymentInfo = {
    address,
    deployer: deployer.address,
    network: network.name,
    chainId: Number(network.chainId),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentDir, 'SentinelAlertRegistry.json'),
    JSON.stringify(deploymentInfo, null, 2),
  );

  console.log('Deployment info saved to:', path.join(deploymentDir, 'SentinelAlertRegistry.json'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
