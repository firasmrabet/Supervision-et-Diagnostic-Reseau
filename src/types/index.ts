export interface NetworkDevice {
  id: string;
  name: string;
  type: string;
  ip: string;
  mac?: string;
  device_type?: string;
  status: "online" | "warning" | "offline";
  latency: number;
  bandwidth: number;
  last_seen: string;
}

export interface NetworkAlert {
  id: number;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface NetworkStats {
  devices_online: number;
  devices_total: number;
  bandwidth_used: number;
  bandwidth_total: number;
  latency_avg: number;
  packet_loss: number;
  uptime_percent: number;
  alerts_active: number;
  throughput_mbps: number;
  signal_strength: number;
}

export interface AIProvider {
  available: boolean;
  name: string;
  models: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  model?: string;
  timestamp?: string;
}

export interface DiagnosisResult {
  diagnosis: string;
  provider: string;
  model: string;
}

export interface MultiAnalysis {
  diagnostic?: { choices?: { message: { content: string } }[] };
  analysis?: { choices?: { message: { content: string } }[] };
  security?: { choices?: { message: { content: string } }[] };
  error?: string;
}
