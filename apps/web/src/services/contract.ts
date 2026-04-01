import { ethers } from 'ethers';

const ALERT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_ALERT_REGISTRY_ADDRESS || '';
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';

const ABI = [
  'function getAlertCount() view returns (uint256)',
  'function getAlert(uint256 alertId) view returns (tuple(string market, uint256 cascadeProbability, uint8 severity, uint256 timestamp))',
  'function alerts(uint256) view returns (string market, uint256 cascadeProbability, uint8 severity, uint256 timestamp)',
  'event AlertPublished(uint256 indexed alertId, address indexed publisher, string market, uint256 probability, uint8 severity, uint256 timestamp)',
];

export interface OnChainAlert {
  id: number;
  market: string;
  probability: number;
  severity: number;
  timestamp: number;
}

function getProvider() {
  return new ethers.JsonRpcProvider(ARBITRUM_RPC);
}

function getContract() {
  if (!ALERT_REGISTRY_ADDRESS) return null;
  return new ethers.Contract(ALERT_REGISTRY_ADDRESS, ABI, getProvider());
}

export async function getAlertCount(): Promise<number> {
  const contract = getContract();
  if (!contract) return 0;
  const count = await contract.getAlertCount();
  return Number(count);
}

export async function getRecentAlerts(limit = 10): Promise<OnChainAlert[]> {
  const contract = getContract();
  if (!contract) return [];

  const count = await contract.getAlertCount();
  const total = Number(count);
  if (total === 0) return [];

  const start = Math.max(0, total - limit);
  const alerts: OnChainAlert[] = [];

  for (let i = total - 1; i >= start; i--) {
    try {
      const alert = await contract.getAlert(i);
      alerts.push({
        id: i,
        market: alert.market,
        probability: Number(alert.cascadeProbability) / 100,
        severity: Number(alert.severity),
        timestamp: Number(alert.timestamp),
      });
    } catch {
      break;
    }
  }

  return alerts;
}

export async function subscribeToAlerts(
  callback: (alert: OnChainAlert & { txHash: string }) => void
): Promise<() => void> {
  const contract = getContract();
  if (!contract) return () => {};

  const handler = (
    alertId: bigint,
    _publisher: string,
    market: string,
    probability: bigint,
    severity: bigint,
    timestamp: bigint,
    event: ethers.EventLog
  ) => {
    callback({
      id: Number(alertId),
      market,
      probability: Number(probability) / 100,
      severity: Number(severity),
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    });
  };

  contract.on('AlertPublished', handler);
  return () => { contract.off('AlertPublished', handler); };
}
