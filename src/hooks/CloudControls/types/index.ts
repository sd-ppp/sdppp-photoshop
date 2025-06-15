// Common API Response Interface
export interface ApiResponse<T> {
  code: string | number;
  msg: string;
  success?: boolean;
  result?: T;
}

// Common Error Interface
export interface ApiError {
  code: string | number;
  msg: string;
}

// Common Instance Interface
export interface Instance {
  id: string;
  name: string;
  status: string;
  gpu_model?: string;
  gpu_used?: number;
  cpu_model?: string;
  cpu_core_count?: number;
  memory_size?: number;
  system_disk_size?: number;
  data_disk_size?: number;
  price_per_hour?: number;
  ssh_port?: string;
  ssh_user?: string;
  password?: string;
  web_url?: string;
  start_timestamp?: number;
  stop_timestamp?: number;
  create_timestamp?: number;
  data_center_name?: string;
  public_image?: string;
  expandable_data_disk_size?: number;
  data_disk_mount_path?: string;
  storage_mount_path?: string;
  ssh_key?: string;
  jupyter_token?: string;
  jupyter_url?: string;
  xgcos_token?: string;
  xgcos_url?: string;
  progress?: number;
  image_id?: string;
  image_type?: string;
  image_price?: number;
  image_save?: boolean;
  base_price?: number;
  retain?: number;
  retain_price?: number;
  retain_size?: number;
  ssh_domain?: string;
}

// Common Balance Interface
export interface Balance {
  balance: number;
  cards?: Array<{
    id: string;
    name: string;
    balance: number;
  }>;
}

// Common Instance List Response
export interface InstanceListResponse {
  list?: Instance[];
  total?: number;
  instances?: Instance[];
}

// Common Balance Response
export interface BalanceResponse {
  balance: number;
  cards?: Array<{
    id: string;
    name: string;
    balance: number;
  }>;
}

// Common Instance Deployment Parameters
export interface DeployInstanceParams {
  gpu_model: string;
  gpu_count: number;
  data_center_id?: number;
  image: string;
  image_type: string;
  storage?: boolean;
  storage_mount_path?: string;
  ssh_key?: string;
  system_disk_expand?: boolean;
  system_disk_expand_size?: number;
  name?: string;
}

// Common Instance Start Parameters
export interface StartInstanceParams {
  id: string;
  gpu_model?: string;
  gpu_count?: string | number;
}

// Base Hook Configuration
export interface BaseHookConfig {
  apiKey: string;
  baseUrl: string;
} 