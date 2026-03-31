import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SentinelAlertRegistry } from '../typechain-types';

describe('SentinelAlertRegistry', function () {
  let registry: SentinelAlertRegistry;
  let publisher: any;
  let unauthorized: any;

  beforeEach(async function () {
    [publisher, unauthorized] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('SentinelAlertRegistry');
    registry = await factory.deploy(publisher.address);
    await registry.waitForDeployment();
  });

  describe('Deployment', function () {
    it('should set the correct authorized publisher', async function () {
      expect(await registry.authorizedPublisher()).to.equal(publisher.address);
    });

    it('should start with zero alerts', async function () {
      expect(await registry.getAlertCount()).to.equal(0);
    });
  });

  describe('Publishing Alerts', function () {
    it('should publish an alert from authorized publisher', async function () {
      const tx = await registry.publishAlert('BTC-PERP', 8500, 3);
      await tx.wait();

      expect(await registry.getAlertCount()).to.equal(1);

      const alert = await registry.getAlert(0);
      expect(alert.market).to.equal('BTC-PERP');
      expect(alert.cascadeProbability).to.equal(8500);
      expect(alert.severity).to.equal(3);
    });

    it('should emit AlertPublished event', async function () {
      await expect(registry.publishAlert('ETH-PERP', 7200, 2))
        .to.emit(registry, 'AlertPublished')
        .withArgs(
          0,
          publisher.address,
          'ETH-PERP',
          7200,
          2,
          await ethers.provider.getBlock('latest').then((b) => b!.timestamp + 1),
        );
    });

    it('should reject unauthorized publisher', async function () {
      await expect(
        registry.connect(unauthorized).publishAlert('BTC-PERP', 8500, 3),
      ).to.be.revertedWithCustomError(registry, 'NotAuthorized');
    });

    it('should reject invalid severity', async function () {
      await expect(
        registry.publishAlert('BTC-PERP', 8500, 0),
      ).to.be.revertedWithCustomError(registry, 'InvalidSeverity');

      await expect(
        registry.publishAlert('BTC-PERP', 8500, 4),
      ).to.be.revertedWithCustomError(registry, 'InvalidSeverity');
    });

    it('should reject probability > 10000', async function () {
      await expect(
        registry.publishAlert('BTC-PERP', 10001, 3),
      ).to.be.revertedWithCustomError(registry, 'InvalidProbability');
    });

    it('should track multiple alerts', async function () {
      await registry.publishAlert('BTC-PERP', 8500, 3);
      await registry.publishAlert('ETH-PERP', 6500, 2);
      await registry.publishAlert('SOL-PERP', 5500, 1);

      expect(await registry.getAlertCount()).to.equal(3);

      const alert2 = await registry.getAlert(1);
      expect(alert2.market).to.equal('ETH-PERP');
    });
  });
});
