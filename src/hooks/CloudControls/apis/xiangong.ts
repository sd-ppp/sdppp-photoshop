// Instance related interfaces
export interface Instance {
  id: string;
  create_timestamp: number;
  data_center_name: string;
  name: string;
  public_image: string;
  gpu_model: string;
  gpu_used: number;
  cpu_model: string;
  cpu_core_count: number;
  memory_size: number;
  system_disk_size: number;
  data_disk_size: number;
  expandable_data_disk_size: number;
  data_disk_mount_path: string;
  storage_mount_path: string;
  price_per_hour: number;
  ssh_key: string;
  ssh_port: string;
  ssh_user: string;
  password: string;
  jupyter_token: string;
  jupyter_url: string;
  xgcos_token: string;
  xgcos_url: string;
  start_timestamp: number;
  stop_timestamp: number;
  status: 'deploying' | 'running' | 'booting' | 'shutting_down' | 'shutdown' | 'destroying' | 'destroyed' | 'saving_image' | 'freezing' | 'freeze' | 'replacing_image';
  ssh_domain: string;
  web_url: string;
  progress: number;
  image_id: string;
  image_type: string;
  image_price: number;
  image_save: boolean;
  base_price: number;
  retain: number;
  retain_price: number;
  retain_size: number;
}

// Response interfaces
export interface BaseResponse<T> {
  code: number;
  msg: string;
  success: boolean;
  data: T
}

export interface InstanceListResponse {
  list: Instance[];
  total: number;
}

export interface InstanceResponse {
  id: string;
}

export interface BalanceResponse {
  balance: number;
}

// Request interfaces
export interface DeployInstanceRequest {
  gpu_model: string;
  gpu_count: number;
  data_center_id: number;
  image: string;
  image_type: 'public' | 'community' | 'private';
  storage?: boolean;
  storage_mount_path?: string;
  ssh_key?: string;
  system_disk_expand?: boolean;
  system_disk_expand_size?: number;
  name?: string;
}

export interface StartInstanceRequest {
  id: string;
  gpu_model?: string;
  gpu_count?: string;
}

// API URL configuration
const API_URLS = {
  INSTANCES: 'https://api.xiangongyun.com/open/instances',
  INSTANCE_DETAIL: (id: string) => `https://api.xiangongyun.com/open/instance/${id}`,
  INSTANCE_DESTROY: 'https://api.xiangongyun.com/open/instance/destroy',
  INSTANCE_DEPLOY: 'https://api.xiangongyun.com/open/instance/deploy',
  INSTANCE_SHUTDOWN_WITH_GPU: 'https://api.xiangongyun.com/open/instance/shutdown',
  INSTANCE_SHUTDOWN_WITHOUT_GPU: 'https://api.xiangongyun.com/open/instance/shutdown_release_gpu',
  INSTANCE_SHUTDOWN_AND_DESTROY: 'https://api.xiangongyun.com/open/instance/shutdown_destroy',
  INSTANCE_START: 'https://api.xiangongyun.com/open/instance/boot',
  BALANCE: 'https://api.xiangongyun.com/open/balance',
} as const;

export interface XiangongAPI {
  getInstanceList: () => Promise<BaseResponse<InstanceListResponse>>;
  getInstanceInfo: (id: string) => Promise<BaseResponse<Instance>>;
  destroyInstance: (id: string) => Promise<BaseResponse<any>>;
  deployInstance: (params: DeployInstanceRequest) => Promise<BaseResponse<InstanceResponse>>;
  shutdownWithGPU: (id: string) => Promise<BaseResponse<any>>;
  shutdownWithoutGPU: (id: string) => Promise<BaseResponse<any>>;
  shutdownAndDestroy: (id: string) => Promise<BaseResponse<any>>;
  startInstance: (params: StartInstanceRequest) => Promise<BaseResponse<any>>;
  getBalance: () => Promise<BaseResponse<BalanceResponse>>;
}

export const createXiangongAPI = (apikey: string): XiangongAPI => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': apikey,
  };

  return {
    getInstanceList: async (): Promise<BaseResponse<InstanceListResponse>> => {
      const response = await fetch(API_URLS.INSTANCES, { headers });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    getInstanceInfo: async (id: string): Promise<BaseResponse<Instance>> => {
      const response = await fetch(API_URLS.INSTANCE_DETAIL(id), { headers });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    destroyInstance: async (id: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_DESTROY, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id }),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    deployInstance: async (params: DeployInstanceRequest): Promise<BaseResponse<InstanceResponse>> => {
      const response = await fetch(API_URLS.INSTANCE_DEPLOY, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    shutdownWithGPU: async (id: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_SHUTDOWN_WITH_GPU, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id }),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    shutdownWithoutGPU: async (id: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_SHUTDOWN_WITHOUT_GPU, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id }),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    shutdownAndDestroy: async (id: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_SHUTDOWN_AND_DESTROY, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id }),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    startInstance: async (params: StartInstanceRequest): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_START, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },

    getBalance: async (): Promise<BaseResponse<BalanceResponse>> => {
      const response = await fetch(API_URLS.BALANCE, { headers });
      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      if (json.code !== 0 && json.code !== 200) {
        throw new Error(json.msg);
      }
      return json;
    },
  };
};
