// Instance related interfaces
export interface Instance {
  uuid: string;
  title: string;
  pod_uuid: string;
  pod_title: string;
  pod_name: string;
  pod_price: string;
  pod_startup_elapse: number;
  image_tag: string;
  out_web_url: string;
  category: number;
  gpus: number;
  no_card: number;
  gpu_model_name: string;
  charging_type: number;
  charging_type_name: string;
  charging_num: number;
  price_h: number;
  instance_type_txt: string;
  status: number;
  status_txt: string;
}

// Response interfaces
export interface BaseResponse<T> {
  code: string;
  msg: string;
  result: T;
}

export interface InstanceListResponse {
  total: number;
  instance: Instance[];
}

export interface GPUModel {
  uuid: string;
  title: string;
  desc: string;
  price: string;
  remark: string;
  status: number;
  status_txt: string;
  created_at: string;
  free_txt: string;
}

export interface GPUListResponse {
  total: string;
  no_card_price: number;
  items: GPUModel[];
}

export interface BalanceResponse {
  cards: Array<{
    uuid: string;
    title: string;
    card_no: string;
    valid_days: number;
    bind_time: string;
    expire_date: string;
    bind_txt: string;
    sale_price: number;
    face_price: number;
    leave_amount: number;
    pods: Record<string, any>;
    remark: string;
    status: number;
    status_txt: string;
  }>;
  balance: string;
}

// Request interfaces
export interface CreateInstanceRequest {
  pod_uuid: string;
  image_uuid?: string;
  image_tag: string;
  gpu_model_uuid: string;
  auto_start?: number;
}

export interface InstanceListRequest {
  page?: number;
  page_size?: number;
  status: number;
}

export interface ScheduledShutdownRequest {
  instance_uuid: string;
  regular_time?: string;
  cancel?: boolean;
}

// API URL configuration
const API_URLS = {
  INSTANCES: 'https://www.chenyu.cn/api/v1/app/instance/list',
  INSTANCE_CREATE: 'https://www.chenyu.cn/api/v1/app/instance/create',
  INSTANCE_START: 'https://www.chenyu.cn/api/v1/app/instance/start',
  INSTANCE_STOP: 'https://www.chenyu.cn/api/v1/app/instance/stop',
  INSTANCE_RESTART: 'https://www.chenyu.cn/api/v1/app/instance/restart',
  INSTANCE_STATUS: 'https://www.chenyu.cn/api/v1/app/instance/status',
  INSTANCE_SCHEDULED_SHUTDOWN: 'https://www.chenyu.cn/api/v1/app/instance/scheduled/shutdown',
  GPU_MODELS: 'https://www.chenyu.cn/api/v1/gpu/models',
  BALANCE: 'https://www.chenyu.cn/api/v1/finances/balance',
} as const;

export interface ChenyuAPI {
  getInstanceList: (params: InstanceListRequest) => Promise<BaseResponse<InstanceListResponse>>;
  createInstance: (params: CreateInstanceRequest) => Promise<BaseResponse<any>>;
  startInstance: (instanceUuid: string) => Promise<BaseResponse<any>>;
  stopInstance: (instanceUuid: string, shutdownReason?: string) => Promise<BaseResponse<any>>;
  restartInstance: (instanceUuid: string) => Promise<BaseResponse<any>>;
  getInstanceStatus: (instanceUuid: string) => Promise<BaseResponse<any>>;
  scheduleShutdown: (params: ScheduledShutdownRequest) => Promise<BaseResponse<any>>;
  getGPUModels: () => Promise<BaseResponse<GPUListResponse>>;
  getBalance: () => Promise<BaseResponse<any>>;
}

export const createChenyuAPI = (apikey: string): ChenyuAPI => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apikey}`,
  };

  return {
    getInstanceList: async (params: InstanceListRequest): Promise<BaseResponse<InstanceListResponse>> => {
      const response = await fetch(API_URLS.INSTANCES, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      return response.json();
    },

    createInstance: async (params: CreateInstanceRequest): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      return response.json();
    },

    startInstance: async (instanceUuid: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_START, {
        method: 'POST',
        headers,
        body: JSON.stringify({ instance_uuid: instanceUuid }),
      });
      return response.json();
    },

    stopInstance: async (instanceUuid: string, shutdownReason?: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_STOP, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          instance_uuid: instanceUuid,
          shutdown_reason: shutdownReason 
        }),
      });
      return response.json();
    },

    restartInstance: async (instanceUuid: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_RESTART, {
        method: 'POST',
        headers,
        body: JSON.stringify({ instance_uuid: instanceUuid }),
      });
      return response.json();
    },

    getInstanceStatus: async (instanceUuid: string): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_STATUS, {
        method: 'POST',
        headers,
        body: JSON.stringify({ instance_uuid: instanceUuid }),
      });
      return response.json();
    },

    scheduleShutdown: async (params: ScheduledShutdownRequest): Promise<BaseResponse<any>> => {
      const response = await fetch(API_URLS.INSTANCE_SCHEDULED_SHUTDOWN, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      return response.json();
    },

    getGPUModels: async (): Promise<BaseResponse<GPUListResponse>> => {
      const response = await fetch(API_URLS.GPU_MODELS, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      return response.json();
    },

    getBalance: async (): Promise<BaseResponse<BalanceResponse>> => {
      const response = await fetch(API_URLS.BALANCE, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      return response.json();
    },
  };
};
